const { Client } = require('discord-rpc');
const log = require('electron-log');

let client;
let activity;

const initialAppStartup = Math.floor(Date.now() / 1000);

const defaultValue = {
  details: 'Спит',
  startTimestamp: initialAppStartup,
  largeImageKey: 'default_big',
  largeImageText: 'OxLAUNCHER - Лучший Minecraft лаунчер',
  instance: false
};

exports.initRPC = () => {
  client = new Client({ transport: 'ipc' });

  activity = defaultValue;

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
    details: `Играет в ${details}`
  };
  client.setActivity(activity);
};

exports.reset = () => {
  if (!client) return;
  activity = defaultValue;
  activity.startTimestamp = initialAppStartup;
  client.setActivity(activity);
};

exports.shutdownRPC = () => {
  if (!client) return;
  client.clearActivity();
  client.destroy();
  client = null;
  activity = null;
};
