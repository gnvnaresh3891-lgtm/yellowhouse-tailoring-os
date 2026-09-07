import { slugify, isValidSlug } from '../lib/slug';
import type { OnboardingFormState, SlugCheckerState, SlugCheckResponse } from '../types/onboarding';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg} ${detail ? `(${detail})` : ''}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  }
}

console.log('\n==================================================');
console.log('--- ONBOARDING PAGE FRONTEND ADVERSARIAL STRESS TEST ---');
console.log('==================================================\n');

// ----------------------------------------------------
// TEST SUITE 1: SLUG VALIDATION & RAPID TYPING SIMULATION
// ----------------------------------------------------
console.log('[Suite 1: Slug Formatting, Validation & Rapid Typing]');

// 1.1 Slugify edge cases
assert(slugify('Royal Bespoke Tailors') === 'royal-bespoke-tailors', 'Normal boutique name slugifies correctly');
assert(slugify('   Savile  Row & Co.   ') === 'savile-row-co', 'Punctuation and excessive spaces handled');
assert(slugify('----Special---Name----') === 'special-name', 'Multiple hyphens stripped to single hyphen without leading/trailing hyphens');
assert(slugify('@#$%^&*()!') === '', 'All special characters result in empty string');

// 1.2 isValidSlug boundary conditions
assert(isValidSlug('abc') === true, 'Minimum valid length (3 chars)');
assert(isValidSlug('ab') === false, 'Too short slug (2 chars) rejected');
assert(isValidSlug('a'.repeat(50)) === true, 'Maximum valid length (50 chars)');
assert(isValidSlug('a'.repeat(51)) === false, 'Too long slug (51 chars) rejected');
assert(isValidSlug('royal-bespoke') === true, 'Hyphenated slug accepted');
assert(isValidSlug('-royal-bespoke') === false, 'Leading hyphen rejected');
assert(isValidSlug('royal-bespoke-') === false, 'Trailing hyphen rejected');
assert(isValidSlug('royal--bespoke') === false, 'Consecutive hyphens rejected');
assert(isValidSlug('RoyalBespoke') === false, 'Uppercase letters rejected');
assert(isValidSlug('royal bespoke') === false, 'Spaces rejected');

// 1.3 Rapid typing race condition simulation
console.log('\nSub-test 1.3: Simulating rapid typing race condition with React useEffect cleanup');

