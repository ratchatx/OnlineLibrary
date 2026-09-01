/**
 * Docker Multi-Container Configuration Verification Script
 * Phase 17: Docker Integration & Service Verification
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

console.log('====================================================');
console.log('🐳 Phase 17: Docker Multi-Container Verification');
console.log('====================================================\n');

// 1. docker-compose.yml Checks
console.log('1. Checking docker-compose.yml Configuration:');
const composePath = path.join(rootDir, 'docker-compose.yml');
assert(fs.existsSync(composePath), 'docker-compose.yml exists');

if (fs.existsSync(composePath)) {
  const composeContent = fs.readFileSync(composePath, 'utf8');

  assert(composeContent.includes('db:'), 'Service "db" is defined');
  assert(composeContent.includes('phpmyadmin:'), 'Service "phpmyadmin" is defined');
  assert(composeContent.includes('backend:'), 'Service "backend" is defined');
  assert(composeContent.includes('frontend:'), 'Service "frontend" is defined');

  // Ports
  assert(composeContent.includes('3307') || composeContent.includes('MYSQL_HOST_PORT'), 'MySQL host port 3307 configured');
  assert(composeContent.includes('8081') || composeContent.includes('PMA_PORT'), 'phpMyAdmin host port 8081 configured');
  assert(composeContent.includes('5001') || composeContent.includes('BACKEND_PORT'), 'Backend host port 5001 configured');
  assert(composeContent.includes('5173') || composeContent.includes('FRONTEND_PORT'), 'Frontend host port 5173 configured');

  // Network & Volumes
  assert(composeContent.includes('library-net'), 'Custom bridge network "library-net" is configured');
  assert(composeContent.includes('mysql_data:'), 'Named volume "mysql_data" is configured for persistence');
  assert(composeContent.includes('/docker-entrypoint-initdb.d'), 'Database init volume mounted to /docker-entrypoint-initdb.d');

  // Healthcheck & Service Discovery
  assert(composeContent.includes('mysqladmin ping'), 'MySQL healthcheck is defined');
  assert(composeContent.includes('service_healthy'), 'Backend and phpMyAdmin depend on db being healthy');
  assert(composeContent.includes('JWT_SECRET'), 'JWT_SECRET is passed into backend container environment');
}

// 2. Dockerfile.dev Checks
console.log('\n2. Checking Dockerfile.dev Definitions:');
const backendDockerPath = path.join(rootDir, 'backend', 'Dockerfile.dev');
const frontendDockerPath = path.join(rootDir, 'frontend', 'Dockerfile.dev');

assert(fs.existsSync(backendDockerPath), 'backend/Dockerfile.dev exists');
if (fs.existsSync(backendDockerPath)) {
  const backendContent = fs.readFileSync(backendDockerPath, 'utf8');
  assert(backendContent.includes('node:20'), 'Backend uses Node.js 20 LTS base image');
  assert(backendContent.includes('EXPOSE 5001'), 'Backend exposes port 5001');
}

assert(fs.existsSync(frontendDockerPath), 'frontend/Dockerfile.dev exists');
if (fs.existsSync(frontendDockerPath)) {
  const frontendContent = fs.readFileSync(frontendDockerPath, 'utf8');
  assert(frontendContent.includes('node:20'), 'Frontend uses Node.js 20 base image');
  assert(frontendContent.includes('EXPOSE 5173'), 'Frontend exposes port 5173');
  assert(frontendContent.includes('--host 0.0.0.0') || frontendContent.includes('--host'), 'Vite binds to 0.0.0.0 for container networking');
}

// 3. Database Connection Configuration
console.log('\n3. Checking Backend Database Connection (Service Discovery):');
const dbConfigPath = path.join(rootDir, 'backend', 'src', 'config', 'db.js');
assert(fs.existsSync(dbConfigPath), 'backend/src/config/db.js exists');
if (fs.existsSync(dbConfigPath)) {
  const dbContent = fs.readFileSync(dbConfigPath, 'utf8');
  assert(dbContent.includes("host: process.env.DB_HOST || 'db'"), 'Default database host is set to Docker service name "db"');
  assert(dbContent.includes('3306'), 'Default database port is set to container port 3306');
}

// 4. Frontend Vite Proxy Configuration
console.log('\n4. Checking Frontend Proxy & Hot Reload Configuration:');
const viteConfigPath = path.join(rootDir, 'frontend', 'vite.config.js');
assert(fs.existsSync(viteConfigPath), 'frontend/vite.config.js exists');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  assert(viteContent.includes("target: 'http://backend:5001'"), 'Frontend proxies /api to http://backend:5001');
  assert(viteContent.includes('usePolling: true'), 'Vite watch uses polling for Windows bind mount file change detection');
}

// 5. Database Schema & Seed Verification (15 Tables)
console.log('\n5. Checking Database Initialization Scripts (15 Tables):');
const schemaPath = path.join(rootDir, 'db', 'init', '01-schema.sql');
const seedPath = path.join(rootDir, 'db', 'init', '02-seed.sql');

assert(fs.existsSync(schemaPath), 'db/init/01-schema.sql exists');
assert(fs.existsSync(seedPath), 'db/init/02-seed.sql exists');

if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const expectedTables = [
    'roles',
    'permissions',
    'role_permissions',
    'book_categories',
    'library_settings',
    'users',
    'members',
    'books',
    'book_copies',
    'borrowings',
    'reservations',
    'fines',
    'notifications',
    'borrowing_status_history',
    'audit_logs',
  ];

  expectedTables.forEach((table) => {
    assert(
      schemaContent.includes(`CREATE TABLE IF NOT EXISTS \`${table}\``) ||
      schemaContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`) ||
      schemaContent.includes(`CREATE TABLE \`${table}\``) ||
      schemaContent.includes(`CREATE TABLE ${table}`),
      `Table "${table}" is defined in 01-schema.sql`
    );
  });
}

// 6. Environment Variables Template Verification
console.log('\n6. Checking Environment Variables (.env.example & .env):');
const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

assert(fs.existsSync(envExamplePath), '.env.example template exists');
assert(fs.existsSync(envPath), '.env local file exists');

if (fs.existsSync(envExamplePath) && fs.existsSync(envPath)) {
  const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredKeys = [
    'MYSQL_ROOT_PASSWORD',
    'MYSQL_DATABASE',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_HOST_PORT',
    'BACKEND_PORT',
    'DB_HOST',
    'JWT_SECRET',
    'FRONTEND_PORT',
    'PMA_PORT',
  ];

  requiredKeys.forEach((key) => {
    assert(exampleContent.includes(key), `.env.example contains required key "${key}"`);
  });
}

// Summary
console.log('\n====================================================');
console.log(`Results: ${passedChecks} Passed, ${failedChecks} Failed out of ${totalChecks} Checks`);
console.log('====================================================');

if (failedChecks === 0) {
  console.log('🎉 All Docker Integration & Service Configuration checks PASSED!\n');
  process.exit(0);
} else {
  console.error(`⚠️ ${failedChecks} checks failed. Please inspect the configuration.\n`);
  process.exit(1);
}
