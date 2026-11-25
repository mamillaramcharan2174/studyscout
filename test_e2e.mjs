import http from 'http';

const BASE_URL = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== StudyScout End-to-End Automated Integration Test ===\n');

  // Test 1: Health Check
  console.log('1. Testing /api/health...');
  const health = await request('/health');
  if (!health.ok || health.data?.status !== 'ok') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log('   ✓ Health check passed:', health.data.service);

  // Test 2: List Initial Sessions
  console.log('\n2. Testing GET /api/sessions...');
  const sessionsRes = await request('/sessions');
  if (!sessionsRes.ok || !Array.isArray(sessionsRes.data)) {
    throw new Error('Failed to retrieve sessions list');
  }
  console.log(`   ✓ Retrieved ${sessionsRes.data.length} pre-seeded research sessions`);
  const sample = sessionsRes.data.find(s => s.id === 'session-crispr-demo');
  if (sample) {
    console.log(`   ✓ Verified sample session: "${sample.title}" (${sample.report?.keyFindings?.length} findings, ${sample.report?.conflictsAndNuances?.length} conflict)`);
  }

  // Test 3: List Sample Documents
  console.log('\n3. Testing GET /api/sample-docs...');
  const sampleDocsRes = await request('/sample-docs');
  if (!sampleDocsRes.ok || sampleDocsRes.data.length === 0) {
    throw new Error('No sample docs found');
  }
  console.log(`   ✓ Found ${sampleDocsRes.data.length} sample student documents:`, sampleDocsRes.data.map(d => d.filename).join(', '));

  // Test 4: Create a New Research Session
  console.log('\n4. Testing POST /api/sessions (Create new session)...');
  const createRes = await request('/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mainQuestion: 'How does artificial intelligence diagnostic accuracy compare to clinical radiologists, and what demographic bias exists?',
      title: 'AI in Radiology: Accuracy vs Demographic Bias',
    }),
  });
  if (!createRes.ok || !createRes.data?.id) {
    throw new Error(`Failed to create session: ${JSON.stringify(createRes)}`);
  }
  const sessionId = createRes.data.id;
  console.log(`   ✓ Created session ID: ${sessionId}`);

  // Test 5: Attach Sample Document
  console.log('\n5. Testing POST /api/sessions/:id/load-sample (Attach Radiology Audit)...');
  const attachRes = await request(`/sessions/${sessionId}/load-sample`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: 'Radiology_AI_MultiHospital_Audit.txt' }),
  });
  if (!attachRes.ok || attachRes.data.documents.length === 0) {
    throw new Error(`Failed to attach sample document: ${JSON.stringify(attachRes)}`);
  }
  const attachedDoc = attachRes.data.documents[0];
  console.log(`   ✓ Attached document: "${attachedDoc.originalName}" (${attachedDoc.pageCount} pgs, ${attachedDoc.chunks.length} semantic chunks)`);

  // Test 6: Generate Research Plan
  console.log('\n6. Testing POST /api/sessions/:id/plan (Agent Plan Generation)...');
  const planRes = await request(`/sessions/${sessionId}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'How does artificial intelligence diagnostic accuracy compare to clinical radiologists, and what demographic bias exists?',
    }),
  });
  if (!planRes.ok || !planRes.data?.subQuestions) {
    throw new Error(`Plan generation failed: ${JSON.stringify(planRes)}`);
  }
  const plan = planRes.data;
  console.log(`   ✓ Generated Plan: "${plan.title}"`);
  console.log(`   ✓ Strategy: ${plan.strategy.substring(0, 80)}...`);
  console.log(`   ✓ Sub-questions (${plan.subQuestions.length}):`);
  plan.subQuestions.forEach((sq, i) => {
    console.log(`     [${i + 1}] ${sq.question} (Sources: ${sq.targetSources.join(', ')})`);
  });

  // Test 7: Edit Research Plan (User review and edit before execution)
  console.log('\n7. Testing PUT /api/sessions/:id/plan (User edits sub-questions)...');
  plan.subQuestions[0].question = 'How do deep learning diagnostic algorithms compare to board-certified radiologists in diagnostic sensitivity and AUC benchmarks?';
  plan.isApproved = true;
  const updateRes = await request(`/sessions/${sessionId}/plan`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  if (!updateRes.ok) {
    throw new Error(`Failed to update plan: ${JSON.stringify(updateRes)}`);
  }
  console.log('   ✓ Plan successfully updated and approved by student');

  // Test 8: Autonomous Plan-Act-Observe Research Loop
  console.log('\n8. Testing POST /api/sessions/:id/research (Executing Plan-Act-Observe loop)...');
  const researchStartTime = Date.now();
  const researchRes = await request(`/sessions/${sessionId}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const researchDuration = Date.now() - researchStartTime;
  if (!researchRes.ok || !researchRes.data?.report) {
    throw new Error(`Research execution failed: ${JSON.stringify(researchRes)}`);
  }

  const { report, logs } = researchRes.data;
  console.log(`   ✓ Research finished in ${(researchDuration / 1000).toFixed(2)}s`);
  console.log(`   ✓ Executed ${logs.length} tool calls with Zod schema validation`);
  logs.forEach((log, i) => {
    console.log(`     Tool #${i + 1} [${log.toolName}]: ${log.observation.substring(0, 90)}... (${log.durationMs}ms, status: ${log.status})`);
  });

  console.log('\n=== Synthesized Structured Report Summary ===');
  console.log(`Title: ${report.title}`);
  console.log(`Executive Summary: ${report.executiveSummary.substring(0, 150)}...`);
  console.log(`Key Findings (${report.keyFindings.length}):`);
  report.keyFindings.forEach((f, i) => {
    console.log(`  - Finding #${i + 1} [${f.confidence.toUpperCase()}]: ${f.claim}`);
    console.log(`    Citations: ${f.citations.map(c => `[${c}]`).join(', ')}`);
  });

  console.log(`\nConflicting Information & Nuance Analysis (${report.conflictsAndNuances.length}):`);
  report.conflictsAndNuances.forEach((c) => {
    console.log(`  - Contention: "${c.topic}"`);
    console.log(`    View A [${c.viewA.citationIndex}]: "${c.viewA.claim}"`);
    console.log(`    View B [${c.viewB.citationIndex}]: "${c.viewB.claim}"`);
    console.log(`    Synthesis: "${c.synthesisAndVerdict.substring(0, 100)}..."`);
  });

  console.log(`\nBibliography (${report.sources.length} sources):`);
  report.sources.forEach((s) => {
    console.log(`  [${s.citationIndex}] ${s.title} (${s.type.toUpperCase()}) - ${s.url || s.docName}`);
  });

  // Test 9: Contextual Follow-Up Q&A
  console.log('\n9. Testing POST /api/sessions/:id/followup (Student asking follow-up question)...');
  const followUpQuestion = 'Why did the hospital audit disagree with the commercial marketing claims regarding diagnostic accuracy?';
  const followUpRes = await request(`/sessions/${sessionId}/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: followUpQuestion }),
  });
  if (!followUpRes.ok || !followUpRes.data?.content) {
    throw new Error(`Follow-up failed: ${JSON.stringify(followUpRes)}`);
  }
  console.log(`   ✓ User: "${followUpQuestion}"`);
  console.log(`   ✓ Assistant:\n${followUpRes.data.content.substring(0, 220)}...`);
  console.log(`   ✓ Referenced Citations: ${followUpRes.data.citations?.map(c => `[${c}]`).join(', ')}`);

  console.log('\n======================================================');
  console.log('>>> ALL 9 END-TO-END WORKFLOW TESTS PASSED PERFECTLY! <<<');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
