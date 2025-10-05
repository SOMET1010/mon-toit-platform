# Guide de Sécurité - Mon Toit

Ce document détaille les pratiques de sécurité implémentées dans l'application Mon Toit et les bonnes pratiques à suivre pour maintenir la sécurité du système.

## Table des matières

1. [Architecture de sécurité](#architecture-de-sécurité)
2. [Système de rôles](#système-de-rôles)
3. [Protection des routes](#protection-des-routes)
4. [Audit et logging](#audit-et-logging)
5. [Bonnes pratiques](#bonnes-pratiques)
6. [Checklist de sécurité](#checklist-de-sécurité)

## Architecture de sécurité

### Principes fondamentaux

- **Défense en profondeur** : Plusieurs couches de sécurité (frontend, backend, database)
- **Principe du moindre privilège** : Les utilisateurs n'ont que les permissions nécessaires
- **Validation côté serveur** : Toujours valider les données côté serveur (RLS policies, SECURITY DEFINER functions)
- **Audit complet** : Toutes les actions sensibles sont loggées

### Composants de sécurité

1. **Row-Level Security (RLS)** : Politiques au niveau de la base de données
2. **Security Definer Functions** : Fonctions sécurisées pour vérifier les rôles
3. **Protected Routes** : Composants React pour protéger les routes
4. **Audit Logging** : Système de journalisation des actions admin

## Système de rôles

### Rôles disponibles

Les rôles sont stockés dans la table `public.user_roles` avec l'enum `app_role` :

- `user` : Utilisateur standard (attribué automatiquement)
- `admin` : Administrateur de la plateforme
- `super_admin` : Super administrateur avec tous les privilèges
- `tiers_de_confiance` : Tiers de confiance pour validation de dossiers

### Structure de la base de données

```sql
-- Enum des rôles
CREATE TYPE public.app_role AS ENUM (
  'user', 
  'admin', 
  'super_admin', 
  'tiers_de_confiance'
);

-- Table des rôles utilisateur
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
```

### Fonction de vérification sécurisée

```sql
-- Fonction pour vérifier si un utilisateur a un rôle
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**IMPORTANT** : Toujours utiliser `SECURITY DEFINER` pour éviter les problèmes de récursion RLS.

### Vérification côté client

Utiliser le hook `useAuth()` :

```typescript
const { hasRole } = useAuth();

if (hasRole('admin')) {
  // Afficher le contenu admin
}
```

### Vérification côté serveur

Utiliser la fonction RPC `verify_user_role` :

```typescript
const { data: isAdmin } = await supabase.rpc('verify_user_role', {
  _role: 'admin'
});
```

## Protection des routes

### ProtectedRoute - Protection par user_type

```tsx
<ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
  <MyProperties />
</ProtectedRoute>
```

### ProtectedRoute - Protection par rôles

```tsx
// Exige AU MOINS un des rôles
<ProtectedRoute requiredRoles={['admin', 'super_admin']}>
  <AdminDashboard />
</ProtectedRoute>

// Exige TOUS les rôles
<ProtectedRoute 
  requiredRoles={['admin', 'tiers_de_confiance']} 
  requireAll={true}
>
  <SpecialPage />
</ProtectedRoute>
```

### RoleProtectedRoute - Protection avancée

```tsx
<RoleProtectedRoute 
  requiredRoles={['super_admin']} 
  fallbackPath="/dashboard"
>
  <SuperAdminPanel />
</RoleProtectedRoute>
```

### Hooks de permission

```typescript
// Hook pour exiger un seul rôle
import { useRequireRole } from '@/hooks/useRequireRole';
const { hasRole, loading } = useRequireRole('admin', '/');

// Hook pour exiger plusieurs rôles
import { useRequireRoles } from '@/hooks/useRequireRoles';
const { hasAccess, loading } = useRequireRoles(['admin', 'super_admin'], false);

// Hook centralisé pour toutes les permissions
import { usePermissions } from '@/hooks/usePermissions';
const { canAccessAdminDashboard, canEditProperty } = usePermissions();
```

## Audit et logging

### Table admin_audit_logs

Toutes les actions sensibles sont loggées dans `public.admin_audit_logs` :

- Changements de rôles
- Modération de propriétés
- Certification de baux
- Résolution de litiges
- Tentatives de connexion admin

### Triggers de logging

```sql
-- Exemple : Logger la modération de propriétés
CREATE TRIGGER log_property_moderation_trigger
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  WHEN (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status)
  EXECUTE FUNCTION public.log_property_moderation();
```

### Consultation des logs

Les admins peuvent consulter leurs propres logs. Les super_admins peuvent voir tous les logs.

```typescript
const { data: auditLogs } = await supabase
  .from('admin_audit_logs')
  .select('*')
  .order('created_at', { ascending: false });
```

## Bonnes pratiques

### ❌ À NE JAMAIS FAIRE

1. **Ne jamais stocker les rôles dans localStorage**
   ```typescript
   // ❌ MAUVAIS
   localStorage.setItem('userRole', 'admin');
   ```

2. **Ne jamais vérifier les permissions uniquement côté client**
   ```typescript
   // ❌ INSUFFISANT (doit être complété par vérification serveur)
   if (hasRole('admin')) {
     await deleteUser(userId);
   }
   ```

3. **Ne jamais faire confiance aux données du client**
   ```typescript
   // ❌ DANGEREUX
   const { data } = await supabase
     .from('properties')
     .update({ owner_id: newOwnerId }); // Pas de vérification
   ```

4. **Ne jamais utiliser SECURITY INVOKER pour les fonctions de rôles**
   ```sql
   -- ❌ MAUVAIS (cause des problèmes de récursion)
   CREATE FUNCTION has_role() ... SECURITY INVOKER
   ```

### ✅ BONNES PRATIQUES

1. **Toujours valider côté serveur avec RLS**
   ```sql
   CREATE POLICY "Users can only update their own properties"
   ON public.properties FOR UPDATE
   USING (auth.uid() = owner_id);
   ```

2. **Utiliser SECURITY DEFINER pour les fonctions de vérification**
   ```sql
   CREATE FUNCTION public.has_role(...)
   SECURITY DEFINER
   SET search_path = public
   ```

3. **Double vérification : client + serveur**
   ```typescript
   // ✅ BON : Vérification client pour UX
   if (!hasRole('admin')) {
     toast.error('Accès refusé');
     return;
   }
   
   // ✅ BON : Vérification serveur pour sécurité
   const { data, error } = await supabase.rpc('admin_action', { ... });
   ```

4. **Logger toutes les actions sensibles**
   ```typescript
   // Dans la fonction RPC côté serveur
   INSERT INTO admin_audit_logs (admin_id, action_type, ...)
   VALUES (auth.uid(), 'user_deleted', ...);
   ```

### Ajout d'un nouveau rôle

1. **Ajouter à l'enum** (via migration)
   ```sql
   ALTER TYPE public.app_role ADD VALUE 'new_role';
   ```

2. **Créer les policies RLS nécessaires**
   ```sql
   CREATE POLICY "New role can access feature"
   ON public.feature_table
   FOR SELECT
   USING (has_role(auth.uid(), 'new_role'));
   ```

3. **Mettre à jour les composants frontend**
   ```typescript
   // Ajouter dans usePermissions.tsx
   canAccessNewFeature: hasRole('new_role'),
   ```

4. **Documenter le nouveau rôle**
   - Ajouter dans `ROLES_AND_PERMISSIONS.md`
   - Mettre à jour ce guide

## Checklist de sécurité

Avant de merger une PR contenant des changements de sécurité :

### Backend
- [ ] Les RLS policies sont activées sur toutes les nouvelles tables
- [ ] Les fonctions sensibles utilisent `SECURITY DEFINER`
- [ ] Les triggers de logging sont en place pour les actions admin
- [ ] Aucune référence directe à `auth.users` dans les policies
- [ ] Les fonctions RPC vérifient les permissions côté serveur

### Frontend
- [ ] Les routes sensibles utilisent `ProtectedRoute` ou `RoleProtectedRoute`
- [ ] Aucune vérification de rôle basée sur `localStorage`
- [ ] Les actions sensibles ont une double vérification (client + serveur)
- [ ] Les messages d'erreur ne révèlent pas d'informations sensibles
- [ ] Les hooks de permission sont utilisés correctement

### Audit
- [ ] Les nouvelles actions admin sont loggées dans `admin_audit_logs`
- [ ] Les logs incluent toutes les informations nécessaires (old_values, new_values)
- [ ] Les logs ne contiennent pas de données sensibles en clair

### Tests
- [ ] Tester l'accès refusé pour les utilisateurs non autorisés
- [ ] Tester l'escalade de privilèges (un admin ne peut pas se promouvoir super_admin)
- [ ] Tester les cas limites (user non connecté, user sans rôle, etc.)

### Documentation
- [ ] Les nouveaux rôles sont documentés
- [ ] Les nouvelles permissions sont listées
- [ ] Les exemples de code sont à jour

## Protection contre l'escalade de privilèges

### Vérifications essentielles

1. **Fonction `promote_to_super_admin`** vérifie que l'appelant est déjà super_admin
2. **RLS sur `user_roles`** : les utilisateurs ne peuvent que voir leurs propres rôles
3. **Pas d'insertion directe** : seules les fonctions RPC peuvent modifier les rôles
4. **Audit complet** : tout changement de rôle est loggé

### Exemple sécurisé de promotion

```sql
CREATE FUNCTION public.promote_to_super_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ✅ Vérification : seul un super_admin peut promouvoir
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super-admins can promote users';
  END IF;
  
  -- ✅ Log de l'action
  INSERT INTO admin_audit_logs (admin_id, action_type, target_id)
  VALUES (auth.uid(), 'role_assigned', target_user_id);
  
  -- ✅ Attribution du rôle
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'super_admin');
END;
$$;
```

## Support

Pour toute question de sécurité :
- Consulter `ROLES_AND_PERMISSIONS.md` pour la liste complète des permissions
- Vérifier les logs d'audit en cas de suspicion d'activité suspecte
- Contacter l'équipe de sécurité en cas de vulnérabilité découverte
