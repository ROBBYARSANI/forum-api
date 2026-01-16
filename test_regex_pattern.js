/**
 * Test regex pattern untuk memastikan path matching benar
 */

const pattern = /^\/threads(\/|$)/;

const testCases = [
  // Should match (rate limited)
  { path: '/threads', expected: true },
  { path: '/threads/', expected: true },
  { path: '/threads/123', expected: true },
  { path: '/threads/abc-def', expected: true },
  { path: '/threads/123/comments', expected: true },
  { path: '/threads/123/comments/456', expected: true },
  { path: '/threads/xyz/comments/123/replies', expected: true },
  
  // Should NOT match (not rate limited)
  { path: '/threadsx', expected: false },
  { path: '/threadsomething', expected: false },
  { path: '/users', expected: false },
  { path: '/authentications', expected: false },
  { path: '/health', expected: false },
  { path: '/thread', expected: false },
  { path: '/comments', expected: false },
];

console.log('=== Testing Regex Pattern /^\\/threads(\\/|$)/ ===\n');

let passed = 0;
let failed = 0;

testCases.forEach(({ path, expected }) => {
  const result = pattern.test(path);
  const status = result === expected ? '✓ PASS' : '✗ FAIL';
  
  if (result === expected) {
    passed++;
  } else {
    failed++;
  }
  
  const action = expected ? 'RATE LIMITED' : 'NOT LIMITED';
  console.log(`${status} - ${path.padEnd(40)} → ${action} (${result})`);
});

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n✓ All tests passed! Regex pattern is correct.');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed! Please fix the regex pattern.');
  process.exit(1);
}
