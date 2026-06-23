const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cron = require('node-cron');

const SERVICES_DIR = path.join(__dirname, 'services');
const services = new Map();
const configHashes = new Map();

function scanServices() {
  const entries = fs.readdirSync(SERVICES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const serviceName = entry.name;
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const settingsPath = path.join(servicePath, 'settings.json');

    if (!fs.existsSync(settingsPath)) continue;

    loadService(serviceName, servicePath, settingsPath);
  }
}

function loadService(serviceName, servicePath, settingsPath) {
  const content = fs.readFileSync(settingsPath, 'utf8');
  const settings = JSON.parse(content);
  const hash = hashString(content);

  if (!settings.enabled) {
    if (services.has(serviceName)) {
      services.get(serviceName).stop();
      services.delete(serviceName);
      configHashes.delete(serviceName);
    }
    return;
  }

  if (!cron.validate(settings.cron)) return;

  if (services.has(serviceName) && configHashes.get(serviceName) === hash) return;

  if (services.has(serviceName)) {
    services.get(serviceName).stop();
  }

  const task = cron.schedule(settings.cron, () => {
    const model = settings.model || 'test';
    const prompt = settings.prompt || 'run';

    console.log(`[${serviceName}] ${new Date().toISOString()}`);

    const child = spawn('claude', ['--model', model, '-p', prompt], {
      cwd: servicePath,
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      console.log(`[${serviceName}] ${code === 0 ? 'OK' : `Error ${code}`}`);
    });
  });

  services.set(serviceName, task);
  configHashes.set(serviceName, hash);
  console.log(`[${serviceName}] ${settings.cron}`);
}

function checkUpdates() {
  const entries = fs.readdirSync(SERVICES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const serviceName = entry.name;
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const settingsPath = path.join(servicePath, 'settings.json');

    if (!fs.existsSync(settingsPath)) continue;

    const content = fs.readFileSync(settingsPath, 'utf8');
    const newHash = hashString(content);
    const oldHash = configHashes.get(serviceName);

    if (oldHash !== newHash) {
      loadService(serviceName, servicePath, settingsPath);
    }
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

scanServices();
setInterval(checkUpdates, 60000);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
