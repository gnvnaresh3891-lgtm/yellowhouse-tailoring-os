## 2026-08-08T00:27:00Z
<USER_REQUEST>
You are the M4 Remediation Worker for YellowHouse Tailoring OS (`yellowhouse`).
Project Root Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Your Working Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4_remediation

Reference Files:
- Reviewer 1 Report: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\reviewer_m4_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Fix Next.js Build Issue (`apps/web`):
   - Investigate why `next build` inside `apps/web` produced `Error: ENOENT: no such file or directory, open '...apps\web\.next\server\pages-manifest.json'`.
   - Ensure clean Next.js build environment (e.g. clean `.next` directory before build or configure `next.config.js` properly if needed).
   - Test and verify `npm run build` from root directory (`C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse`) exits with Code 0 and 0 errors.

2. Replace Direct `alert()` in CAD Measurements Page:
   - In `apps/web/src/app/(dashboard)/measurements/page.tsx:506`, replace `alert(...)` with a glassmorphic toast or inline status badge message.

3. Refactor Direct `localStorage` calls in Layout:
   - In `apps/web/src/app/(dashboard)/layout.tsx:47, 70`, replace direct `localStorage.getItem('yh_auth_user')` and `localStorage.removeItem('yh_auth_user')` with safe helper functions `getLocalStorage` and `removeLocalStorage` from `@/lib/storage-utils`.

4. Verification Pipeline:
   - `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit`
   - `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit`
   - `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npm test`
   - `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npm test`
   - `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse && npm run build` (Must succeed with Code 0!).

Deliver your report in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4_remediation\handoff.md` and send a message when done.
</USER_REQUEST>
