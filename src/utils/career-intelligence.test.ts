import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAtsMatchScore,
  isValidStatusTransition,
  estimateTokenCount,
  validateCosmosInteractionDocument,
  computeDashboardMetrics,
  generateInteractionMarkdownReport
} from './career-intelligence.ts';

test('calculateAtsMatchScore correctly identifies matched and missing skills', () => {
  const candidateSkills = ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git'];
  const jobSkills = ['Python', 'FastAPI', 'Azure Cosmos DB', 'Firebase', 'Kubernetes'];

  const result = calculateAtsMatchScore(candidateSkills, jobSkills);

  assert.equal(result.matched.length, 2);
  assert.ok(result.matched.includes('Python'));
  assert.ok(result.matched.includes('FastAPI'));

  assert.equal(result.missing.length, 3);
  assert.ok(result.missing.includes('Azure Cosmos DB'));
  assert.ok(result.missing.includes('Firebase'));
  assert.ok(result.missing.includes('Kubernetes'));

  // 2 / 5 = 40%
  assert.equal(result.score, 40);
});

test('calculateAtsMatchScore returns 100% when all requirements are met', () => {
  const candidateSkills = ['Python', 'FastAPI', 'AWS RDS'];
  const jobSkills = ['Python', 'FastAPI'];

  const result = calculateAtsMatchScore(candidateSkills, jobSkills);
  assert.equal(result.score, 100);
  assert.equal(result.missing.length, 0);
});

test('isValidStatusTransition enforces application lifecycle state machine including Screening', () => {
  assert.equal(isValidStatusTransition('Applied', 'Screening'), true);
  assert.equal(isValidStatusTransition('Applied', 'Interview'), true);
  assert.equal(isValidStatusTransition('Screening', 'Interview'), true);
  assert.equal(isValidStatusTransition('Interview', 'Offer'), true);

  // Illegal transitions
  assert.equal(isValidStatusTransition('Applied', 'Offer'), false); // Cannot jump directly to offer
  assert.equal(isValidStatusTransition('Applied', 'Applied'), false); // No-op
  assert.equal(isValidStatusTransition('Offer', 'Interview'), false); // Cannot demote to interview
});

test('estimateTokenCount provides reasonable estimation for prompts', () => {
  const emptyCount = estimateTokenCount('');
  assert.equal(emptyCount, 0);

  const samplePrompt = 'You are an executive talent acquisition evaluator parsing a candidate resume.';
  const count = estimateTokenCount(samplePrompt);
  assert.ok(count > 10 && count < 30);
});

test('validateCosmosInteractionDocument enforces partition key and score invariants', () => {
  const validDoc = {
    userId: 'user-uuid-123',
    resumeId: 'resume-uuid-456',
    matchScore: 85,
  };
  const validCheck = validateCosmosInteractionDocument(validDoc);
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.errors.length, 0);

  const invalidDoc = {
    resumeId: 'resume-uuid-456',
    matchScore: 120, // out of bounds
  };
  const invalidCheck = validateCosmosInteractionDocument(invalidDoc);
  assert.equal(invalidCheck.valid, false);
  assert.ok(invalidCheck.errors.some(e => e.includes('userId')));
  assert.ok(invalidCheck.errors.some(e => e.includes('matchScore')));
});

test('computeDashboardMetrics correctly aggregates totals, average score, and unique gaps', () => {
  const applications = [
    { status: 'Applied' as const },
    { status: 'Screening' as const },
    { status: 'Interview' as const },
    { status: 'Offer' as const },
  ];
  const history = [
    { matchScore: 80, missingSkills: ['Kafka', 'Rust'] },
    { matchScore: 90, missingSkills: ['Rust', 'GraphQL'] },
  ];

  const metrics = computeDashboardMetrics(applications, history);
  assert.equal(metrics.totalApplications, 4);
  assert.equal(metrics.interviewsPending, 2); // Screening + Interview
  assert.equal(metrics.averageMatchScore, 85); // (80 + 90) / 2
  assert.equal(metrics.skillGapsIdentified, 3); // Kafka, Rust, GraphQL
});

test('generateInteractionMarkdownReport produces formatted markdown text', () => {
  const report = generateInteractionMarkdownReport({
    id: 'doc_123',
    companyName: 'Test Corp',
    jobTitle: 'Cloud Architect',
    matchScore: 92,
    timestamp: '2026-10-29T10:00:00Z',
    matchedSkills: ['Python', 'AWS RDS'],
    missingSkills: ['Azure Cosmos'],
    recommendations: [{ title: 'Cosmos Bridge', description: 'Test desc', skillsAddressed: ['Cosmos'] }],
    generatedQuestions: [{ question: 'How to scale?', category: 'Architecture', rationale: 'Check scale' }],
  });

  assert.ok(report.includes('# AI Career Intelligence Analysis Report'));
  assert.ok(report.includes('92%'));
  assert.ok(report.includes('Test Corp'));
  assert.ok(report.includes('How to scale?'));
});
