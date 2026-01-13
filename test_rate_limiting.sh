#!/bin/bash

# Rate Limiting Test Script for Forum API
# Tests /threads endpoint rate limiting (max 10 requests per minute)

set -e

API_URL="http://localhost:8080"
IP_ADDRESS="127.0.0.1"
TEST_RESULTS_FILE="/tmp/rate_limit_test_results.txt"

echo "═══════════════════════════════════════════════════════════════"
echo "           FORUM API - RATE LIMITING TEST SCRIPT"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Testing: /threads endpoint rate limiting"
echo "Limit: 10 requests per 60 seconds (per IP)"
echo "API URL: $API_URL"
echo ""

# Check if server is running
if ! curl -s "$API_URL/health" > /dev/null; then
  echo "❌ API server is not running at $API_URL"
  echo "Please start the server first: npm start"
  exit 1
fi

echo "✅ API server is running"
echo ""

# Clear previous test results
> "$TEST_RESULTS_FILE"

# Create a test thread first
echo "📝 Creating test thread..."
THREAD_RESPONSE=$(curl -s -X POST "$API_URL/threads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"title":"Test Thread","body":"Test Body"}' 2>/dev/null || echo '{}')

THREAD_ID=$(echo "$THREAD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$THREAD_ID" ]; then
  echo "⚠️ Could not create test thread, using test ID"
  THREAD_ID="test-thread-123"
fi

echo "Using thread ID: $THREAD_ID"
echo ""

# Test 1: Make 10 successful requests
echo "🧪 Test 1: Making 10 requests (should all succeed)..."
SUCCESS_COUNT=0
for i in {1..10}; do
  echo -n "  Request $i... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "$API_URL/threads/$THREAD_ID" \
    -H "Content-Type: application/json")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ (200)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "❌ ($HTTP_CODE)"
  fi
  
  echo "$i,$HTTP_CODE" >> "$TEST_RESULTS_FILE"
done

echo ""
echo "✅ Results: $SUCCESS_COUNT/10 requests succeeded"
echo ""

# Test 2: Make 11th request (should be rate limited)
echo "🧪 Test 2: Making 11th request (should be rate limited with 429)..."
HTTP_CODE=$(curl -s -o /tmp/rate_limit_response.json -w "%{http_code}" \
  "$API_URL/threads/$THREAD_ID" \
  -H "Content-Type: application/json")

echo "  Response HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "429" ]; then
  echo "✅ PASS: Rate limit enforced with 429 status"
  echo "Response body:"
  cat /tmp/rate_limit_response.json
else
  echo "❌ FAIL: Expected 429 but got $HTTP_CODE"
  echo "Response body:"
  cat /tmp/rate_limit_response.json
fi

echo ""
echo "11,$HTTP_CODE" >> "$TEST_RESULTS_FILE"

# Test 3: Check rate limit headers
echo ""
echo "🧪 Test 3: Checking rate limit headers..."
HEADERS=$(curl -s -i "$API_URL/threads/$THREAD_ID" \
  -H "Content-Type: application/json" 2>/dev/null | grep -i "x-ratelimit\|retry-after" || true)

if [ -n "$HEADERS" ]; then
  echo "✅ Rate limit headers found:"
  echo "$HEADERS"
else
  echo "⚠️  Rate limit headers not visible (may be in response body)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Results saved to: $TEST_RESULTS_FILE"
echo ""

# Count results
PASSED=0
FAILED=0
while IFS=',' read -r REQUEST_NUM HTTP_CODE; do
  if [ "$REQUEST_NUM" -le 10 ] && [ "$HTTP_CODE" = "200" ]; then
    PASSED=$((PASSED + 1))
  elif [ "$REQUEST_NUM" -eq 11 ] && [ "$HTTP_CODE" = "429" ]; then
    PASSED=$((PASSED + 1))
  else
    FAILED=$((FAILED + 1))
  fi
done < "$TEST_RESULTS_FILE"

echo "✅ PASSED: $PASSED/11"
echo "❌ FAILED: $FAILED/11"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED! Rate limiting is working correctly."
  exit 0
else
  echo "⚠️  Some tests failed. Please review the results above."
  exit 1
fi