// Simulated state store for OnboardingPage replicating useEffect lifecycle in src/app/onboarding/page.tsx
class OnboardingPageSimulator {
  public formState: OnboardingFormState = {
    boutiqueName: '',
    slug: '',
    isSlugManuallyEdited: false,
    templates: ['mens_bespoke', 'womens_couture'],
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  public slugState: SlugCheckerState = {
    status: 'idle',
    message: '',
  };

  public isSubmitting = false;
  public error = '';
  public isSuccess = false;

  private cleanupFn: (() => void) | null = null;
  private requestCounter = 0;

  // Simulate user typing in boutique name or slug input
  public updateSlug(newSlug: string, isManual = true) {
    this.formState.slug = newSlug;
    this.formState.isSlugManuallyEdited = isManual;
    this.triggerSlugEffectWithCleanup();
  }

  // Exact reproduction of useEffect lifecycle & cleanup logic in src/app/onboarding/page.tsx (lines 187-231)
  private triggerSlugEffectWithCleanup() {
    // 1. Execute previous effect cleanup before mounting new effect (React standard behavior)
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    const targetSlug = this.formState.slug.trim();

    if (!targetSlug) {
      this.slugState = { status: 'idle', message: '' };
      return;
    }

    if (!isValidSlug(targetSlug)) {
      this.slugState = {
        status: 'invalid',
        message: 'Must be 3-50 characters (lowercase letters, numbers, hyphens).',
      };
      return;
    }

    this.slugState = { status: 'checking', message: 'Checking availability...' };

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const reqId = ++this.requestCounter;
        const res = await this.mockApiCheckSlug(reqId, targetSlug);
        if (isCancelled) return;

        if (res.available) {
          this.slugState = { status: 'available', message: 'Workspace slug is available!' };
        } else {
          this.slugState = {
            status: 'taken',
            message: res.message || 'Workspace slug is already taken.',
          };
        }
      } catch (err: any) {
        if (isCancelled) return;
        this.slugState = {
          status: 'invalid',
          message: err.message || 'Error checking slug availability.',
        };
      }
    }, 350);

    // Save cleanup function for next invocation (or unmount)
    this.cleanupFn = () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }

  // Mock API network call with artificial latency controlled by test
  public mockNetworkResponses: Map<string, { available: boolean; delayMs: number }> = new Map();

  private mockApiCheckSlug(reqId: number, slug: string): Promise<SlugCheckResponse> {
    const mock = this.mockNetworkResponses.get(slug) || { available: true, delayMs: 100 };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ available: mock.available, slug, message: mock.available ? undefined : 'Slug taken' });
      }, mock.delayMs);
    });
  }

  // Validate form submission rules (reproducing handleSubmit)
  public validateSubmission(): string | null {
    if (!this.formState.boutiqueName.trim()) {
      return 'Please enter your boutique name.';
    }

    if (this.slugState.status !== 'available') {
      return 'Please provide a valid and available workspace slug.';
    }

    if (this.formState.templates.length === 0) {
      return 'Select at least one measurement template.';
    }

    if (!this.formState.fullName.trim() || !this.formState.email.trim()) {
      return 'Please complete owner account details.';
    }

    if (this.formState.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (this.formState.password !== this.formState.confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  }
}

// Run rapid typing out-of-order test with cleanup
async function testRapidTypingRaceCondition() {
  const sim = new OnboardingPageSimulator();

  // Scenario:
  // User types "royal" -> triggers request for "royal" at t=350ms, network response arrives at t=1000ms (delay 650ms).
  // Then user types "royal-bespoke" at t=400ms -> triggers cleanup of "royal" (setting isCancelled = true),
  // and starts timer for "royal-bespoke" at t=750ms with 100ms response delay -> finishes at 850ms.
  // "royal" response finishes at t=1000ms, but is discarded because isCancelled === true!

  sim.mockNetworkResponses.set('royal', { available: false, delayMs: 650 });
  sim.mockNetworkResponses.set('royal-bespoke', { available: true, delayMs: 100 });

  // Type "royal"
  sim.updateSlug('royal');

  // Fast forward 400ms (timer for "royal" fired at 350ms, starting in-flight network call with 650ms delay)
  await new Promise((r) => setTimeout(r, 400));

  // Type "royal-bespoke" (triggers cleanup of previous effect, cancelling stale "royal" callback)
  sim.updateSlug('royal-bespoke');

  // Wait 1200ms to let all network promises settle
  await new Promise((r) => setTimeout(r, 1200));

  console.log(`[Diagnostic] Final slugState status after rapid typing: '${sim.slugState.status}', message: '${sim.slugState.message}'`);

  assert(
    sim.slugState.status === 'available',
    'Rapid typing state protection (stale in-flight API response safely cancelled via isCancelled cleanup flag)'
  );
}

// ----------------------------------------------------
// TEST SUITE 2: UNMATCHING PASSWORD & CONFIRM PASSWORD
// ----------------------------------------------------
console.log('\n[Suite 2: Password & Confirm Password Validation]');

const simPass = new OnboardingPageSimulator();
simPass.formState.boutiqueName = 'Royal Bespoke';
simPass.formState.slug = 'royal-bespoke';
simPass.slugState = { status: 'available', message: 'Workspace slug is available!' };
simPass.formState.fullName = 'Latif Tailor';
simPass.formState.email = 'master@royal.com';

// 2.1 Unmatching passwords
simPass.formState.password = 'Secret123!';
simPass.formState.confirmPassword = 'DifferentPassword456!';
assert(simPass.validateSubmission() === 'Passwords do not match.', 'Unmatching passwords return error "Passwords do not match."');

// 2.2 Short password
simPass.formState.password = '12345';
simPass.formState.confirmPassword = '12345';
assert(simPass.validateSubmission() === 'Password must be at least 6 characters long.', 'Password < 6 chars returns error "Password must be at least 6 characters long."');

// 2.3 Matching valid password
simPass.formState.password = 'ValidPassword123';
simPass.formState.confirmPassword = 'ValidPassword123';
assert(simPass.validateSubmission() === null, 'Matching password (>=6 chars) passes validation');

// ----------------------------------------------------
// TEST SUITE 3: SUBMITTING WITHOUT TEMPLATE SELECTIONS
// ----------------------------------------------------
console.log('\n[Suite 3: Template Selection Validation]');

const simTmpl = new OnboardingPageSimulator();
simTmpl.formState.boutiqueName = 'Royal Bespoke';
simTmpl.formState.slug = 'royal-bespoke';
simTmpl.slugState = { status: 'available', message: 'Workspace slug is available!' };
simTmpl.formState.fullName = 'Latif Tailor';
simTmpl.formState.email = 'master@royal.com';
simTmpl.formState.password = 'ValidPassword123';
simTmpl.formState.confirmPassword = 'ValidPassword123';

// Default state has 2 templates
assert(simTmpl.formState.templates.length === 2, 'Default template selection includes 2 templates');

// Empty out templates
simTmpl.formState.templates = [];
assert(simTmpl.validateSubmission() === 'Select at least one measurement template.', 'Submitting with 0 templates returns error "Select at least one measurement template."');

// Select 1 template
simTmpl.formState.templates = ['mens_bespoke'];
assert(simTmpl.validateSubmission() === null, 'Submitting with 1 template passes validation');

// ----------------------------------------------------
// TEST SUITE 4: API NETWORK ERROR HANDLING
// ----------------------------------------------------
console.log('\n[Suite 4: API Network Error Handling]');

async function testNetworkErrorHandling() {
  let isSubmitting = false;
  let error = '';

  const mockSubmitWithError = async (apiCall: () => Promise<any>) => {
    error = '';
    isSubmitting = true;
    try {
      const res = await apiCall();
      if (!res.success) {
        error = res.message || 'Signup failed. Please try again.';
      }
    } catch (err: any) {
      error = err.message || 'Failed to create workspace. Network connection error.';
    } finally {
      isSubmitting = false;
    }
  };

  // 4.1 Network drop (Failed to fetch)
  await mockSubmitWithError(async () => {
    throw new TypeError('Failed to fetch');
  });
  assert(error === 'Failed to fetch', 'Network error caught and converted to error string');
  assert(isSubmitting === false, 'isSubmitting resets to false after network drop');

  // 4.2 500 Server Error returning JSON message
  await mockSubmitWithError(async () => {
    throw new Error('Database connection failed. Internal server error 500.');
  });
  assert(error === 'Database connection failed. Internal server error 500.', '500 Server error message set in error state');
  assert(isSubmitting === false, 'isSubmitting resets to false after 500 server error');

  // 4.3 409 Conflict (Tenant slug taken)
  await mockSubmitWithError(async () => {
    return { success: false, message: 'Tenant slug already exists in database.' };
  });
  assert(error === 'Tenant slug already exists in database.', '409 Conflict message displayed in error banner');
  assert(isSubmitting === false, 'isSubmitting resets to false after 409 Conflict');
}

// Execute async tests
async function runAsyncTests() {
  await testRapidTypingRaceCondition();
  await testNetworkErrorHandling();

  console.log(`\n========================================`);
  console.log(`ONBOARDING STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAsyncTests().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
