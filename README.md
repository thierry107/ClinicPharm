# Curis Health (ClinicPharm)

Clinic and pharmacy management web app: patient records, appointments, consultations,
prescriptions, chemist inventory, point-of-sale billing and analytics, with four roles
(admin, doctor, chemist, patient).

Built with plain HTML, CSS and JavaScript (ES modules). Authentication and the database
use [Supabase](https://supabase.com).

## Current status

| Area | Status |
|---|---|
| Login, registration, sessions (Supabase Auth) | Working |
| Role-based navigation | Working (role is read from `profiles.role`) |
| Patients, appointments, prescriptions, inventory, POS | **Demo data only** (browser `localStorage`) |
| Row-level security SQL | In `sql/`; check the header of each file for whether it is applied |

Data is not yet read from or written to Supabase tables. See the roadmap below.

## Run locally

ES modules need a web server (opening `index.html` directly will not work):

```bash
# any static server works, for example:
python3 -m http.server 8080
# then open http://localhost:8080
```

## Configuration

`js/config.js` holds the Supabase project URL and the **publishable** key. This key is
meant to be public; your data is protected by row-level security, not by hiding the key.

Never put a `service_role` / secret key in this repository or in any frontend file.

## Roles

| Role | Intended access |
|---|---|
| patient | Own record, appointments, prescriptions and purchases |
| doctor | Patients, appointments, consultations, prescriptions |
| chemist | Inventory, dispensing, sales |
| admin | Everything, including role changes |

New sign-ups are always created as `patient` by a database trigger. Only an admin can
change a role. The app never trusts `user_metadata` for roles.

## Project structure

```
index.html          App shell and landing page
css/                Styles (style.css, responsive.css)
js/ui.js            escapeHtml() and toast notifications
js/auth.js          Supabase auth and session handling
js/store.js         Data layer (currently localStorage + mock data)
js/*.js             One module per feature
sql/                Database security scripts
```

## Security notes

- All user-entered text must go through `esc()` from `js/ui.js` before being placed in
  `innerHTML`.
- This app is intended to handle health data. Before real clinics use it, review it
  against Kenya's Data Protection Act, 2019 (consent, access control, audit logging,
  data retention).

## Roadmap

0. Repository hygiene (README, .gitignore, pinned library version, schema export)
1. Quick security fixes (role handling, HTML escaping, toasts)
2. Database foundation (constraints, first admin, patient linking, stock functions)
3. Connect `store.js` to Supabase table by table
4. Least-privilege policies and audit log
5. Edit/delete, appointment changes, password reset, POS discount
6. Admin user management and analytics charts
7. Full test pass and release
