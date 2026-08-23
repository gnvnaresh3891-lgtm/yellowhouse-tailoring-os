# Handoff Report — Milestone 3 SAM & Pricing Engine Investigation

## 1. Observation
- `apps/web/src/lib/fabric-yield.ts` implements `calculateFabricYield(input: FabricYieldInput): FabricYieldResult`, covering base fabric yield, size scaling ($K_{scale}$), bolt width ($F_{width}$), panel multipliers for flared garments, pattern repeat allowance, and shrinkage buffer.
- `apps/web/src/lib/ease-calculator.ts` implements `calculatePostureOffset()` and `calculateDynamicEase()`, supporting 4 posture axes (`shoulderSlope`, `backCurvature`, `abdomenStance`, `hipSpineStance`).
- `apps/web/src/lib/sam-calculator.ts` and `apps/web/src/lib/pricing-calculator.ts` do not currently exist in `apps/web/src/lib/` and need implementation for Milestone 3.
- `apps/web/src/__tests__/sam-calculator.test.ts` and `apps/web/src/__tests__/pricing-calculator.test.ts` do not currently exist in `apps/web/src/__tests__/` and need creation.
- In `apps/web/src/app/(dashboard)/orders/page.tsx` line 431, `samTotalEstimate` is calculated via hardcoded fallback `items.length * 120`, and garment item unit prices use preset defaults (e.g. ₹28,000 for Sherwani, ₹68,000 for Lehenga).
- In `apps/web/src/app/(dashboard)/production/page.tsx` lines 115-335, job card SAM estimates range from 120 to 360 minutes, and artisan hourly/minute rates use ₹42/minute (line 460).
- `apps/web/src/__tests__/run-tests.ts` executes custom test suites for storage-utils, m2-stress, pom-schemas, posture engine, ease calculator, fabric yield, and landmark validation.

## 2. Logic Chain
1. **Observation**: Base yield math and 4-axis posture offset engines already exist in `fabric-yield.ts` and `ease-calculator.ts`.
2. **Logic Step**: SAM calculation requires combining base garment SAM (9 categories), posture complexity modifiers from `PostureProfile`, and customization surcharges (panel counts, embroidery levels, full canvas/lining).
3. **Logic Step**: Bespoke pricing requires combining dynamic fabric yield (from `calculateFabricYield`), fabric price per meter, labor cost (total SAM minutes * ₹42/min artisan rate), posture pattern drafting surcharges, embroidery fees, and rush fees.
4. **Logic Step**: Implementing `sam-calculator.ts` and `pricing-calculator.ts` will allow `orders/page.tsx` to display real-time accurate pricing and `production/page.tsx` to automatically assign exact SAM estimates to job cards.
5. **Logic Step**: Adding `sam-calculator.test.ts` and `pricing-calculator.test.ts` and linking them in `run-tests.ts` provides complete test coverage for Milestone 3 acceptance criteria.

## 3. Caveats
- No existing source files were modified during this investigation (read-only mode strictly respected).
- Standard artisan minute rate is assumed as ₹42/min based on existing timesheet log conventions in `production/page.tsx`.

## 4. Conclusion
The architectural design and mathematical formulas for `sam-calculator.ts` and `pricing-calculator.ts` are fully specified in `analysis.md`. The implementation requires creating two new modules in `apps/web/src/lib/`, two new test suites in `apps/web/src/__tests__/`, and integrating them into `run-tests.ts`, `orders/page.tsx`, `production/page.tsx`, and `MeasurementEngineContext.tsx`.

## 5. Verification Method
1. Inspect `analysis.md` in `C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\.agents\teamwork_preview_explorer_m3_1\analysis.md`.
2. Run test command to confirm existing tests pass:
   ```bash
   cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
   npm test
   ```
3. After implementer creates `sam-calculator.ts` and `pricing-calculator.ts`, re-run `npm test` to verify 100% test pass.
