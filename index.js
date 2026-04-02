#!/usr/bin/env bun
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// ⚙️ 配置常量区（在此处直接修改配置）
// ============================================================================

// ---------- 必需配置 ----------
const API_KEY = "sk_你的_API_KEY";
const TELEGRAM_BOT_TOKEN = "你的_TELEGRAM_BOT_TOKEN";
const GATEWAY_TOKEN = "oc_你的_32 位以上_GATEWAY_TOKEN";

// ---------- 自定义 API 提供商配置（✅ 官方模板结构）----------
// 提供商名称（用于模型引用，如 "altare/qwen3-coder-next"）
const API_PROVIDER_NAME = "fucaixie";

// API 端点（用户指定的自定义端点）
const API_BASE_URL = "https://fucaixie.xyz/v1";

// API 类型：openai-completions / openai-chat / anthropic / google
const API_TYPE = "openai-completions";

// 默认模型配置
const AI_MODEL_ID = "claude-opus-4-5";              // 模型 ID（API 实际使用的名称）
const AI_MODEL_NAME = "claude-opus-4-5";            // 显示名称（可选）
const AI_MODEL_PRIMARY = `${API_PROVIDER_NAME}/${AI_MODEL_ID}`;  // 完整引用：altare/qwen3-coder-next

// 模型参数（字符串类型，OpenClaw env 要求）
const AI_MAX_TOKENS = "4096";
const AI_TEMPERATURE = "0.7";

// ---------- Telegram 配置 ----------
const TELEGRAM_ALLOW_FROM = "*";
const TELEGRAM_STREAMING = "off";
const TELEGRAM_GROUP_POLICY = "disabled";

// ---------- Commands 配置 ----------
const COMMANDS_NATIVE = "auto";
const COMMANDS_NATIVE_SKILLS = "auto";
const COMMANDS_RESTART = true;
const COMMANDS_OWNER_DISPLAY = "raw";

// ---------- Control UI 配置 ----------
const CONTROL_UI_ALLOW_INSECURE_AUTH = true;
const CONTROL_UI_DISABLE_DEVICE_AUTH = true;

// ---------- 网络配置 ----------
const SERVER_PORT = 25021;
const GATEWAY_BIND_MODE = "loopback";
const GATEWAY_MODE = "local";
const USE_CLOUDFLARE_TUNNEL = true;

// ---------- 可选配置 ----------
const DISCORD_BOT_TOKEN = "";

// ---------- 自动清理配置 ----------
const AUTO_DELETE_OLD_CONFIG = true;
const KEEP_CONFIG_BACKUP = true;

// ============================================================================
// 🚫 以下代码请勿修改
// ============================================================================

const HOME = process.env.HOME || '/home/container';
const TMP_DIR = path.join(HOME, 'tmp');
const CONFIG_DIR = path.join(HOME, '.openclaw');
const CONFIG_PATH = path.join(CONFIG_DIR, 'openclaw.json');
const DEVICES_DIR = path.join(CONFIG_DIR, 'devices');
const PENDING_CONFIG_PATH = path.join(DEVICES_DIR, 'pending.json');

console.log('🦞 OpenClaw Gateway Bun 启动器 v3.5（官方 models.providers 模板）启动中...');
console.log('========================================================================');

// ============================================================================
// 🔧 1. 临时目录设置
// ============================================================================
fs.mkdirSync(TMP_DIR, { recursive: true });
fs.chmodSync(TMP_DIR, '777');
process.env.TMPDIR = TMP_DIR;
process.env.TMP = TMP_DIR;
process.env.TEMP = TMP_DIR;
process.env.BUN_TMPDIR = TMP_DIR;
process.env.BUN_CACHE_DIR = path.join(HOME, '.bun', 'cache');
console.log('🗂️ 临时目录：' + TMP_DIR);

try {
  const dfTmp = execSync('df -h /tmp | tail -1', { encoding: 'utf8' });
  const dfBig = execSync('df -h ' + TMP_DIR + ' | tail -1', { encoding: 'utf8' });
  console.log('📊 /tmp: ' + dfTmp.trim());
  console.log('📊 数据盘：' + dfBig.trim());
} catch (e) {
  console.log('📊 磁盘信息：无法获取');
}

// ============================================================================
// 🔐 2. 必需配置校验
// ============================================================================
console.log('');
console.log('🔐 校验必需配置...');
console.log('------------------------------------------------------------------------');

// 环境变量优先
const finalApiKey = process.env.API_KEY || API_KEY;
const finalTelegramToken = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
const finalGatewayToken = process.env.GATEWAY_TOKEN || GATEWAY_TOKEN;
const finalDiscordToken = process.env.DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN;

