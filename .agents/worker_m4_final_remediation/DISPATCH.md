## 2026-08-08T00:34:57Z
You are the M4 Final Remediation Worker for YellowHouse Tailoring OS (`yellowhouse`).
Project Root Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse
Your Working Directory: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4_final_remediation

Reference Files:
- Challenger 1 Re-audit Report: C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\challenger_m4_1_reaudit\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
In `apps/web/src/app/(dashboard)/layout.tsx` (lines 160 & 222):
- Update all occurrences of `currentUser.role.replace('_', ' ')` to safely guard against missing/non-string role properties:
  `typeof currentUser?.role === 'string' ? currentUser.role.replace('_', ' ') : 'User'`

Verification:
- Run `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npx tsc --noEmit`
- Run `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web && npm test`
- Run `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npx tsc --noEmit`
- Run `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api && npm test`
- Run `cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse && npm run build` (Must pass with Exit Code 0).

Deliver your report in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\worker_m4_final_remediation\handoff.md` and send a message when done.
