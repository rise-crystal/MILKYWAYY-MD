import { readdirSync } from 'fs';
import { join } from 'path';
import { db } from './database.js';

class CommandManager {
  constructor() {
    this.commands = new Map();
    this.patterns = new Map();
    this.showSymbol = db.config.analyzeTag;
    this.isEnabled = db.config.isEnable;
  }

  toggleSymbol(value) {
    this.showSymbol = value;
  }

  toggleAllCommands(value) {
    this.isEnabled = value;
  }

  async refreshCacheAndLoader(yourCommandsPath) {
    this.commands.clear();
    this.patterns.clear();
    await this.initCommandsPath(yourCommandsPath);
  }

  create({ name, category, run, description, pattern, function: isFunction, matchText, usage, isOwner = false, isPremium = false, isGroup = false, hidden = false, disabled = !this.isEnabled }) {
    this.commands.set(name, { name, category, run, description, isFunction, matchText, usage, isOwner, isPremium, isGroup, hidden, disabled });
    if (pattern) {
      this.patterns.set(name, pattern);
    }
  }

  async call(name, options) {
    if (!this.isEnabled) return false;
    const command = this.commands.get(name);
    if (command && !command.disabled && command.isFunction) {
      try {
        return await command.run(options);
      } catch (error) {
        console.error(`Error executing command '${name}':`, error);
        return options.m.reply(`Terjadi kesalahan dalam menjalankan perintah. Mohon coba lagi nanti.`);
      }
    } else if (command && !command.disabled) {
      return this.run(name, options);
    }
  }
  
  async reloadCommand(commandName, commandsPath) {
    const path = join(commandsPath, `${commandName}.js`);
    delete require.cache[require.resolve(path)];
    await import(path);
  }

  async reloadPlugins(yourCommandsPath) {
    const commandsFolder = readdirSync(yourCommandsPath, { withFileTypes: true });

    for (const file of commandsFolder) {
      if (file.isFile() && file.name.endsWith('.js')) {
        const commandName = file.name.replace('.js', '');
        await this.reloadCommand(commandName, yourCommandsPath);
      }
    }
  }

  async initCommandsPath(commandsPath) {
    const path = commandsPath;
    const commandsFolder = readdirSync(path, { withFileTypes: true });

    for (const file of commandsFolder) {
      if (file.isDirectory()) {
        const subcommandsFolder = readdirSync(join(path, file.name));

        for (const subFile of subcommandsFolder) {
          if (subFile.endsWith('.js')) {
            const subcommandPath = join(path, file.name, subFile);
            await import(subcommandPath);
          }
        }
      } else if (file.isFile() && file.name.endsWith('.js')) {
        const commandPath = join(path, file.name);
        await import(commandPath);
      }
    }
  }

  async run(name, options) {
    const command = this.commands.get(name);

    if (command && this.isEnabled) {
      try {
        const m = options.m;
        const isOwner = m.isOwner || false;
        const isPremium = m.isPremium || false;
        const isGroup = m.isGroup || false;

        if (command.run) {
          if (command.isFunction) {
            return command.run({ ...options, m: { ...m, isOwner, isPremium, isGroup } });
          } else {
            command.run({ ...options, m: { ...m, isOwner, isPremium, isGroup } });
          }
        }
        return true;
      } catch (error) {
        console.error(`Error executing command '${name}':`, error);
        return false;
      }
    } else {
      return false;
    }
  }

  analyzeRun(run) {
    if (!this.showSymbol) return '';
    
    const regex = /m\.isOwner|m\.isPremium|m\.isGroup|m\.isLimit/g;
    const matches = [...run.toString().matchAll(regex)];

    if (matches.length > 0) {
      if (matches.some(match => match[0] === 'm.isOwner')) {
        return '🅞';
      } else if (matches.some(match => match[0] === 'm.isPremium')) {
        return '🅟';
      } else if (matches.some(match => match[0] === 'm.isGroup')) {
        return '🅖';
      } else if (matches.some(match => match[0] === 'm.isLimit')) {
        return '🅛';
      }
    }

    return '';
  }

  indexMenu(m, caption, user) {
    const categories = new Map();
    let counter = 1;

    for (const item of this.commands.values()) {
      if (!categories.has(item.category)) {
        categories.set(item.category, []);
      }
      categories.get(item.category).push(item);
    }

    const sortedCategories = [...categories.keys()].sort((a, b) => {
      const hasSymbolA = categories.get(a).some(command => this.analyzeRun(command.run) !== '');
      const hasSymbolB = categories.get(b).some(command => this.analyzeRun(command.run) !== '');

      if (hasSymbolA && !hasSymbolB) {
        return -1;
      } else if (!hasSymbolA && hasSymbolB) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
    
    let text = '';
    for (const [category, commands] of categories) {
      text += `╭─❒ 「 *${category.toUpperCase()} MENU* 」\n`;
      for (const command of commands) {
        let symbol = '';
        if (command.isOwner) {
          symbol = '❒ ';
        } else if (command.isPremium) {
          symbol = '❒ ';
        } else if (command.isGroup) {
          symbol = '❒ ';
        } else {
          symbol = '❒ ';
        }
        text += `│${symbol}. ${m.prefix}${command.name}\n`;
        counter++;
      }
      text += `│\n╰❒\n\n`;
    }

    return text;
  }

}

export const Command = new CommandManager();
