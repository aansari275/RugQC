# Inspectra

AI‑assisted inspection & QC app for textile exporters. Owner‑first, exception‑only workflow.

## V1 Scope (locked)
- Inspections (Final / Inline)
- Checklist with OK / NOT OK / NA
- Photo upload
- PDF report
- History
- AI Summary, Risk Score, Auto‑Remarks

## Local dev
```bash
npm install
npm run dev
```

## Routes (current)
- `/` landing page
- `/login` email OTP entry (UI only)
- `/verify` OTP verify (UI only)
- `/owner` owner dashboard (UI only)
- `/inspector` inspector home (UI only)

## Deployment
Netlify (plugin config in `netlify.toml`).
