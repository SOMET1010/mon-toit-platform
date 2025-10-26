# Audit des Couleurs - Mon Toit

## Palette Actuelle Extraite de tailwind.config.ts

### Couleurs Principales

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Primary (Orange vif)** | #FF6B35 | Boutons principaux, liens, accents |
| **Secondary (Terracotta)** | #E07A5F | Boutons secondaires, badges |
| **Accent (Lagune)** | #00B4D8 | Éléments de mise en évidence |
| **Background (Crème)** | #FAF7F0 | Fond principal |
| **Background Light (Ivoire)** | #FFFDF8 | Cartes, sections |

### Couleurs Fonctionnelles

| Type | Couleur | Hex |
|------|---------|-----|
| Success | Vert | #10B981 |
| Warning | Jaune/Orange | #F59E0B |
| Error | Rouge | #EF4444 |
| Info | Bleu | #3B82F6 |

### Couleurs du Drapeau Ivoirien (Accents)

| Couleur | Hex |
|---------|-----|
| Orange CI | #F77F00 |
| Blanc CI | #FFFFFF |
| Vert CI | #009E60 |

### Couleurs ANSUT (Sponsor)

| Couleur | Hex |
|---------|-----|
| Bleu ANSUT | #2256A3 |
| Orange ANSUT | #F08224 |

---

## Problèmes Potentiels Identifiés

1. **Trop de couleurs orange** : Primary (#FF6B35), Secondary (#E07A5F), CI Orange (#F77F00), ANSUT Orange (#F08224)
   - Risque de confusion visuelle
   - Manque de hiérarchie claire

2. **Accent Lagune (#00B4D8)** : Bleu turquoise qui peut entrer en conflit avec :
   - Info Blue (#3B82F6)
   - ANSUT Blue (#2256A3)

3. **Backgrounds trop similaires** :
   - #FAF7F0 (crème)
   - #FFFDF8 (ivoire)
   - #FEF3C7 (beige sable)
   - Différences subtiles difficiles à percevoir

4. **Manque de contraste** : Les fonds clairs + texte gris peuvent poser des problèmes d'accessibilité WCAG

---

## Recommandations Préliminaires

1. **Simplifier la palette orange** : Choisir 1-2 teintes maximum
2. **Renforcer le contraste** : Assurer un ratio minimum de 4.5:1 pour le texte
3. **Harmoniser les bleus** : Unifier Lagune, Info et ANSUT
4. **Différencier les backgrounds** : Utiliser des nuances plus distinctes

