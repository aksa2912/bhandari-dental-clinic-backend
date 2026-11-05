# Bhandari Dental Clinic — Backend Decisions

Locked architectural decisions. Do not change without explicit discussion.

| Decision | Value |
|---|---|
| Capacity model | Shared pool, max 2 concurrent |
| Chair/dentist assignment | Not in MVP schema |
| Blocked slot scope | Always both chairs (weight 2) |
| Chained non-simultaneous allowed | Yes |
| Interval convention | Half-open [start, end) everywhere |
| Booking protection | Serializable txn + existential overlap check |
| Retry on 40001 | No retry; return 409 with current free slots |
| Order of validation | format → treatment → working hours → blocked → capacity |
| Walk-in code path | Same as online; source='walk_in' |
| Frontend | Next.js 16 App Router, TypeScript, pnpm |
| Backend | Node + Express, JavaScript, npm |
| DB | PostgreSQL on Neon, pg driver |
| Deployment | Vercel (frontend) + Render (backend) |
| Timezone | Store UTC; display IST (Asia/Kolkata) |