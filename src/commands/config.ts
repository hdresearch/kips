import fs from 'fs';
import path from 'path';
import os from 'os';
import { Command, Option } from 'commander';

function getConfigPath() {
  switch (process.platform) {
    case 'darwin':
      return path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json',
      );
    case 'win32':
      return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
    default:
      throw new Error('Unsupported platform');
  }
}

export function updateConfig(debug = false) {
  const isNpx = Boolean(
    process.argv[1].includes('/_npx/') ||
      process.env.npm_command === 'exec' ||
      process.env._?.includes('/_npx/'),
  );
  if (!isNpx && !debug) {
    console.error({"error": 'Not running via npx'});
    return;
  }

  const scriptPath = process.argv[1];
  const configPath = getConfigPath();

  try {
    let config: { mcpServers?: { 'kips'?: { command: string, args?: string[] } } } = {};
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.log('Creating new config file');
    }

    config.mcpServers = config.mcpServers || {};

    if (process.platform === 'win32') {
      config.mcpServers['kips'] = {
        command: "C:\\Program Files\\nodejs\\node.exe",
        args: [scriptPath]
      }
    } else {
      config.mcpServers['kips'] = {
        command: `${debug ? 'node' : 'npx'}`,
        args: debug ? [scriptPath, 'serve'] : ['kips', 'serve']
      };
    }

    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Updated config at:', configPath);
    console.log('Added server with command:', scriptPath);
  } catch (err) {
    console.error('Error updating config:', err);
    process.exit(1);
  }
}

export function getConfigCommand() {
  return new Command('config')
  .addOption(new Option('--debug', 'Use local build'))
    .action((args) => {
      updateConfig(args?.debug);
    });
}