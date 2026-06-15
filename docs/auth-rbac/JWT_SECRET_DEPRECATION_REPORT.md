# JWT_SECRET Deprecation Report

**Date:** 2026-06-15  
**Phase:** 6.5B — Blocker 7 (read-only)

---

## Summary

`JWT_SECRET` is **required at application boot** but **not used** in any runtime authentication code path. All auth flows use Supabase-issued JWT access tokens validated via `supabase.auth.getUser(token)`.

**No runtime changes were made** per Phase 6.5B requirements.

---

## Usage Locations

| File | Lines | Usage |
|------|-------|-------|
| `backend/src/server.js` | 19 | Required env validation at startup |
| `backend/src/config/index.js` | 6 | Exported in config object |
| `backend/.env.example` | 14 | Documentation |
| `backend/ENV_SETUP.md` | 22, 76 | Setup docs |
| `backend/package.json` | 37, 55 | `jsonwebtoken` dependency (unused in src/) |

---

## Search Results

| Pattern | Matches in `backend/src/` |
|---------|---------------------------|
| `JWT_SECRET` | `config/index.js`, `server.js` only |
| `jsonwebtoken` | **None** |
| `jwt.sign` | **None** |
| `jwt.verify` | **None** |

---

## Migration Plan

### Phase 1 (Current — Complete)

- Document JWT_SECRET as legacy/unused
- Keep required env check to avoid breaking existing deployments

### Phase 2 (Future)

1. Confirm no external scripts depend on `JWT_SECRET`
2. Remove `jsonwebtoken` from `package.json` if still unused
3. Make `JWT_SECRET` optional in `server.js` required env list
4. Remove from `.env.example` after one release cycle

### Phase 3 (Future)

- Remove `JWT_SECRET` from config entirely

---

## Safe Removal Recommendation

**Do not remove yet.** Keeping `JWT_SECRET` as a required env var prevents accidental misconfiguration during co-existence rollout. Removal is safe only after:

1. Production verification that no service signs custom JWTs
2. CI/deploy pipelines updated
3. Stakeholder sign-off on env simplification
