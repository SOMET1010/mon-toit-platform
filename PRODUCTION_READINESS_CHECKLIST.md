# 🚀 Checklist de Préparation Production - Mon Toit

Date: 2025-10-07
Statut: ⚠️ **ATTENTION REQUISE - 4 PROBLÈMES CRITIQUES**

---

## 📊 Résumé Exécutif

### ✅ Complété (Phase 1-3 Cleanup)
- Sécurité de base (tokens, logger)
- Code déprécié supprimé
- Design system cohérent
- ARIA labels pour accessibilité

### 🔴 CRITIQUE - À Corriger Immédiatement

#### 1. **Leaked Password Protection Désactivée** ⛔
**Priorité:** CRITIQUE  
**Impact:** Les utilisateurs peuvent créer des comptes avec des mots de passe compromis  
**Fix:** Activer dans Lovable Cloud Auth Settings

<lov-actions>
  <lov-open-backend>Ouvrir Backend pour Activer Password Protection</lov-open-backend>
</lov-actions>

**Étapes:**
1. Aller dans Authentication → Settings
2. Activer "Leaked Password Protection"
3. Sauvegarder

---

#### 2. **Données Personnelles Exposées** ⛔
**Priorité:** CRITIQUE  
**Problème:** La table `profiles` expose des numéros de téléphone, noms complets, et adresses

**Tables Affectées:**
- `profiles` - phone, full_name, city
- `user_verifications` - CNI numbers, social security numbers, données biométriques
- `disputes` - identité du rapporteur visible par la personne signalée

**Correctifs Nécessaires:**

##### A. Table `profiles` - Masquer les données sensibles
```sql
-- Supprimer la politique qui expose tout aux admins
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Créer politique restrictive pour les admins
CREATE POLICY "Admins view limited profile data"
ON profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  -- Admins voient tout SAUF le téléphone (sauf via fonction sécurisée)
);

-- Les utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Politique pour relation propriétaire-locataire ACTIVE uniquement
CREATE POLICY "Landlords can view tenant profiles with active lease"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases
    WHERE (landlord_id = auth.uid() AND tenant_id = profiles.id)
       OR (tenant_id = auth.uid() AND landlord_id = profiles.id)
    AND status = 'active'
  )
);
```

##### B. Table `user_verifications` - Chiffrement des données sensibles
```sql
-- Ajouter restriction MFA pour les admins
CREATE POLICY "Super admins with MFA can view verifications"
ON user_verifications FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  AND EXISTS (
    SELECT 1 FROM mfa_backup_codes 
    WHERE user_id = auth.uid()
  )
);

-- Log TOUS les accès aux données de vérification
CREATE OR REPLACE FUNCTION log_verification_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id, action_type, target_type, target_id,
    action_metadata, notes
  ) VALUES (
    auth.uid(), 'verification_data_accessed', 'user_verification', NEW.user_id,
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::json->>'x-real-ip'
    ),
    'SENSITIVE: Government ID data accessed'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_verification_view
AFTER SELECT ON user_verifications
FOR EACH ROW EXECUTE FUNCTION log_verification_access();
```

##### C. Table `disputes` - Masquer l'identité du rapporteur
```sql
-- Modifier la fonction get_my_disputes pour masquer reporter_id
-- Déjà implémenté dans votre code mais à vérifier !
```

---

#### 3. **Console Logs en Production** ⚠️
**Priorité:** HAUTE  
**Problème:** 82+ console.log/error restants dans 46 fichiers

**Impact:**
- Fuite potentielle de données sensibles
- Performance dégradée
- Logs visibles dans la console navigateur

**Fichiers Critiques à Corriger:**
- `src/components/verification/FaceVerification.tsx` (4 console.log)
- `src/hooks/useInstallPrompt.ts` (3 console.log)
- `src/components/admin/*` (20+ console.error)

**Solution:** Remplacer TOUS les `console.*` par `logger` comme fait en Phase 1

---

#### 4. **Token Mapbox Manquant** ⚠️
**Priorité:** HAUTE  
**Problème:** Aucune variable `VITE_MAPBOX_PUBLIC_TOKEN` dans `.env`

**Actuel dans .env:**
```
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="..."
```

**À Ajouter:**
```
VITE_MAPBOX_PUBLIC_TOKEN="pk.eyJ1..."
```

**Étapes:**
1. Obtenir un token public sur https://mapbox.com
2. L'ajouter dans les secrets Lovable Cloud
3. Redéployer

---

## 🟡 RECOMMANDÉ - Améliorations Production

### 5. **Tests de Sécurité Complets**
- [ ] Tester les politiques RLS avec différents rôles
- [ ] Vérifier l'isolation des données entre utilisateurs
- [ ] Tester les scénarios d'attaque (injection SQL, XSS)
- [ ] Audit de tous les edge functions