const finalProviderName = process.env.API_PROVIDER_NAME || API_PROVIDER_NAME;
const finalApiBaseUrl = process.env.API_BASE_URL || API_BASE_URL;
const finalApiType = process.env.API_TYPE || API_TYPE;
const finalModelId = process.env.AI_MODEL_ID || AI_MODEL_ID;
const finalModelName = process.env.AI_MODEL_NAME || AI_MODEL_NAME;
const finalModelPrimary = `${finalProviderName}/${finalModelId}`;

const finalMaxTokens = process.env.AI_MAX_TOKENS || AI_MAX_TOKENS;
const finalTemperature = process.env.AI_TEMPERATURE || AI_TEMPERATURE;

const finalTelegramAllowFrom = process.env.TELEGRAM_ALLOW_FROM || TELEGRAM_ALLOW_FROM;
const finalTelegramStreaming = process.env.TELEGRAM_STREAMING || TELEGRAM_STREAMING;
const finalTelegramGroupPolicy = process.env.TELEGRAM_GROUP_POLICY || TELEGRAM_GROUP_POLICY;

const finalCommandsNative = process.env.COMMANDS_NATIVE || COMMANDS_NATIVE;
const finalCommandsNativeSkills = process.env.COMMANDS_NATIVE_SKILLS || COMMANDS_NATIVE_SKILLS;
const finalCommandsRestart = process.env.COMMANDS_RESTART !== undefined 
  ? (process.env.COMMANDS_RESTART === '1' || process.env.COMMANDS_RESTART === 'true')
  : COMMANDS_RESTART;
const finalCommandsOwnerDisplay = process.env.COMMANDS_OWNER_DISPLAY || COMMANDS_OWNER_DISPLAY;

const finalControlUiAllowInsecure = process.env.CONTROL_UI_ALLOW_INSECURE_AUTH !== undefined
  ? (process.env.CONTROL_UI_ALLOW_INSECURE_AUTH === '1' || process.env.CONTROL_UI_ALLOW_INSECURE_AUTH === 'true')
  : CONTROL_UI_ALLOW_INSECURE_AUTH;
const finalControlUiDisableDeviceAuth = process.env.CONTROL_UI_DISABLE_DEVICE_AUTH !== undefined
  ? (process.env.CONTROL_UI_DISABLE_DEVICE_AUTH === '1' || process.env.CONTROL_UI_DISABLE_DEVICE_AUTH === 'true')
  : CONTROL_UI_DISABLE_DEVICE_AUTH;

const finalBindMode = process.env.GATEWAY_BIND_MODE || GATEWAY_BIND_MODE;
const finalGatewayMode = process.env.GATEWAY_MODE || GATEWAY_MODE;
const finalPort = parseInt(process.env.SERVER_PORT || String(SERVER_PORT), 10);
const finalUseCloudflare = process.env.USE_CLOUDFLARE_TUNNEL !== undefined 
  ? (process.env.USE_CLOUDFLARE_TUNNEL === '1' || process.env.USE_CLOUDFLARE_TUNNEL === 'true')
  : USE_CLOUDFLARE_TUNNEL;

// ✅ 校验
if (!finalApiKey || finalApiKey.length < 10 || finalApiKey.includes('你的_')) {
  console.error('❌ API_KEY 未设置！'); process.exit(1);
}
console.log('✅ API_KEY: ' + finalApiKey.substring(0, 10) + '...');

if (!finalTelegramToken || finalTelegramToken.length < 20 || finalTelegramToken.includes('你的_')) {
  console.error('❌ TELEGRAM_BOT_TOKEN 未设置！'); process.exit(1);
}
console.log('✅ TELEGRAM_BOT_TOKEN: ' + finalTelegramToken.substring(0, 15) + '...');

if (!finalGatewayToken || finalGatewayToken.length < 32 || finalGatewayToken.includes('你的_')) {
  console.error('❌ GATEWAY_TOKEN 未设置或长度不足 32 位！'); process.exit(1);
}
console.log('✅ GATEWAY_TOKEN: ' + finalGatewayToken.substring(0, 15) + '...');

console.log('✅ 提供商名称：' + finalProviderName);
console.log('✅ API 端点：' + finalApiBaseUrl);
console.log('✅ API 类型：' + finalApiType);
console.log('✅ 默认模型：' + finalModelPrimary);

