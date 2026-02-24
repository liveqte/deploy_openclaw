#!/usr/bin/env bun
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// ⚙️ 配置常量区（在此处直接修改配置）
// ============================================================================

// ---------- 必需配置（必须填写）----------
const OPENROUTER_API_KEY = "sk-or-v1-你的_OPENROUTER_API_KEY";
const TELEGRAM_BOT_TOKEN = "你的_TELEGRAM_BOT_TOKEN";
const GATEWAY_TOKEN = "oc_你的_32 位以上_GATEWAY_TOKEN";

// ---------- AI 配置 ----------
const AI_MODEL = "openrouter/arcee-ai/trinity-large-preview:free";
const AI_MAX_TOKENS = 4096;
const AI_TEMPERATURE = 0.7;
const AI_MODEL_FALLBACK = "";

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
const OPENAI_API_KEY = "";
const ANTHROPIC_API_KEY = "";
const DISCORD_BOT_TOKEN = "";

// ============================================================================
// 🚫 以下代码请勿修改
// ============================================================================

const HOME = process.env.HOME || '/home/container';
const TMP_DIR = path.join(HOME, 'tmp');
const CONFIG_DIR = path.join(HOME, '.openclaw');
const CONFIG_PATH = path.join(CONFIG_DIR, 'openclaw.json');
const DEVICES_DIR = path.join(CONFIG_DIR, 'devices');
const PENDING_CONFIG_PATH = path.join(DEVICES_DIR, 'pending.json');

console.log('🦞 OpenClaw Gateway Bun 启动器 v2.7（Agents 配置修复）启动中...');
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

const finalOpenRouterKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
const finalTelegramToken = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
const finalGatewayToken = process.env.GATEWAY_TOKEN || GATEWAY_TOKEN;
const finalAiModel = process.env.AI_MODEL || AI_MODEL;
const finalTelegramAllowFrom = process.env.TELEGRAM_ALLOW_FROM || TELEGRAM_ALLOW_FROM;
const finalTelegramStreaming = process.env.TELEGRAM_STREAMING || TELEGRAM_STREAMING;
const finalTelegramGroupPolicy = process.env.TELEGRAM_GROUP_POLICY || TELEGRAM_GROUP_POLICY;
const finalBindMode = process.env.GATEWAY_BIND_MODE || GATEWAY_BIND_MODE;
const finalGatewayMode = process.env.GATEWAY_MODE || GATEWAY_MODE;
const finalPort = parseInt(process.env.SERVER_PORT || String(SERVER_PORT), 10);
const finalUseCloudflare = process.env.USE_CLOUDFLARE_TUNNEL !== undefined 
  ? (process.env.USE_CLOUDFLARE_TUNNEL === '1' || process.env.USE_CLOUDFLARE_TUNNEL === 'true')
  : USE_CLOUDFLARE_TUNNEL;

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

// ✅ OPENROUTER_API_KEY
if (!finalOpenRouterKey || finalOpenRouterKey.length < 10 || finalOpenRouterKey.includes('你的_')) {
  console.error('❌ 致命错误：OPENROUTER_API_KEY 未设置！');
  process.exit(1);
}
console.log('✅ OPENROUTER_API_KEY: ' + finalOpenRouterKey.substring(0, 10) + '...');

// ✅ TELEGRAM_BOT_TOKEN
if (!finalTelegramToken || finalTelegramToken.length < 20 || finalTelegramToken.includes('你的_')) {
  console.error('❌ 致命错误：TELEGRAM_BOT_TOKEN 未设置！');
  process.exit(1);
}
console.log('✅ TELEGRAM_BOT_TOKEN: ' + finalTelegramToken.substring(0, 15) + '...');

// ✅ GATEWAY_TOKEN
if (!finalGatewayToken || finalGatewayToken.length < 32 || finalGatewayToken.includes('你的_')) {
  console.error('❌ 致命错误：GATEWAY_TOKEN 未设置或长度不足 32 位！');
  process.exit(1);
}
console.log('✅ GATEWAY_TOKEN: ' + finalGatewayToken.substring(0, 15) + '...');

console.log('✅ AI_MODEL: ' + finalAiModel);

