const { Client } = require('discord-rpc');
const log = require('electron-log');

let client;
let activity;
let currentLanguage = 'ru';

const initialAppStartup = Math.floor(Date.now() / 1000);

const createDefaultValue = language => ({
  details: language === 'en' ? 'On Home Screen' : 'На главном экране',
  startTimestamp: initialAppStartup,
  largeImageKey: 'default_big',
  largeImageText:
    language === 'en'
      ? 'OxLAUNCHER - The best Minecraft launcher for installing modpacks and more'
      : 'OxLAUNCHER - Лучший Minecraft лаунчер для установки сборок с модификациями и не только',
  instance: false
});

exports.initRPC = () => {
  client = new Client({ transport: 'ipc' });

  activity = createDefaultValue(currentLanguage);

  client.on('ready', () => {
    log.log('Discord RPC Connected');
    client.setActivity(activity);
  });

  client.login({ clientId: '1046970143152033893' }).catch(error => {
    if (error.message.includes('ENOENT')) {
      log.error('Unable to initialize Discord RPC, no client detected.');
    } else {
      log.error('Unable to initialize Discord RPC:', error);
    }
  });
};

exports.update = details => {
  if (!client) return;
  activity = {
    ...activity,
    startTimestamp: Math.floor(Date.now() / 1000),
    details: `${details}`
  };
  client.setActivity(activity);
};

exports.reset = () => {
  if (!client) return;
  activity = createDefaultValue(currentLanguage);
  activity.startTimestamp = initialAppStartup;
  client.setActivity(activity);
};

exports.setLanguage = language => {
  currentLanguage = language || 'ru';

  if (!client) return;
  activity = {
    ...createDefaultValue(currentLanguage),
    ...(activity || {})
  };
  client.setActivity(activity);
};

exports.shutdownRPC = () => {
  if (!client) return;
  client.clearActivity();
  client.destroy();
  client = null;
  activity = null;
};
