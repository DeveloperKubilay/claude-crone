const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const cron = require('node-cron');

const SERVICES_DIR = path.join(__dirname, 'services');
const CONFIG_FILE = path.join(__dirname, 'config.json');
const CLAUDE_FILE = path.join(__dirname, 'claude.json');

const services = new Map();
const hashes = new Map();

const DEFAULT_CONFIG = {
  checkIntervalHours: 12,
  defaultClaudeFlags: [
    "--dangerously-skip-permissions"
  ]
};

function getConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch (e) {}
  }
  return DEFAULT_CONFIG;
}

// 1. claude.json dosyasını sistem dizinlerine kopyala ve ortam değişkenlerini al
function setupClaudeEnv() {
  const env = { ...process.env };
  if (!fs.existsSync(CLAUDE_FILE)) return env;

  try {
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });

    fs.copyFileSync(CLAUDE_FILE, path.join(homeDir, '.claude.json'));
    fs.copyFileSync(CLAUDE_FILE, path.join(claudeDir, 'settings.json'));

    const config = JSON.parse(fs.readFileSync(CLAUDE_FILE, 'utf8'));
    if (config.env) Object.assign(env, config.env);

    if (!env.ANTHROPIC_API_KEY && env.ANTHROPIC_AUTH_TOKEN) {
      env.ANTHROPIC_API_KEY = env.ANTHROPIC_AUTH_TOKEN;
    }
  } catch (err) {
    console.error('[Claude Setup] Hata:', err.message);
  }

  return env;
}

// 2. Servisleri tara ve zamanla
function scanServices() {
  if (!fs.existsSync(SERVICES_DIR)) {
    fs.mkdirSync(SERVICES_DIR, { recursive: true });
    return;
  }
  const config = getConfig();

  for (const entry of fs.readdirSync(SERVICES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const name = entry.name;
    const dir = path.join(SERVICES_DIR, name);
    const settingsPath = path.join(dir, 'settings.json');

    if (!fs.existsSync(settingsPath)) continue;

    try {
      const raw = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(raw);
      const hash = raw.length + raw;

      if (!settings.enabled) {
        if (services.has(name)) {
          services.get(name).stop();
          services.delete(name);
          hashes.delete(name);
        }
        continue;
      }

      if (!cron.validate(settings.cron)) continue;
      if (services.has(name) && hashes.get(name) === hash) continue;

      if (services.has(name)) services.get(name).stop();

      const task = cron.schedule(settings.cron, () => {
        const model = settings.model || 'otomasyon';
        const prompt = settings.prompt || 'CLAUDE.md içerisindeki talimatları yerine getir.';
        const flags = settings.flags || config.defaultClaudeFlags || ['--dangerously-skip-permissions'];
        const env = setupClaudeEnv();

        console.log(`[${name}] Başlatıldı: ${new Date().toISOString()}`);

        const child = spawn('claude', [...flags, '--model', model, '-p', prompt], {
          cwd: dir,
          stdio: 'inherit',
          shell: true,
          env
        });

        child.on('exit', (code) => {
          console.log(`[${name}] Bitti: ${code === 0 ? 'OK' : `Hata ${code}`}`);
        });
      });

      services.set(name, task);
      hashes.set(name, hash);
      console.log(`[${name}] Zamanlandı: ${settings.cron} (${settings.model || 'otomasyon'})`);
    } catch (e) {
      console.error(`[${name}] Hata:`, e.message);
    }
  }
}

// 3. Başlatma
const initialConfig = getConfig();
setupClaudeEnv();
scanServices();
setInterval(scanServices, initialConfig.checkIntervalHours * 60 * 60 * 1000);

console.log(`[Scheduler] Aktif. Kontrol sıklığı: ${initialConfig.checkIntervalHours} saat.`);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