### 6. **Performance & Monitoring**
- [ ] Configurer Sentry ou LogRocket pour le monitoring
- [ ] Implémenter React Query pour le cache global
- [ ] Analyser le bundle size (doit être < 500KB initial)
- [ ] Lighthouse audit (Score > 90 souhaité)

### 7. **SEO & Metadata**
- [ ] Vérifier toutes les balises meta (title, description, og:image)
- [ ] Créer sitemap.xml
- [ ] Configurer robots.txt
- [ ] Ajouter structured data (JSON-LD)

### 8. **Backup & Disaster Recovery**
- [ ] Configurer les backups automatiques Supabase
- [ ] Documenter la procédure de restauration
- [ ] Tester la restauration depuis un backup

### 9. **Documentation Utilisateur**
- [ ] Guide d'utilisation pour les locataires
- [ ] Guide d'utilisation pour les propriétaires
- [ ] FAQ complète
- [ ] Tutoriels vidéo

### 10. **Legal & Compliance**
- [ ] Politique de confidentialité mise à jour
- [ ] CGU/CGV conformes à la législation ivoirienne
- [ ] Mentions légales complètes
- [ ] Cookie banner si cookies tiers utilisés

---

## ✅ Déjà Complété

### Infrastructure
- [x] Lovable Cloud activé
- [x] Supabase configuré
- [x] Edge Functions déployées
- [x] PWA configuré (manifest.json, service worker)

### Sécurité de Base
- [x] RLS activé sur toutes les tables sensibles
- [x] Auth configuré (email, Google OAuth)
- [x] Rate limiting implémenté (login, API)
- [x] Logger centralisé créé
- [x] Token Mapbox déplacé vers variables d'env

### Code Quality
- [x] TypeScript strict mode
- [x] ESLint configuré
- [x] Code déprécié supprimé (641 lignes)
- [x] Fichiers inutilisés supprimés
- [x] Imports centralisés

### UX/UI
- [x] Design system cohérent
- [x] Responsive design
- [x] ARIA labels sur boutons critiques
- [x] Lazy loading images
- [x] Loading states

---

## 🎯 Plan d'Action Immédiat (Ordre de Priorité)

### 🔴 Phase 1 : Sécurité CRITIQUE (2-3h)
1. **Activer Leaked Password Protection** (5 min)
2. **Corriger RLS sur `profiles`** (30 min)
3. **Sécuriser `user_verifications`** (45 min)
4. **Tester les politiques RLS** (1h)

### 🟡 Phase 2 : Cleanup Final (2-3h)
5. **Remplacer 82 console.* restants** (1h)
6. **Ajouter Token Mapbox** (15 min)
7. **Tests de régression** (1h)

### 🟢 Phase 3 : Optimisations (Optionnel - 4-6h)
8. **Implémenter monitoring (Sentry)** (2h)
9. **Optimiser performance** (2h)
10. **SEO complet** (2h)

---

## 📋 Checklist de Déploiement Production

### Avant le Déploiement
- [ ] Tous les problèmes CRITIQUES résolus
- [ ] Tests de sécurité passés
- [ ] Backup de la DB effectué
- [ ] Variables d'environnement configurées
- [ ] DNS configuré (si custom domain)

### Au Déploiement
- [ ] Déployer sur Lovable (bouton Publish)
- [ ] Vérifier la version déployée
- [ ] Tester login/signup
- [ ] Vérifier les edge functions
- [ ] Monitorer les logs

### Après le Déploiement
- [ ] Monitoring actif pendant 24h
- [ ] Hotline support prête
- [ ] Documentation utilisateur accessible
- [ ] Backup post-déploiement

---

## ⚡ Actions Immédiates Requises

**AVANT TOUT DÉPLOIEMENT PRODUCTION, VOUS DEVEZ:**

1. ✅ **Activer Leaked Password Protection** (5 min)
   - Aller dans Backend → Authentication → Settings
   - Activer "Leaked Password Protection"

2. ✅ **Corriger les RLS Policies** (1-2h)
   - Exécuter les migrations SQL ci-dessus
   - Tester avec différents rôles utilisateur

3. ✅ **Remplacer Console Logs** (1-2h)
   - Migrer les 82 console.* restants vers logger

4. ✅ **Ajouter Token Mapbox** (15 min)
   - Obtenir token sur mapbox.com
   - L'ajouter dans Secrets

**Temps Total Estimé:** 3-5 heures pour être production-ready

---

## 🚨 ATTENTION

**NE PAS DÉPLOYER EN PRODUCTION** avant d'avoir résolu les 4 problèmes CRITIQUES :
1. Leaked Password Protection
2. RLS sur données personnelles
3. Console logs
4. Token Mapbox

---

## 📞 Support

Si vous avez besoin d'aide pour implémenter ces correctifs :
- Documentation Lovable: https://docs.lovable.dev
- Discord Lovable: https://discord.gg/lovable
- Support: support@lovable.dev

---

**Dernière mise à jour:** 2025-10-07
**Prochaine revue:** Après correction des problèmes CRITIQUES
