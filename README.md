# Orbit

## Supabase setup

The local app is configured through `.env` with the Orbit project's URL and publishable key. Never commit this file. The Orbit database, private chart-upload bucket, RLS policies, and automatic user-profile trigger have been applied.

1. In **Authentication → URL Configuration**, add the deployed site URL and the local development URL (for example, `http://127.0.0.1:4175`).

Email/password auth works through the app. If email confirmation is enabled in Supabase, users will be asked to confirm their email before returning to sign in.

## AI runtime secrets

The deployed `orbit-api` Edge Function uses Gemini first and OpenRouter only when Gemini fails. Add these secrets in **Supabase → Edge Functions → Secrets**; do not add them to the React `.env` file:

```text
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
OPENROUTER_VISION_MODEL=openrouter/free
```

The function is JWT-protected, stores Coach messages and chart results in the authenticated trader's private history, and retrieves private chart uploads server-side before sending them to the selected AI provider.
