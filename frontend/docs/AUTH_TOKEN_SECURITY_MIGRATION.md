# Auth Token Security Migration Plan

## Current State

The frontend stores the Supabase access token in `localStorage` and sends it as a bearer token from `src/services/api.ts`.

This preserves the current login flow, but it means any successful XSS can read the token and use it until expiry.

## Recommended Target

- Move session transport to secure, httpOnly cookies.
- Set cookies with `Secure`, `HttpOnly`, and `SameSite=Strict` where deployment topology permits it.
- Keep access tokens out of JavaScript-readable storage.
- Add CSRF protection for cookie-authenticated unsafe methods.
- Keep bearer-token compatibility temporarily during migration to avoid breaking existing clients.

## Migration Steps

1. Add backend cookie issuance after successful login while continuing to return the current response body.
2. Teach API middleware to accept the httpOnly cookie first, then bearer token as a temporary fallback.
3. Update frontend API calls to use `credentials: "include"` after cookie issuance is confirmed in staging.
4. Remove `localStorage` token writes and reads after all clients are migrated.
5. Add CSP and XSS-focused regression tests before removing bearer fallback.

## Remaining Risk Until Migration

The current bearer-token-in-`localStorage` model remains vulnerable to token theft via XSS. Backend ownership checks added during security hardening reduce data exposure, but they do not remove token theft risk.
