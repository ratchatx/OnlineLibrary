/**
 * Final Production Release Verification Script
 * Online Library Management System
 * Phase 20: Production Deployment & Release
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value`);
    },
    toContain(expected) {
      if (!actual || !actual.includes(expected)) throw new Error(`Expected content to contain ${JSON.stringify(expected)}`);
    },
  };
}

console.log('================================================================');
console.log('📦 Phase 20: Final Production Release & Deployment Audit');
console.log('================================================================\n');

// -------------------------------------------------------------------
// 1. ROOT MULTI-STAGE DOCKERFILE AUDIT (Target A: Railway)
// -------------------------------------------------------------------
console.log('1. Root Multi-Stage Dockerfile (Target A: Railway Single Container):');

test('Dockerfile', 'Root Multi-Stage Dockerfile exists', () => {
  const dockerfilePath = path.join(rootDir, 'Dockerfile');
  expect(fs.existsSync(dockerfilePath)).toBe(true);
});

test('Dockerfile', 'Stage 1: Frontend Builder compiles Vite React SPA', () => {
  const content = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf8');
  expect(content).toContain('FROM node:20-alpine AS frontend-builder');
  expect(content).toContain('npm run build');
});

test('Dockerfile', 'Stage 2: Backend Builder installs production dependencies only', () => {
  const content = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf8');
  expect(content).toContain('FROM node:20-alpine AS backend-builder');
  expect(content).toContain('npm install --omit=dev');
});

test('Dockerfile', 'Stage 3: Production Runner runs as non-root user node on port 5001', () => {
  const content = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf8');
  expect(content).toContain('FROM node:20-alpine AS runner');
  expect(content).toContain('ENV NODE_ENV=production');
  expect(content).toContain('COPY --from=frontend-builder /app/frontend/dist ./public');
  expect(content).toContain('USER node');
  expect(content).toContain('EXPOSE 5001');
  expect(content).toContain('CMD ["node", "src/server.js"]');
});

// -------------------------------------------------------------------
// 2. RAILWAY DEPLOYMENT CONFIGURATION
// -------------------------------------------------------------------
console.log('\n2. Railway Deployment Configuration (railway.toml):');

test('Railway Config', 'railway.toml exists and configures Dockerfile build and healthcheck', () => {
  const railwayPath = path.join(rootDir, 'railway.toml');
  expect(fs.existsSync(railwayPath)).toBe(true);
  const content = fs.readFileSync(railwayPath, 'utf8');
  expect(content).toContain('builder = "DOCKERFILE"');
  expect(content).toContain('dockerfilePath = "Dockerfile"');
  expect(content).toContain('healthcheckPath = "/api/v1/health"');
});

// -------------------------------------------------------------------
// 3. ON-PREMISE PRODUCTION CONFIGURATION (Target B: Nginx Reverse Proxy)
// -------------------------------------------------------------------
console.log('\n3. On-Premise Production Deployment (docker-compose.prod.yml & Nginx):');

test('On-Premise Compose', 'docker-compose.prod.yml exists and defines app, db, nginx services', () => {
  const prodComposePath = path.join(rootDir, 'docker-compose.prod.yml');
  expect(fs.existsSync(prodComposePath)).toBe(true);
  const content = fs.readFileSync(prodComposePath, 'utf8');
  expect(content).toContain('container_name: library_prod_db');
  expect(content).toContain('container_name: library_prod_app');
  expect(content).toContain('container_name: library_prod_nginx');
  expect(content).toContain('mysql_prod_data:');
});

test('Nginx Config', 'nginx/default.conf exists and configures gzip, security headers & reverse proxy', () => {
  const nginxPath = path.join(rootDir, 'nginx', 'default.conf');
  expect(fs.existsSync(nginxPath)).toBe(true);
  const content = fs.readFileSync(nginxPath, 'utf8');
  expect(content).toContain('listen 80');
  expect(content).toContain('gzip on');
  expect(content).toContain('proxy_pass http://app:5001/api/');
  expect(content).toContain('X-Frame-Options');
});

// -------------------------------------------------------------------
// 4. BACKEND PRODUCTION STATIC SPA SERVING
// -------------------------------------------------------------------
console.log('\n4. Backend Production Static SPA Serving & Fallback:');

test('Backend Static Serving', 'server.js serves static assets from /public and provides SPA routing fallback', () => {
  const serverPath = path.join(rootDir, 'backend', 'src', 'server.js');
  const content = fs.readFileSync(serverPath, 'utf8');
  expect(content).toContain("path.join(__dirname, '../public')");
  expect(content).toContain('express.static(publicPath)');
  expect(content).toContain("app.get('*'");
  expect(content).toContain("res.sendFile(path.join(publicPath, 'index.html'))");
});

// -------------------------------------------------------------------
// 5. DOCUMENTATION & RELEASE HANDOVER AUDIT
// -------------------------------------------------------------------
console.log('\n5. Documentation & Release Handover Audit:');

test('Documentation', 'Deployment Guide (docs/deployment/01-deployment-guide.md) exists', () => {
  const guidePath = path.join(rootDir, 'docs', 'deployment', '01-deployment-guide.md');
  expect(fs.existsSync(guidePath)).toBe(true);
  const content = fs.readFileSync(guidePath, 'utf8');
  expect(content).toContain('Railway Deployment Instructions');
  expect(content).toContain('On-Premise Deployment Instructions');
});

test('Documentation', 'E2E Test Plan & Report exist in docs/testing/', () => {
  expect(fs.existsSync(path.join(rootDir, 'docs', 'testing', '01-e2e-test-plan.md'))).toBe(true);
  expect(fs.existsSync(path.join(rootDir, 'docs', 'testing', '02-e2e-test-report.md'))).toBe(true);
});

test('Documentation', 'README.md reflects 100% completion across all 21 phases', () => {
  const readmeContent = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  expect(readmeContent).toContain('Implementation Progress (100% Complete)');
  expect(readmeContent).toContain('Production Deployment & Release');
});

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Results: ${passedChecks} Passed, ${failedChecks} Failed out of ${totalChecks} Checks`);
console.log('================================================================');

if (failedChecks === 0) {
  console.log('🎉 100% READY FOR RELEASE! All production deployment artifacts verified.\n');
  process.exit(0);
} else {
  console.error(`⚠️ ${failedChecks} release check(s) failed.\n`);
  process.exit(1);
}
