const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cron = require('node-cron');

const SERVICES_DIR = path.join(__dirname, 'services');
const services = new Map();
const configHashes = new Map();

// config.json'dan kontrol periyodunu oku (varsayılan: 24 saat)
let checkIntervalHours = 24;
if (fs.existsSync(path.join(__dirname, 'config.json'))) {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    if (config.checkIntervalHours) checkIntervalHours = config.checkIntervalHours;
  } catch (e) {}
}

function scanServices() {
  if (!fs.existsSync(SERVICES_DIR)) return;
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
    const model = settings.model || 'otomasyon';
    const prompt = settings.prompt || 'CLAUDE.md içerisindeki talimatları yerine getir.';

    console.log(`[${serviceName}] Çalıştırılıyor: ${new Date().toISOString()}`);

    // Docker içinde tam yetkili ve soru sormadan çalışması için --dangerously-skip-permissions
    const child = spawn('claude', ['--dangerously-skip-permissions', '--model', model, '-p', prompt], {
      cwd: servicePath,
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      console.log(`[${serviceName}] Tamamlandı: ${code === 0 ? 'OK' : `Hata ${code}`}`);
    });
  });

  services.set(serviceName, task);
  configHashes.set(serviceName, hash);
  console.log(`[${serviceName}] Zamanlandı: ${settings.cron} (Model: ${settings.model || 'otomasyon'})`);
}

function checkUpdates() {
  scanServices();
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
setInterval(checkUpdates, checkIntervalHours * 60 * 60 * 1000);
console.log(`[Scheduler] Başlatıldı. Güncelleme kontrol sıklığı: ${checkIntervalHours} saat.`);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
