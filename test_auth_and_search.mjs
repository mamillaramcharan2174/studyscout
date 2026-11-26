import { app } from './server/dist/index.js';
import { Database } from './server/dist/storage/db.js';

async function runTests() {
  console.log('--- STARTING AUTH & SEARCH AUTOMATED TEST SUITE ---');

  // Initialize DB
  await Database.initialize();
  const server = app.listen(4899, () => {
    console.log('[Test Server] Running on http://127.0.0.1:4899');
  });

  try {
    const baseUrl = 'http://127.0.0.1:4899';

    // 1. Test Login with Default Student
    console.log('\n[1] Testing Student Login...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@university.edu', password: 'StudyScout2026!' }),
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
    const loginData = await loginRes.json();
    console.log('✓ Login successful! User:', loginData.user.fullName, '| Token:', loginData.token);

    // 2. Test Registration of a new Student
    console.log('\n[2] Testing Student Registration...');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Maya Lin',
        username: `mayalin_${Date.now()}`,
        email: `mayalin_${Date.now()}@cambridge.edu`,
        password: 'Password999!',
        fieldOfStudy: 'Theoretical Physics',
      }),
    });
    if (!regRes.ok) throw new Error(`Registration failed: ${regRes.statusText}`);
    const regData = await regRes.json();
    console.log('✓ Registration successful! User ID:', regData.user.id, '| Field:', regData.user.fieldOfStudy);

    // 3. Test Forgot Password Code Request
    console.log('\n[3] Testing Forgot Password Code Generation...');
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@university.edu' }),
    });
    if (!forgotRes.ok) throw new Error(`Forgot password request failed: ${forgotRes.statusText}`);
    const forgotData = await forgotRes.json();
    console.log('✓ Forgot Password reset code generated:', forgotData.code, 'for email:', forgotData.email);

    // 4. Test Reset Password with Code
    console.log('\n[4] Testing Password Reset with Code...');
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'student@university.edu',
        code: forgotData.code,
        newPassword: 'StudyScout2026Updated!',
      }),
    });
    if (!resetRes.ok) throw new Error(`Password reset failed: ${resetRes.statusText}`);
    const resetData = await resetRes.json();
    console.log('✓ Password reset confirmed:', resetData.message);

    // Reset password back to default for continuous testing
    await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'student@university.edu' }),
    }).then(r => r.json()).then(d => {
      return fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'student@university.edu',
          code: d.code,
          newPassword: 'StudyScout2026!',
        }),
      });
    });

    // 5. Test Quick Answer API for Any Question
    console.log('\n[5] Testing Universal Quick Answer API...');
    const question = 'What are the main therapeutic mechanisms of CRISPR-Cas9?';
    const answerRes = await fetch(`${baseUrl}/api/quick-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!answerRes.ok) throw new Error(`Quick answer failed: ${answerRes.statusText}`);
    const answerData = await answerRes.json();
    console.log('✓ Question Answered:', answerData.question);
    console.log('✓ Direct Answer Preview:', answerData.directAnswer.substring(0, 120), '...');
    console.log('✓ Key Takeaways count:', answerData.keyTakeaways?.length);
    console.log('✓ Verified Sources count:', answerData.sources?.length);
    console.log('✓ Lead Source Title:', answerData.sources?.[0]?.title, '| Domain:', answerData.sources?.[0]?.domain);

    console.log('\n======================================================');
    console.log('🎉 ALL AUTHENTICATION & UNIVERSAL SEARCH TESTS PASSED!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