let telegramAllowFromList = [];
if (finalTelegramAllowFrom === '*' || finalTelegramAllowFrom === 'all') {
  telegramAllowFromList = ['*'];
  console.log('✅ TELEGRAM_ALLOW_FROM: *');
} else {
  telegramAllowFromList = finalTelegramAllowFrom.split(',').map(id => id.trim()).filter(id => id);
  console.log('✅ TELEGRAM_ALLOW_FROM: ' + telegramAllowFromList.join(', '));
}

console.log('------------------------------------------------------------------------');

// ============================================================================
// 🗑️ 3. 自动清理旧配置
// ============================================================================
console.log('');
console.log('🗑️  清理旧配置文件...');

const autoDelete = process.env.AUTO_DELETE_OLD_CONFIG !== undefined
  ? (process.env.AUTO_DELETE_OLD_CONFIG === '1') : AUTO_DELETE_OLD_CONFIG;
const keepBackup = process.env.KEEP_CONFIG_BACKUP !== undefined
  ? (process.env.KEEP_CONFIG_BACKUP === '1') : KEEP_CONFIG_BACKUP;

if (autoDelete && fs.existsSync(CONFIG_PATH)) {
  if (keepBackup) {
    const backupPath = CONFIG_PATH + '.bak.' + Date.now();
    fs.copyFileSync(CONFIG_PATH, backupPath);
    console.log('📦 已备份：' + backupPath);
  }
  fs.unlinkSync(CONFIG_PATH);
  console.log('🗑️  已删除旧配置');
}
if (fs.existsSync(PENDING_CONFIG_PATH)) {
  fs.unlinkSync(PENDING_CONFIG_PATH);
}
console.log('------------------------------------------------------------------------');

// ============================================================================
// ⚙️ 4. 生成新配置（✅ 官方 models.providers 模板结构）
// ============================================================================
console.log('');
console.log('⚙️  生成新配置文件...');

fs.mkdirSync(CONFIG_DIR, { recursive: true });

// ✅ 使用官方模板结构构建配置
const config = {
  // 1️⃣ 环境变量块（API Key 放这里，models 中用 ${VAR} 引用）
  env: {
    [`${finalProviderName.toUpperCase()}_API_KEY`]: String(finalApiKey),
    TELEGRAM_BOT_TOKEN: String(finalTelegramToken)
  },

  // 2️⃣ Agents 配置（默认模型引用格式：provider_name/model_id）
  agents: {
    defaults: {
      model: {
        primary: finalModelPrimary
      }
    }
  },

  // 3️⃣ Models 配置（自定义提供商定义）
  models: {
    providers: {
      [finalProviderName]: {
        baseUrl: String(finalApiBaseUrl).replace(/\/$/, ''),
        apiKey: `\${${finalProviderName.toUpperCase()}_API_KEY}`,  // 引用 env 中的变量
        api: finalApiType,
        models: [
          {
            id: finalModelId,
            name: finalModelName || finalModelId
          }
        ]
      }
    }
  },

  // 4️⃣ Gateway 配置
  gateway: {
    bind: finalBindMode,
    mode: finalGatewayMode,
    port: finalPort,
    controlUi: {
      allowInsecureAuth: finalControlUiAllowInsecure,
      dangerouslyDisableDeviceAuth: finalControlUiDisableDeviceAuth,
      allowedOrigins: ["*"],
    },
    auth: { mode: "token", token: finalGatewayToken }
  },

  // 5️⃣ Channels 配置
  channels: {
    telegram: {
      enabled: true,
      dmPolicy: "allowlist",
      allowFrom: telegramAllowFromList,
      groupPolicy: finalTelegramGroupPolicy,
      streaming: finalTelegramStreaming
    }
  },

  // 6️⃣ Commands 配置
  commands: {
    native: finalCommandsNative,
    nativeSkills: finalCommandsNativeSkills,
    restart: finalCommandsRestart,
    ownerDisplay: finalCommandsOwnerDisplay
  }
};

// ============================================================================
// 🔑 5. 日志输出配置信息
// ============================================================================
console.log('');
console.log('🔑 配置环境变量块 (env)...');
console.log('------------------------------------------------------------------------');
console.log('✅ ' + finalProviderName.toUpperCase() + '_API_KEY: 已设置');
console.log('✅ TELEGRAM_BOT_TOKEN: 已设置');

console.log('');
console.log('🤖 配置 Agents 块...');
console.log('------------------------------------------------------------------------');
console.log('✅ 默认模型：' + config.agents.defaults.model.primary);

console.log('');
console.log('🧩 配置 Models 块...');
console.log('------------------------------------------------------------------------');
console.log('✅ 提供商：' + finalProviderName);
console.log('✅ Base URL: ' + config.models.providers[finalProviderName].baseUrl);
console.log('✅ API 类型：' + config.models.providers[finalProviderName].api);
console.log('✅ 模型列表：' + config.models.providers[finalProviderName].models.map(m => m.id).join(', '));

