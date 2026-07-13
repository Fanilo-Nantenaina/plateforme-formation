# Plateforme de formation

API Laravel + front React (TanStack) pour un sous-ensemble d'une plateforme qui
centralise des centres de formation : comptes uniques à rôles cumulables, catalogue,
inscription, certificat vérifiable publiquement, parrainage.

---

## Sommaire

- [Stack & justification](#stack--justification)
- [Modèle de données](#modèle-de-données)
- [Endpoints](#endpoints)
- [Journal de conception](#journal-de-conception)
- [Hypothèses sur les zones ambiguës](#hypothèses-sur-les-zones-ambiguës)
- [Limites connues](#limites-connues)
- [Lancer le projet](#lancer-le-projet)
- [Parcours de validation](#parcours-de-validation)

---

## Stack & justification

| Côté | Choix | Justification |
|------|-------|---------------|
| Back | Laravel (REST) | Imposé. Migrations, validation (FormRequests), Resources, Actions. |
| Front | React + TanStack Start (Router + Query) + shadcn/ui | Séparation état serveur (Query) / navigation (Router) ; pas de besoin SSR. Next.js écarté. |
| Base | PostgreSQL | Contraintes d'unicité et FK natives — la donnée vérifiable publiquement exige des garanties en base. |
| Auth | Sanctum, mode SPA (cookie de session httpOnly) | Immunisé au vol de token par XSS ; le front ne stocke rien. Passport écarté (sur-architecture). |
| Dépôt | Monorepo (`/api`, `/web`) | Un dev, versionnement atomique back+front, un seul historique. |
| Lint front | Biome | Lint + format unifiés, plus simple qu'ESLint + Prettier. |

---

## Modèle de données

Toutes les tables ont une clé primaire **UUID** (clé de substitution stable, non énumérable).

- **centers** — centres de formation.
- **accounts** — la personne. `phone` unique mais **mutable** (identifiant naturel, pas clé d'identité).
- **roles** — référence (`apprenant`, `formateur`, `admin`). Les rôles sont des données, pas des sous-classes : zéro héritage.
- **account_role** — pivot du cumul, **contextualisé par `center_id`**. Unicité `(account_id, role_id, center_id)`. Pas de clé de substitution : le triplet identifie la ligne.
- **trainings** — catalogue, rattaché à un centre.
- **enrollments** — inscription. Statut `active`/`completed`. Unicité `(account_id, training_id)`.
- **certificates** — `public_code` (UUID) opaque pour l'URL publique ; statut `valid`/`revoked`, `revoked_at`, `revocation_reason`. Pas d'expiration. Unicité `enrollment_id`.
- **referrals** — parrainage. Deux FK vers `accounts` (parrain/filleul), `center_id`, flag `rewarded`. Unicité `(referred_id, center_id)`.

---

## Endpoints

### Publics

| Méthode | Route | Rôle |
|---------|-------|------|
| POST | `/api/login` | Connexion (phone + password) → session |
| POST | `/api/accounts` | Créer un compte |
| GET | `/api/verify/{code}` | Vérification publique — JSON |
| GET | `/verify/{code}` | Vérification publique — page HTML Blade (routes/web.php) |

### Protégés (auth:sanctum)

| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/me` | Compte connecté + rôles (avec center_id) |
| POST | `/api/logout` | Déconnexion |
| GET | `/api/trainings` | Catalogue |
| GET | `/api/trainings/{training}/enrollments` | Inscrits d'une formation (espace formateur) |
| GET | `/api/me/enrollments` | Mes inscriptions + certificats (états dynamiques du front) |
| POST | `/api/me/roles` | Auto-attribution du rôle apprenant dans un centre |
| POST | `/api/enrollments` | Inscription (403 si pas apprenant du centre) |
| POST | `/api/enrollments/{enrollment}/complete` | Terminer + émettre le certificat (Action transactionnelle) |
| POST | `/api/accounts/{account}/roles` | Attribuer un rôle — **admin du centre uniquement** |
| POST | `/api/referrals` | Enregistrer un parrainage |
| GET | `/api/centers` | Liste des centres (sélecteurs front) |
| GET | `/api/accounts` | Liste minimale des comptes (id + nom, sans soi-même) |
| GET | `/api/admin/certificates` | Certificats des centres administrés |
| POST | `/api/certificates/{certificate}/revoke` | Révoquer — **admin du centre uniquement** |

---

## Journal de conception

### Jour 1 — Cadrage

**Monorepo plutôt que deux dépôts.** Un seul développeur, périmètre de test, pas de
cycles de release distincts. Versionnement atomique back+front. À reconsidérer si des
équipes séparées reprenaient le projet.

**TanStack (SPA) plutôt que Next.js.** Pas de besoin SEO côté application. Seule
`/verify/{code}` gagnerait à être indexable — insuffisant pour imposer du SSR ; la page
publique est de toute façon rendue par Laravel.

**Questions envoyées au jury** (hypothèses par défaut en attendant — voir tableau) :
portée des rôles, données exposées publiquement, révocation, définition de la
« première inscription », cycle de vie du téléphone comme identité.

### Jour 2 — Modélisation

**Rôles attachés à un centre.** Une personne peut être formatrice au centre A et
apprenante au centre B. Le pivot `account_role` porte `center_id` : cumul contextualisé,
conforme à l'ambition « centraliser les centres ».

**Identité stable ≠ téléphone.** PK = UUID interne, jamais réutilisé. Le téléphone est
un identifiant naturel *unique* mais *mutable* : un numéro réattribué par l'opérateur ne
doit pas faire hériter un profil. Surrogate key + identifiant naturel mutable.

**Certificat : révocation, pas expiration.** Une compétence ne périme pas ; `expires_at`
serait un contresens. L'invalidation est *événementielle* (fraude, erreur, retrait) :
statut + `revoked_at` + `revocation_reason`.

**Identifiant public non énumérable.** `/verify/{code}` utilise `public_code` (UUID),
jamais l'id séquentiel — pas de parcours `/verify/1`, `/verify/2`. Le nom complet est
affiché (c'est le sens d'un certificat public), rien de plus sensible.

**Parrainage : première inscription dans *ce* centre.** Idempotent par la contrainte
unique `(referred_id, center_id)` + flag `rewarded`.

**Pivot sans clé de substitution.** `HasUuids` ne s'applique qu'aux modèles ; le pivot
est inséré par `belongsToMany` sans passer par un modèle. Une table d'association est
identifiée par ses FK : le triplet suffit.

### Jour 3 — API : comptes, rôles, inscriptions, certificats

**Chaîne en couches.** Route → FormRequest (validation) → Controller (mince) →
Model/Action → API Resource (sérialisation). Une responsabilité par couche, un endroit
unique par règle.

**Attribution de rôle idempotente.** `syncWithoutDetaching` : rejouer n'écrase ni ne
duplique — comportement voulu pour du cumul.

**hasRole qualifié.** Filtres sur `roles.name` et `account_role.center_id` (noms
qualifiés) pour lever l'ambiguïté SQL du JOIN ; `wherePivot` générait une requête
invalide sur cette version.

**Inscription = règle de cohérence.** 403 si le compte n'a pas le rôle apprenant DANS le
centre de la formation. Double inscription bloquée en base (contrainte unique — la
validation applicative ne protège pas des requêtes concurrentes, la contrainte si).

**Certificat émis automatiquement.** Terminer une inscription émet le certificat via
l'Action `CompleteEnrollment` sous `DB::transaction`. Invariant : pas de formation
terminée sans certificat. Atomique et idempotent (rejouer renvoie l'existant).

### Jour 4 — Vérification publique

**Deux portes vers la même donnée.** JSON (`/api/verify/{code}`) pour les consommateurs
programmatiques ; page HTML Blade (`/verify/{code}`) pour les humains (employeurs,
recruteurs), autonome et indépendante du front.

**Trois états visibles.** Valide / révoqué (avec date + motif) / introuvable — la
révocation événementielle se matérialise jusque dans l'UI publique.

**Séparation public/privé physique.** Page dans `routes/web.php`, API dans
`routes/api.php` ; `/verify` reste hors auth par construction.

**Effet de bord session.** `SESSION_DRIVER=file` (table sessions supprimée au jour 2,
cohérent avec l'API sans état côté tables système).

### Jour 5 — Parrainage (bonus)

**Ressource dédiée.** `POST /referrals` — le parrainage est indépendant du cycle de vie
du compte. `firstOrCreate` sur `(referred_id, center_id)` : idempotent sans exception.
`different:referred_id` interdit l'auto-parrainage.

**Déclenchement à l'inscription.** À l'inscription du filleul, un parrainage non
récompensé dans ce centre passe `rewarded` + `rewarded_at`. Le flag garantit qu'on ne
récompense qu'une fois. Les dates distinctes (création vs récompense) le prouvent.

### Jour 6 — Révocation & tests

**Révocation admin.** Motif obligatoire ; 409 si déjà révoqué (l'état interdit
l'opération). Identifiée par l'id interne (action privée), jamais le public_code.

**Fillable = liste blanche.** `revoked_at`/`revocation_reason` ajoutés au Fillable —
sans quoi `update()` les ignorait silencieusement (protection mass-assignment, pas un
bug).

**Tests ciblés.** Trois Feature tests (SQLite en mémoire, RefreshDatabase) : cumul de
rôles contextualisé, refus 403 d'inscription, chaîne inscription→certificat→vérification.
On teste les règles qui portent la valeur, pas le CRUD. Limite : SQLite ≠ PostgreSQL.

**Sémantique HTTP.** `/complete` renvoie 201 Created (il crée un certificat).

### Jour 7 — Authentification Sanctum SPA

**Session cookie httpOnly plutôt que token Bearer.** Le front ne stocke aucun token
(immunité au vol par XSS). Flux : `GET /sanctum/csrf-cookie` → `POST /login` → cookie de
session posé par le serveur, renvoyé automatiquement. `statefulApi()` dans
`bootstrap/app.php` active la session sur les routes API pour les domaines de confiance
(`SANCTUM_STATEFUL_DOMAINS`). Régénération de session au login (anti-fixation), message
d'erreur volontairement vague (« Identifiants invalides »).

**Proxy de dev (Vite).** `/api`, `/sanctum` et `/verify` proxifiés vers Laravel : une
seule origine perçue, pas de bataille CORS, cookies naturels. En prod : même domaine via
reverse proxy.

**uuidMorphs sur les tokens Sanctum.** `personal_access_tokens.tokenable_id` en UUID
(tous les modèles sont en UUID) — `morphs` par défaut créait un bigint incompatible.

### Jour 8 — Front : parcours réels et interfaces par profil

**État serveur vs état client.** TanStack Query pour tout ce qui vient de l'API (cache,
loading, error, mutations + invalidation) ; contexte React pour l'auth, restauré au
montage via `/me` (persistance après refresh sans stockage local).

**Écrans par rôle contextualisé.** Le détail d'une formation s'adapte à
`hasRole(role, training.center_id)` — miroir front du back. Le front adapte l'UX ; la
sécurité réelle reste côté API (403, auth:sanctum).

**Boutons dynamiques, pas d'erreurs provoquées.** `GET /me/enrollments` donne l'état
réel : pas inscrit → bouton ; inscrit → statut « en cours » sans bouton ; terminé →
lien vers le certificat. L'UI ne propose jamais une action déjà faite.

**Impasse → action.** Un compte sans rôle dans un centre voit « Rejoindre ce centre
comme apprenant » (`POST /me/roles`). Le rôle est **forcé côté serveur** : seul
`apprenant` est auto-attribuable ; `formateur` est attribué par un admin ; `admin`
n'est pas attribuable via l'API (seed uniquement) — pas d'escalade de privilèges.

**Admin contextualisé par centre.** Cohérent avec la modélisation : l'admin est un
gestionnaire de centre, pas un super-utilisateur global. Interface `/admin` :
attribution de rôles (sélecteurs, limités à ses centres) et certificats (liste +
révocation avec motif). Les endpoints correspondants vérifient
`hasRole('admin', center_id)` côté serveur.

**Sélecteurs, jamais d'UUID saisi.** `GET /centers` et `GET /accounts` (id + nom
uniquement, sans soi-même — minimisation des données) alimentent les selects
(parrainage, admin).

**Routing.** File-based (TanStack Router). `trainings_.$id.tsx` (underscore) pour
dé-imbriquer le détail du catalogue — sans layout parent commun, l'imbrication n'avait
pas de sens. `RequireAuth` redirige vers `/login` ; login/register redirigent vers le
catalogue si déjà connecté ; déconnexion → login.

**Thème sombre/clair.** Toggle persistant (localStorage), initialisé sur la préférence
système, classe `dark` exploitée par shadcn/ui.

---

## Hypothèses sur les zones ambiguës

| Zone | Hypothèse retenue | Impact si changée |
|------|-------------------|-------------------|
| Portée des rôles | Rôle attaché à un centre précis | Sans `center_id`, pivot N-N global ; migration à ajuster. |
| Données publiques du certificat | Nom complet affiché | Si minimisation exigée : masquer/tronquer. |
| Cycle de vie du certificat | Pas d'expiration ; révocation événementielle | Si expiration : `expires_at` + règle temporelle. |
| Déclencheur du parrainage | 1re inscription dans *ce centre* | Si « 1re tout court » : idempotence sur la personne seule. |
| Identité / téléphone | UUID interne en clé ; téléphone unique mutable | Si téléphone = clé : changement de numéro impossible sans casser les FK. |
| Gouvernance des rôles | Apprenant auto-attribuable ; formateur par admin du centre ; admin en seed | Workflow demande/validation = extension naturelle. |

---

## Limites connues

- Récompense de parrainage : seul le *déclenchement* est implémenté (flag `rewarded`) ;
  la récompense réelle (crédit/points) est hors périmètre.
- Déclenchement du parrainage inline dans `EnrollmentController`, hors transaction — à
  extraire dans une Action `EnrollAccount` transactionnelle comme `CompleteEnrollment`.
- Normalisation E.164 des téléphones supposée en amont ; lib de normalisation
  (libphonenumber) à brancher à la création de compte.
- Autorisation fine : les gardes admin sont des vérifications dans les contrôleurs ; la
  forme canonique Laravel serait des Policies (point d'ancrage prêt dans les
  FormRequests).
- Le détail d'une formation réutilise la requête catalogue (filtrage client) plutôt
  qu'un `GET /trainings/{id}` dédié.
- `GET /accounts` liste tous les comptes (id + nom) à tout utilisateur connecté — pour
  les sélecteurs ; une recherche paginée serait préférable à l'échelle.
- Endpoint JSON `/api/verify/{code}` non consommé par le front (qui utilise la page
  Blade) : exposé pour des consommateurs tiers.
- Tests sur SQLite en mémoire : comportements spécifiques PostgreSQL non couverts.

---

## Lancer le projet

### Prérequis

PHP ≥ 8.5, Composer, PostgreSQL, Node ≥ 24.

### API (Laravel)

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
# .env : DB_CONNECTION=pgsql + identifiants ; SESSION_DRIVER=file ;
# SANCTUM_STATEFUL_DOMAINS=localhost:8000,localhost:3000 ; SESSION_DOMAIN=localhost
createdb plateforme_formation
php artisan migrate:fresh --seed
php artisan serve        # http://localhost:8000
```

### Front (React / TanStack)

```bash
cd web
npm install
npm run dev              # http://localhost:3000
```

Le proxy Vite renvoie `/api`, `/sanctum` et `/verify` vers `http://localhost:8000`.

### Comptes de démonstration (seed)

| Profil | Téléphone | Mot de passe |
|--------|-----------|--------------|
| Apprenant | `+261320000001` | `secret123` |
| Formateur | `+261320000002` | `secret123` |
| Admin (centre) | `+261320000003` | `secret123` |

### Tests

```bash
cd api && php artisan test
```

---

## Parcours de validation

1. **Public** : `/` → redirection login ; `/trainings` et `/admin` inaccessibles
   déconnecté ; toggle sombre/clair persistant.
2. **Apprenant** (`…01`) : nav sans « Administration » ; inscription à une formation →
   l'état passe à « en cours », le bouton disparaît et l'état persiste au refresh ;
   « Mes formations » liste l'inscription.
3. **Formateur** (`…02`) : espace formateur sur la formation, « Terminer & certifier »
   → badge « Terminée » + lien certificat sans rechargement.
4. **Apprenant** : « Mon certificat ↗ » depuis Mes formations → page publique verte.
5. **Admin** (`…03`) : `/admin` visible pour lui seul ; attribution d'un rôle par
   sélecteurs ; révocation avec motif → badge « Révoqué » et page publique rouge avec
   motif.
6. **Parrainage** : selects sans soi-même ; parrainer un compte neuf, le connecter, lui
   faire rejoindre le centre et s'inscrire → `rewarded: true`, `rewarded_at` renseigné.
7. **Sécurité négative** : `/admin` en apprenant → refus ; API sans session → 401 ;
   attribution de rôle par un non-admin → 403.