let telegramAllowFromList = [];
if (finalTelegramAllowFrom === '*' || finalTelegramAllowFrom === 'all') {
  telegramAllowFromList = ['*'];
  console.log('✅ TELEGRAM_ALLOW_FROM: * (允许所有用户)');
} else {
  telegramAllowFromList = finalTelegramAllowFrom.split(',').map(id => id.trim()).filter(id => id);
  console.log('✅ TELEGRAM_ALLOW_FROM: ' + telegramAllowFromList.join(', '));
}

console.log('------------------------------------------------------------------------');

// ============================================================================
// ⚙️ 3. 配置读取与预修复
// ============================================================================
console.log('');
console.log('⚙️  读取/生成配置文件...');
console.log('------------------------------------------------------------------------');

let config = {};

if (fs.existsSync(CONFIG_PATH)) {
  console.log('📝 读取现有配置文件...');
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.warn('⚠️ 配置文件解析失败：' + err.message);
    config = {};
  }
} else {
  console.log('📝 创建新配置目录...');
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

config.gateway = config.gateway || {};
config.env = config.env || {};
config.agents = config.agents || {};
config.channels = config.channels || {};
config.commands = config.commands || {};

// 清理无效键
if (config.gateway.host) delete config.gateway.host;
if (config.gateway.token) {
  config.gateway.auth = config.gateway.auth || {};
  config.gateway.auth.token = config.gateway.token;
  config.gateway.auth.mode = "token";
  delete config.gateway.token;
}
if (config.server) delete config.server;

// ============================================================================
// 🌐 4. Gateway 配置 + Control UI
// ============================================================================
config.gateway.bind = finalBindMode;
config.gateway.mode = finalGatewayMode;
config.gateway.port = finalPort;
config.gateway.controlUi = {
  allowInsecureAuth: finalControlUiAllowInsecure,
  dangerouslyDisableDeviceAuth: finalControlUiDisableDeviceAuth
};

if (!config.gateway.auth) {
  config.gateway.auth = { mode: "token", token: finalGatewayToken };
} else {
  config.gateway.auth.mode = "token";
  config.gateway.auth.token = finalGatewayToken;
}

console.log('🔗 绑定模式：' + config.gateway.bind);
console.log('🔌 端口：' + finalPort);
console.log('🎛️ Control UI: 设备认证' + (finalControlUiDisableDeviceAuth ? '已禁用' : '已启用'));

// ============================================================================
// 🔑 5. Env 配置
// ============================================================================
config.env.OPENROUTER_API_KEY = finalOpenRouterKey;
config.env.TELEGRAM_BOT_TOKEN = finalTelegramToken;

if (process.env.OPENAI_API_KEY || OPENAI_API_KEY) {
  config.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
}
if (process.env.ANTHROPIC_API_KEY || ANTHROPIC_API_KEY) {
  config.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ANTHROPIC_API_KEY;
}

console.log('✅ Env 配置完成');

// ============================================================================
// 🤖 6. Agents 配置（✅ 修复：model 是字符串，不是对象）
// ============================================================================
const finalMaxTokens = parseInt(process.env.AI_MAX_TOKENS || String(AI_MAX_TOKENS), 10);
const finalTemperature = parseFloat(process.env.AI_TEMPERATURE || String(AI_TEMPERATURE));
const finalAiFallback = process.env.AI_MODEL_FALLBACK || AI_MODEL_FALLBACK;

config.agents.defaults = {
  model: finalAiModel,  // ✅ 字符串，不是对象
  maxTokens: finalMaxTokens,
  temperature: finalTemperature
};

if (finalAiFallback) {
  config.agents.defaults.fallback = finalAiFallback;
}

console.log('✅ AI 模型：' + config.agents.defaults.model);
console.log('✅ Max Tokens: ' + finalMaxTokens);
console.log('✅ Temperature: ' + finalTemperature);
if (finalAiFallback) {
  console.log('✅ 备用模型：' + finalAiFallback);
}

// ============================================================================
// 📱 7. Channels 配置
// ============================================================================
config.channels.telegram = {
  enabled: true,
  dmPolicy: "allowlist",
  allowFrom: telegramAllowFromList,
  groupPolicy: finalTelegramGroupPolicy,
  streaming: finalTelegramStreaming
};

const finalDiscordToken = process.env.DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN;
if (finalDiscordToken) {
  config.channels.discord = {
    enabled: true,
    botToken: finalDiscordToken
  };
}

console.log('✅ Telegram: 已启用');
console.log('✅ 允许用户：' + config.channels.telegram.allowFrom.join(', '));

// ============================================================================
// ⚡ 8. Commands 配置
// ============================================================================
config.commands = {
  native: finalCommandsNative,
  nativeSkills: finalCommandsNativeSkills,
  restart: finalCommandsRestart,
  ownerDisplay: finalCommandsOwnerDisplay
};

console.log('✅ Commands: native=' + config.commands.native);

// ============================================================================
// 💾 9. 保存配置
// ============================================================================
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
console.log('');
console.log('💾 配置已保存：' + CONFIG_PATH);

// 配置预览
const configPreview = JSON.parse(JSON.stringify(config));
if (configPreview.env?.OPENROUTER_API_KEY) {
  configPreview.env.OPENROUTER_API_KEY = configPreview.env.OPENROUTER_API_KEY.substring(0, 10) + '...';
}
if (configPreview.env?.TELEGRAM_BOT_TOKEN) {
  configPreview.env.TELEGRAM_BOT_TOKEN = configPreview.env.TELEGRAM_BOT_TOKEN.substring(0, 15) + '...';
}
if (configPreview.gateway?.auth?.token) {
  configPreview.gateway.auth.token = configPreview.gateway.auth.token.substring(0, 15) + '...';
}
console.log('');
console.log('📋 配置预览:');
console.log(JSON.stringify(configPreview, null, 2));

// ============================================================================
// 🔓 10. 自动配对配置
// ============================================================================
fs.mkdirSync(DEVICES_DIR, { recursive: true });
fs.writeFileSync(PENDING_CONFIG_PATH, JSON.stringify({
  silent: true,
  autoApprove: ["browser", "cli", "node", "mobile"],
  logLevel: "warn",
  maxPendingRequests: 100,
  requestTimeout: 3600000
}, null, 2));
fs.chmodSync(PENDING_CONFIG_PATH, '600');
console.log('✅ 自动配对配置完成');

// ============================================================================
// 🏥 11. Doctor 修复
// ============================================================================
console.log('');
console.log('🏥 运行 OpenClaw Doctor...');
try {
  execSync('bunx openclaw@latest doctor --fix', {
    encoding: 'utf8',
    stdio: 'inherit',
    env: Object.assign({}, process.env, { FORCE_COLOR: '1' })
  });
  console.log('✅ Doctor 修复完成！');
} catch (err) {
  console.warn('⚠️ Doctor 执行完成（可能有警告）');
}

// ============================================================================
// 🌐 12. Cloudflare Tunnel
// ============================================================================
let tunnelChild = null;

if (finalUseCloudflare) {
  console.log('');
  console.log('☁️  启动 Cloudflare Tunnel...');
  
  const cloudflaredPath = path.join(HOME, 'cloudflared');
  if (!fs.existsSync(cloudflaredPath)) {
    console.log('⬇️  下载 cloudflared...');
    try {
      execSync('curl -Lo ' + cloudflaredPath + ' https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64', { stdio: 'inherit' });
      execSync('chmod +x ' + cloudflaredPath, { stdio: 'inherit' });
    } catch (e) {
      console.error('❌ cloudflared 下载失败：' + e.message);
    }
  }
  
  tunnelChild = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:' + finalPort], {
    stdio: 'inherit',
    env: process.env,
    shell: false
  });
  
  console.log('⏳ 等待 5 秒...');
}

// ============================================================================
// 🚀 13. 启动 Gateway
// ============================================================================
setTimeout(function() {
  console.log('');
  console.log('🚀 启动 OpenClaw Gateway...');
  console.log('========================================================================');
  
  const gatewayChild = spawn('bunx', ['openclaw@latest', 'gateway', 'run'], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { NODE_ENV: 'production' }),
    shell: false
  });
  
  gatewayChild.on('error', function(err) {
    console.error('❌ Gateway 启动失败：' + err.message);
    if (tunnelChild) tunnelChild.kill('SIGTERM');
    process.exit(1);
  });
  
  gatewayChild.on('exit', function(code) {
    if (tunnelChild) tunnelChild.kill('SIGTERM');
    process.exit(code || 0);
  });
  
  process.on('SIGINT', function() {
    gatewayChild.kill('SIGINT');
    if (tunnelChild) tunnelChild.kill('SIGTERM');
  });
  
  process.on('SIGTERM', function() {
    gatewayChild.kill('SIGTERM');
    if (tunnelChild) tunnelChild.kill('SIGTERM');
  });
}, finalUseCloudflare ? 5000 : 0);