console.log('------------------------------------------------------------------------');

// ============================================================================
// 💾 6. 保存配置
// ============================================================================
console.log('');
console.log('💾 保存配置文件...');

fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
fs.chmodSync(CONFIG_PATH, '600');
console.log('✅ 配置已保存：' + CONFIG_PATH);

// 预览（脱敏）
const preview = JSON.parse(JSON.stringify(config));
const envKey = `${finalProviderName.toUpperCase()}_API_KEY`;
if (preview.env?.[envKey]) preview.env[envKey] = '***';
if (preview.env?.TELEGRAM_BOT_TOKEN) preview.env.TELEGRAM_BOT_TOKEN = '***';
if (preview.gateway?.auth?.token) preview.gateway.auth.token = '***';
console.log('');
console.log('📋 配置预览:');
console.log(JSON.stringify(preview, null, 2));

// ============================================================================
// 🔓 7. 自动配对配置
// ============================================================================
fs.mkdirSync(DEVICES_DIR, { recursive: true });
fs.writeFileSync(PENDING_CONFIG_PATH, JSON.stringify({
  silent: true,
  autoApprove: ["browser", "cli", "node", "mobile"],
  logLevel: "warn"
}, null, 2));
fs.chmodSync(PENDING_CONFIG_PATH, '600');

// ============================================================================
// 🌐 8. Cloudflare Tunnel
// ============================================================================
function getCloudflaredArch() {
  try {
    const arch = execSync('uname -m', { encoding: 'utf8' }).trim();
    // 架构映射：返回 cloudflared 文件名中的架构标识
    const archMap = {
      'x86_64': 'amd64',
      'amd64': 'amd64',
      'aarch64': 'arm64',
      'arm64': 'arm64',
      'armv7l': 'arm',
      'armv6l': 'arm'
    };
    return archMap[arch] || 'amd64'; // 默认 fallback 到 amd64
  } catch (e) {
    console.warn('⚠️ 无法检测系统架构，默认使用 amd64');
    return 'amd64';
  }
}
let tunnelChild = null;
if (finalUseCloudflare) {
  console.log('');
  console.log('☁️  启动 Cloudflare Tunnel...');
  const cfPath = path.join(HOME, 'cloudflared');
  if (!fs.existsSync(cfPath)) {
	  try {
		const cfArch = getCloudflaredArch();
		const cfUrl = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${cfArch}`;
		console.log(`📦 下载 cloudflared (架构: ${cfArch})...`);
		execSync(`curl -Lo ${cfPath} "${cfUrl}"`, { stdio: 'inherit' });
		execSync('chmod +x ' + cfPath, { stdio: 'inherit' });
		console.log('✅ cloudflared 下载完成: ' + cfPath);
	  } catch (e) {
		console.error('❌ cloudflared 下载失败: ' + e.message);
		console.error('💡 请手动下载对应架构版本: https://github.com/cloudflare/cloudflared/releases');
		process.exit(1);
	  }
	}
  tunnelChild = spawn(cfPath, ['tunnel', '--url', 'http://localhost:' + finalPort], {
    stdio: 'inherit', env: process.env, shell: false
  });
  console.log('⏳ 等待 5 秒...');
}

// ============================================================================
// 🚀 9. 启动 Gateway
// ============================================================================
setTimeout(function() {
  console.log('');
  console.log('🚀 启动 OpenClaw Gateway...');
  console.log('========================================================================');
  console.log('🤖 默认模型：' + config.agents.defaults.model.primary);
  console.log('🧩 自定义提供商：' + finalProviderName);
  console.log('🌐 API 端点：' + config.models.providers[finalProviderName].baseUrl);
  console.log('📱 Telegram: 已启用');
  console.log('========================================================================');
  
  const child = spawn('bunx', ['openclaw@latest', 'gateway', 'run'], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { NODE_ENV: 'production' }),
    shell: false
  });
  
  child.on('error', (err) => { console.error('❌ ' + err.message); if (tunnelChild) tunnelChild.kill(); process.exit(1); });
  child.on('exit', (code) => { if (tunnelChild) tunnelChild.kill(); process.exit(code || 0); });
  process.on('SIGINT', () => { child.kill('SIGINT'); if (tunnelChild) tunnelChild.kill(); });
  process.on('SIGTERM', () => { child.kill('SIGTERM'); if (tunnelChild) tunnelChild.kill(); });
}, finalUseCloudflare ? 5000 : 0);
