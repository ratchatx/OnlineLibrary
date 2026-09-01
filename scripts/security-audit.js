/**
 * Security Hardening & OWASP Top 10 Audit Verification Script
 * Online Library Management System
 * Phase 19: Security Hardening & Production Audit
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function test(category, name, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    failedChecks++;
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value`);
    },
    toContain(expected) {
      if (!actual || !actual.includes(expected)) throw new Error(`Expected content to contain ${JSON.stringify(expected)}`);
    },
    toNotContain(expected) {
      if (actual && actual.includes(expected)) throw new Error(`Expected content to NOT contain ${JSON.stringify(expected)}`);
    },
  };
}

console.log('================================================================');
console.log('🛡️ Phase 19: Security Hardening & Production Security Audit');
console.log('================================================================\n');

// -------------------------------------------------------------------
// 1. RATE LIMITING & BRUTE FORCE PROTECTION
// -------------------------------------------------------------------
console.log('1. Rate Limiting & Brute-Force Attack Mitigation:');

test('Rate Limiter', 'Rate limiter middleware file exists and exports limiters', () => {
  const rateLimiterPath = path.join(backendDir, 'src', 'middlewares', 'rateLimiter.js');
  expect(fs.existsSync(rateLimiterPath)).toBe(true);
  const content = fs.readFileSync(rateLimiterPath, 'utf8');
  expect(content).toContain('authRateLimiter');
  expect(content).toContain('apiRateLimiter');
  expect(content).toContain('429');
  expect(content).toContain('Retry-After');
});

test('Rate Limiter', 'Auth Rate Limiter restricts auth endpoints to 10 req/min', () => {
  const { authRateLimiter } = require(path.join(backendDir, 'src', 'middlewares', 'rateLimiter'));
  expect(typeof authRateLimiter).toBe('function');

  // Simulate requests from a test IP
  const req = { ip: '192.168.1.99', headers: {} };
  let statusCode = 200;
  let resBody = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (body) => { resBody = body; },
      };
    },
  };

  // Send 10 requests -> all should pass
  for (let i = 0; i < 10; i++) {
    let nextCalled = false;
    authRateLimiter(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  }

  // 11th request -> should be blocked with 429
  let nextCalled11 = false;
  authRateLimiter(req, res, () => { nextCalled11 = true; });
  expect(nextCalled11).toBe(false);
  expect(statusCode).toBe(429);
  expect(resBody.success).toBe(false);
});

test('Rate Limiter', 'Auth routes apply authRateLimiter on POST /login', () => {
  const authRoutesContent = fs.readFileSync(path.join(backendDir, 'src', 'routes', 'authRoutes.js'), 'utf8');
  expect(authRoutesContent).toContain('authRateLimiter');
  expect(authRoutesContent).toContain("router.post('/login', authRateLimiter");
});

// -------------------------------------------------------------------
// 2. INPUT SANITIZATION & XSS PROTECTION
// -------------------------------------------------------------------
console.log('\n2. Input Sanitization & Cross-Site Scripting (XSS) Prevention:');

test('Sanitizer', 'Input Sanitizer middleware file exists and exports sanitize functions', () => {
  const sanitizerPath = path.join(backendDir, 'src', 'middlewares', 'sanitizer.js');
  expect(fs.existsSync(sanitizerPath)).toBe(true);
  const content = fs.readFileSync(sanitizerPath, 'utf8');
  expect(content).toContain('inputSanitizer');
  expect(content).toContain('sanitizeString');
  expect(content).toContain('sanitizeData');
});

test('Sanitizer', 'Sanitizer strips script tags, event handlers, and javascript pseudo-protocols', () => {
  const { sanitizeString, sanitizeData } = require(path.join(backendDir, 'src', 'middlewares', 'sanitizer'));

  // Test script tag stripping
  const scriptPayload = 'Hello <script>alert("XSS")</script>World';
  expect(sanitizeString(scriptPayload)).toBe('Hello World');

  // Test event handler stripping
  const eventPayload = '<img src=x onerror=alert(1)>';
  expect(sanitizeString(eventPayload)).toNotContain('onerror=');

  // Test javascript: protocol stripping
  const jsProtoPayload = 'javascript:evil()';
  expect(sanitizeString(jsProtoPayload)).toBe('evil()');

  // Test nested object sanitization
  const nestedObj = {
    title: 'Valid Title',
    notes: 'Safe content <script>bad()</script>',
    tags: ['<script>xss</script>tech', 'clean'],
    profile: {
      bio: 'Bio text with <script>hack()</script>',
    },
  };
  const sanitized = sanitizeData(nestedObj);
  expect(sanitized.title).toBe('Valid Title');
  expect(sanitized.notes).toBe('Safe content');
  expect(sanitized.tags[0]).toBe('tech');
  expect(sanitized.profile.bio).toBe('Bio text with');
});

test('Sanitizer', 'Server applies inputSanitizer globally before routes', () => {
  const serverContent = fs.readFileSync(path.join(backendDir, 'src', 'server.js'), 'utf8');
  expect(serverContent).toContain('inputSanitizer');
  expect(serverContent).toContain('app.use(inputSanitizer)');
});

// -------------------------------------------------------------------
// 3. HTTP SECURITY HEADERS & CORS HARDENING
// -------------------------------------------------------------------
console.log('\n3. HTTP Security Headers (Helmet) & CORS Configuration:');

test('Headers & CORS', 'Helmet security headers configured in server.js', () => {
  const serverContent = fs.readFileSync(path.join(backendDir, 'src', 'server.js'), 'utf8');
  expect(serverContent).toContain("const helmet = require('helmet')");
  expect(serverContent).toContain('app.use(helmet())');
});

test('Headers & CORS', 'CORS restricts origin and limits allowed HTTP methods and headers', () => {
  const serverContent = fs.readFileSync(path.join(backendDir, 'src', 'server.js'), 'utf8');
  expect(serverContent).toContain('allowedOrigins');
  expect(serverContent).toContain('http://localhost:5173');
  expect(serverContent).toContain("methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']");
  expect(serverContent).toContain("allowedHeaders: ['Content-Type', 'Authorization']");
});

// -------------------------------------------------------------------
// 4. SENSITIVE DATA & PASSWORD SCRUBBING
// -------------------------------------------------------------------
console.log('\n4. Sensitive Data & PII Scrubbing:');

test('Data Scrubbing', 'Auth controller never returns password_hash in login or me responses', () => {
  const authControllerContent = fs.readFileSync(path.join(backendDir, 'src', 'controllers', 'authController.js'), 'utf8');
  expect(authControllerContent).toContain('user.id');
  expect(authControllerContent).toContain('user.username');
  expect(authControllerContent).toNotContain('password_hash:');
});

test('Data Scrubbing', 'Member controller omits password_hash from member queries', () => {
  const memberModelContent = fs.readFileSync(path.join(backendDir, 'src', 'models', 'memberModel.js'), 'utf8');
  expect(memberModelContent).toNotContain('password_hash');
});

// -------------------------------------------------------------------
// 5. PRODUCTION ERROR MASKING
// -------------------------------------------------------------------
console.log('\n5. Production Error Masking & Stack Trace Protection:');

test('Error Masking', 'Error handler masks stack traces when NODE_ENV is production', () => {
  const errorHandlerContent = fs.readFileSync(path.join(backendDir, 'src', 'middlewares', 'errorHandler.js'), 'utf8');
  expect(errorHandlerContent).toContain("process.env.NODE_ENV === 'development'");
  expect(errorHandlerContent).toContain('stack: err.stack');
});

// -------------------------------------------------------------------
// 6. GIT & SECRET LEAKAGE PREVENTION
// -------------------------------------------------------------------
console.log('\n6. Git & Secret Leakage Prevention (.gitignore & Secrets Scan):');

test('Git Security', '.gitignore properly ignores .env, credentials, and node_modules', () => {
  const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  expect(gitignoreContent).toContain('.env');
  expect(gitignoreContent).toContain('node_modules');
  expect(gitignoreContent).toContain('*.log');
});

test('Secret Scan', 'No hardcoded private keys or live cloud passwords in source code', () => {
  const scannedDirs = [
    path.join(backendDir, 'src'),
    path.join(frontendDir, 'src'),
  ];

  const dangerousPatterns = [
    /-----BEGIN RSA PRIVATE KEY-----/,
    /-----BEGIN OPENSSH PRIVATE KEY-----/,
    /AIzaSy[A-Za-z0-9-_]{33}/, // Google API Key pattern
    /ghp_[A-Za-z0-9]{36}/,     // GitHub Token pattern
    /sk_live_[0-9a-zA-Z]{24}/,  // Stripe live key
  ];

  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scanDir(fullPath);
      } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        dangerousPatterns.forEach((pat) => {
          if (pat.test(content)) {
            throw new Error(`Potential secret leak detected in ${fullPath} matching ${pat}`);
          }
        });
      }
    }
  }

  scannedDirs.forEach((dir) => scanDir(dir));
});

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Results: ${passedChecks} Passed, ${failedChecks} Failed out of ${totalChecks} Checks`);
console.log('================================================================');

if (failedChecks === 0) {
  console.log('🎉 Security Audit PASSED! System is hardened for Production Readiness.\n');
  process.exit(0);
} else {
  console.error(`⚠️ ${failedChecks} security check(s) failed.\n`);
  process.exit(1);
}
