import { empty, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { readFile } from 'fs/promises';

class RXJS {
  constructor({ m, db, conn, func, store }) {
    this.m = m;
    this.db = db;
    this.conn = conn;
    this.func = func;
    this.store = store;
    this.commands = [];
    this.floors = [
      { name: 'Lantai 1', enemies: [{ name: 'Goblin', health: 50, strength: 5, defense: 2, rate: 0.7 }], reward: 'Potion' },
      { name: 'Lantai 2', enemies: [{ name: 'Goblin', health: 50, strength: 5, defense: 2, rate: 0.6 }, { name: 'Ork', health: 70, strength: 8, defense: 3, rate: 0.4 }], reward: 'Potion' },
      { name: 'Lantai 3', enemies: [{ name: 'Ork', health: 70, strength: 8, defense: 3, rate: 0.6 }, { name: 'Troll', health: 100, strength: 12, defense: 5, rate: 0.4 }], reward: 'Magic Sword' }
    ];
    this.items = {
      'Potion': { name: 'Potion', type: 'consumable', effect: { health: 50 }, price: 10 },
      'Magic Sword': { name: 'Magic Sword', type: 'weapon', effect: { strength: 20 }, price: 100 }
    };
    this.shop = {
      'Potion': { name: 'Potion', type: 'consumable', effect: { health: 50 }, price: 10 },
      'Magic Sword': { name: 'Magic Sword', type: 'weapon', effect: { strength: 20 }, price: 100 }
    };
    this.currency = {
      'gold': 100,
      'diamond': 10
    };
    this.gachaItems = {
      'Common Potion': { name: 'Common Potion', type: 'consumable', effect: { health: 50 }, rate: 0.6 },
      'Rare Potion': { name: 'Rare Potion', type: 'consumable', effect: { health: 100 }, rate: 0.3 },
      'Epic Potion': { name: 'Epic Potion', type: 'consumable', effect: { health: 150 }, rate: 0.1 },
    };
    this.coinCost = 10;
  }

  handler() {
    return of(this.m.command).pipe(
      switchMap(command => {
        try {
          switch (command) {
            case 'test-rxjs': {
              category: 'Other';
              return this.handleRxjsCommand();
            }
            break;
            
            case 'calc': {
              category: 'Other';
              if (this.m.args[0] === 'add') {
                return this.handleCalculatorCommand('add');
              } else if (this.m.args[0] === 'subtract') {
                return this.handleCalculatorCommand('subtract');
              } else if (this.m.args[0] === 'multiply') {
                return this.handleCalculatorCommand('multiply');
              } else if (this.m.args[0] === 'divide') {
                return this.handleCalculatorCommand('divide');
              }
            }
            break;
            
            case 'menu-rxjs': {
              category: 'Other';
              return this.handleMenuCommand();
            }
            break;
            
            case 'add-cmd': {
              category: 'Owner';
              if (this.m.args.length > 1) {
                const newCommand = this.m.args[1];
                this.addCommand(newCommand);
                return of(`Command '${newCommand}' added successfully.`);
              } else {
                return of("Please provide a command to add.");
              }
            }
            break;
            
            case 'mulai-rpg-dg': {
              category: 'RPG Dungeon';
              return this.mulaiRPG();
            }
            break;
            
            case 'serang-dg': {
              category: 'RPG Dungeon';
              return this.serang();
            }
            break;
            
            case 'bertahan-dg': {
              category: 'RPG Dungeon';
              return this.bertahan();
            }
            break;
            
            case 'status-dg': {
              category: 'RPG Dungeon';
              return this.status();
            }
            break;
            
            case 'profile-dg': {
              category: 'RPG Dungeon';
              return this.profile();
            }
            break;
            
            case 'inventory-dg': {
              category: 'RPG Dungeon';
              return this.inventory();
            }
            break;
            
            case 'use-dg': {
              category: 'RPG Dungeon';
              return this.use();
            }
            break;
            
            case 'equip-dg': {
              category: 'RPG Dungeon';
              return this.equip();
            }
            break;
            
            case 'unequip-dg': {
              category: 'RPG Dungeon';
              return this.unequip();
            }
            break;
            
            case 'shop-dg': {
              category: 'RPG Dungeon';
              return this.shopFunc();
            }
            break;
            
            case 'buy-dg': {
              category: 'RPG Dungeon';
              return this.buy();
            }
            break;
            
            case 'sell-dg': {
              category: 'RPG Dungeon';
              return this.sell();
            }
            break;
            
            case 'keluar-dg': {
              category: 'RPG Dungeon';
              return this.keluar();
            }
            break;
            
            case 'naik-lantai-dg': {
              category: 'RPG Dungeon';
              return this.naikLantai();
            }
            break;
            
            case 'setname-dg': {
              category: 'RPG Dungeon';
              return this.setName();
            }
            break;
            
            case 'minigame-dg': {
              category: 'RPG Dungeon';
              return this.miniGame();
            }
            break;
            
            case 'gacha-dg': {
              category: 'RPG Dungeon';
              return this.gacha();
            }
            break;
            
            default:
              return empty();
          }
        } catch (error) {
          console.error(error);
          return empty();
        }
      })
    );
  }
  
  async miniGame() {
    const player = this.m.sender;
    const gameResult = Math.random() < 0.5 ? 'win' : 'lose'; // Contoh mini game sederhana, peluang 50:50 untuk menang atau kalah
    if (gameResult === 'win') {
      this.db.user[player].gachaCoins += 1; // Menambah 1 koin Gacha jika menang
      this.db.save();
      return 'Selamat! Kamu menang dalam mini game dan mendapatkan 1 koin Gacha!';
    } else {
      return 'Sayang sekali, kamu kalah dalam mini game.';
    }
  }

  async gacha() {
    const player = this.m.sender;
    if (this.db.user[player].gachaCoins >= this.coinCost) { // Memeriksa apakah pemain memiliki cukup koin Gacha
      const items = Object.keys(this.gachaItems);
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const item = this.gachaItems[randomItem];
      this.db.user[player].gachaCoins -= this.coinCost; // Mengurangi jumlah koin Gacha yang dimiliki
      this.db.user[player].inventory.push(item);
      this.updateOwnedItems(player, item.name); // Memperbarui database item yang sudah dimiliki
      this.db.save();
      return `Selamat! Kamu mendapatkan ${item.name} dari Gacha!`;
    } else {
      return 'Maaf, kamu tidak memiliki cukup koin Gacha untuk melakukan Gacha.';
    }
  }

  updateOwnedItems(player, itemName) {
    if (this.db.user[player].ownedItems[itemName]) {
      this.db.user[player].ownedItems[itemName]++;
    } else {
      this.db.user[player].ownedItems[itemName] = 1;
    }
  }
  
  handleRxjsCommand() {
    try {
      const responses = [
        'hello i am rxjs',
        'nice to meet you, i am rxjs',
        'how can i help you? i am rxjs'
      ];
      const randomIndex = Math.floor(Math.random() * responses.length);
      return of(responses[randomIndex]);
    } catch (error) {
      console.error(error);
      return empty();
    }
  }

  handleCalculatorCommand(operation) {
    try {
      const num1 = parseFloat(this.m.args[1]);
      const num2 = parseFloat(this.m.args[2]);
      let result;
      switch (operation) {
        case 'add':
          result = num1 + num2;
          break;
        case 'subtract':
          result = num1 - num2;
          break;
        case 'multiply':
          result = num1 * num2;
          break;
        case 'divide':
          result = num1 / num2;
          break;
        default:
          return empty();
      }
      return `Result of ${operation}: ${result}`
    } catch (error) {
      console.error(error);
      return empty();
    }
  }
  
  async handleMenuCommand() {
    try {
      const caseFile = "./event/modem/rxjs.js";
      const content = await readFile(caseFile, 'utf8');
      const cases = content.match(/case\s+['"]([^'"]+)['"]:\s*{\s*category:\s*['"]([^'"]+)['"]/g).map((match) => {
        const [_, caseName, category] = match.match(/case\s+['"]([^'"]+)['"]:\s*{\s*category:\s*['"]([^'"]+)['"]/);
        return { name: caseName, category };
      });

      const categories = [...new Set(cases.map(command => command.category))];

      const categorizedCases = {};
      categories.forEach(category => {
        categorizedCases[category] = cases.filter(command => command.category === category).map(command => command.name);
      });

      const menuText = Object.entries(categorizedCases)
        .map(([category, cases]) => {
          const formattedCases = cases.map((c, i) => `${i + 1}. ${this.m.prefix}${c}`).join('\n');
          return `RXJS MENU\n\n📋 ${category} (${cases.length})\n${formattedCases}`
        })
        .join('\n\n');

      const player = this.m.sender;
      const playerData = this.db.user[player];
      const playerInfo = playerData ? 
        `👤 Player: ${playerData.name || 'Nama tidak tersedia'}\n` +
        `⚔️ Level: ${playerData.level !== undefined ? playerData.level : 'Level tidak tersedia'}\n` +
        `❤️ Health: ${playerData.health !== undefined ? playerData.health : 'Health tidak tersedia'}\n` +
        `💪 Strength: ${playerData.strength !== undefined ? playerData.strength : 'Strength tidak tersedia'}\n` +
        `🛡️ Defense: ${playerData.defense !== undefined ? playerData.defense : 'Defense tidak tersedia'}\n` +
        `🎮 Playing: ${playerData.isPlaying !== undefined ? (playerData.isPlaying ? 'Yes' : 'No') : 'Status tidak tersedia'}` : '🚫 Belum terdaftar dalam game RPG';

      const totalPlayers = Object.keys(this.db.user).length;

      return `${playerInfo}\n\n👥 Total Player Baru: ${totalPlayers}\n\n${menuText}`;
    } catch (error) {
      console.error(error);
      return empty();
    }
  }

  addCommand(command) {
    this.commands.push(command);
  }

  online() {
    try {
      if (this.m.command) {
        this.handler().subscribe(result => {
          try {
            this.m.reply(result);
          } catch (error) {
            console.error(error);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  async mulaiRPG() {
    const player = this.m.sender;
    if (!this.db.user[player]) {
      this.db.user[player] = {
        name: this.m.senderName || 'Player',
        level: this.db.user[player]?.level || 1,
        health: this.db.user[player]?.health || 100,
        strength: this.db.user[player]?.strength || 10,
        defense: this.db.user[player]?.defense || 5,
        isBertahan: this.db.user[player]?.isBertahan || false,
        isPlaying: this.db.user[player]?.isPlaying || true,
        floor: this.db.user[player]?.floor || 1,
        inventory: this.db.user[player]?.inventory || [],
        equippedItems: this.db.user[player]?.equippedItems || {}
      };
    }

    if (this.db.user[player].name === undefined) this.db.user[player].name = m.pushname;
    if (this.db.user[player].level === undefined) this.db.user[player].level = 1;
    if (this.db.user[player].health === undefined) this.db.user[player].health = 100;
    if (this.db.user[player].strength === undefined) this.db.user[player].strength = 10;
    if (this.db.user[player].defense === undefined) this.db.user[player].defense = 5;
    if (this.db.user[player].isBertahan === undefined) this.db.user[player].isBertahan = false;
    if (this.db.user[player].isPlaying === undefined) this.db.user[player].isPlaying = true;
    if (this.db.user[player].floor === undefined) this.db.user[player].floor = 1;
    if (this.db.user[player].inventory === undefined) this.db.user[player].inventory = [];
    if (this.db.user[player].equippedItems === undefined) this.db.user[player].equippedItems = {};
      
    this.db.save()
    
    return 'Game RPG dimulai. Kamu sekarang berada dalam game.'

  }

  async serang() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      const musuh = this.getRandomMusuh();
      const { playerWinProbability } = this.predictBattleResult(this.db.user[player], musuh);
      let message;
      if (Math.random() < playerWinProbability) {
        const damage = this.hitungDamage(player, musuh);
        musuh.health -= damage;
        message = `Kamu menyerang musuh ${musuh.name} dan menghasilkan ${damage} kerusakan. Kesehatan musuh: ${musuh.health}`;
        if (musuh.health <= 0) {
          this.db.user[player].isPlaying = false;
          this.handleReward(player, musuh.reward);
          message += ` Kamu berhasil mengalahkan musuh ${musuh.name}! Kamu mendapatkan ${musuh.reward}.`;
        }
      } else {
        message = `Seranganmu gagal dan musuh ${musuh.name} menghindar.`;
      }
      this.db.save()
      return message;
    } else {
      return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.';
    }
  }
  
  predictBattleResult(player, enemy) {
    const playerAttackPower = this.calculateAttackPower(player.strength);
    const enemyAttackPower = this.calculateAttackPower(enemy.strength);
    const playerDefense = player.defense;
    const enemyDefense = enemy.defense;

    const playerHealthPoints = player.health;
    const enemyHealthPoints = enemy.health;

    const playerTotal = playerAttackPower + playerDefense + playerHealthPoints;
    const enemyTotal = enemyAttackPower + enemyDefense + enemyHealthPoints;

    const playerWinProbability = playerTotal / (playerTotal + enemyTotal);
    const enemyWinProbability = 1 - playerWinProbability;

    return {
      playerWinProbability,
      enemyWinProbability
    };
  }

  async bertahan() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      this.db.user[player].isBertahan = true;
      return of('Kamu sedang bertahan.');
      this.db.save()
    } else {
      return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.'
    }
  }

  async status() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      const { name, level, health, strength, defense, isBertahan, floor } = this.db.user[player];
      return `S T A T U S\n
  Nama: ${name ? name: 'belum di setel'}, 
  Level: ${level}, 
  Kesehatan: ${health}, 
  Kekuatan: ${strength}, 
  Pertahanan: ${defense}, 
  Bertahan: ${isBertahan ? 'Ya' : 'Tidak'}, 
  Lantai: ${floor}`
    } else {
      return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.'
    }
  }

  async profile() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      const { name, level, health, strength, defense } = this.db.user[player];
      return `P R O F I L E\n
  Nama: ${name ? name : 'belum di setel'}, 
  Level: ${level}, 
  Kesehatan: ${health}, 
  Kekuatan: ${strength}, 
  Pertahanan: ${defense}`
    } else {
      return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.'
    }
  }
  
  async setName() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      if (this.m.query) {
        this.db.user[player].name = this.m.query
        this.db.save();
      } else {
        return 'Silahkan masukkan nama baru untuk karakter game rpg dungeon kamu';
      }
      return 'Berhasil menyetel nama menjadi: ' + this.m.query;
    }
  }
  
  async inventory() {
    const player = this.m.sender;
    if (this.db.user[player] && this.db.user[player].isPlaying) {
      const { inventory } = this.db.user[player];
      if (inventory.length === 0) {
        return 'Inventory kosong.'
      } else {
        const items = inventory.map(item => `${item.name} (${item.type})`);
        return `Inventory: ${items.join(', ')}`
      }
    } else {
      return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.'
    }
  }

  async use() {
    const player = this.m.sender;
    const itemName = this.func.pick(this.m.text);
    const item = this.db.user[player].inventory.find(item => item.name === itemName);
    if (item) {
      const { effect } = this.items[itemName];
      Object.keys(effect).forEach(stat => {
        this.db.user[player][stat] += effect[stat];
      });
      this.db.user[player].inventory = this.db.user[player].inventory.filter(i => i !== item);
      this.db.save()
      return `Kamu menggunakan ${itemName} dan mendapatkan efek: ${JSON.stringify(effect)}`
    } else {
      return `Item ${itemName} tidak ditemukan dalam inventory.`
    }
  }

  async equip() {
    const player = this.m.sender;
    const itemName = this.func.pick(this.m.text);
    const item = this.db.user[player].inventory.find(item => item.name === itemName);
    if (item) {
      const { type } = item;
      const equippedItem = this.db.user[player].equippedItems[type];
      if (equippedItem) {
        return `Kamu sudah memiliki item ${type} yang dipasang. Untuk mengganti, ketik "unequip ${equippedItem.name}" terlebih dahulu.`
      } else {
        this.db.user[player].equippedItems[type] = item;
        this.db.save()
        return `Kamu meng-equip ${itemName}.`
      }
    } else {
      return `Item ${itemName} tidak ditemukan dalam inventory.`
    }
  }

  async unequip() {
    const player = this.m.sender;
    const itemName = this.func.pick(this.m.text);
    const item = this.db.user[player].equippedItems[itemName];
    if (item) {
      delete this.db.user[player].equippedItems[itemName];
      this.db.save()
      return `Kamu melepas ${itemName}.`
    } else {
      return `Item ${itemName} tidak ditemukan dalam equipped items.`
    }
  }

  handleReward(player, reward) {
    if (reward) {
      const item = this.items[reward];
      if (item) {
        this.db.user[player].inventory.push(item);
      }
      this.db.save()
    }
  }

  getRandomMusuh() {
    const player = this.m.sender;
    const floorData = this.floors[this.db.user[player].floor - 1];
    const enemies = floorData.enemies.filter(enemy => Math.random() < enemy.rate);
    const randomIndex = Math.floor(Math.random() * enemies.length);
    return enemies[randomIndex]; // Mengembalikan objek musuh, bukan hanya health
  }

  hitungDamage(player, musuh) {
    const { strength, isBertahan } = this.db.user[player];
    const damage = Math.floor(Math.random() * strength) + 1;
    return isBertahan ? Math.floor(damage / 2) : damage;
  }
  
  async shopFunc() {
    const player = this.m.sender;
    let message = 'Shop:\n';
    Object.keys(this.shop).forEach(itemName => {
      const { name, price } = this.shop[itemName];
      message += `- ${name} (${price} gold)\n`;
    });
    return message
  }

  async buy() {
    const player = this.m.sender;
    const itemName = this.func.pick(this.m.text);
    const item = this.shop[itemName];
    if (item) {
      if (this.currency.gold >= item.price) {
        this.db.user[player].inventory.push(item);
        this.currency.gold -= item.price;
        this.db.save()
        return `Kamu berhasil membeli ${itemName} seharga ${item.price} gold.`
      } else {
        return 'Uang tidak mencukupi untuk membeli item ini.'
      }
    } else {
      return `Item ${itemName} tidak ditemukan dalam shop.`
    }
  }

  async sell() {
    const player = this.m.sender;
    const itemName = this.func.pick(this.m.text);
    const item = this.db.user[player].inventory.find(item => item.name === itemName);
    if (item) {
      this.currency.gold += item.price;
      this.db.user[player].inventory = this.db.user[player].inventory.filter(i => i !== item);
      this.db.save()
      return `Kamu berhasil menjual ${itemName} seharga ${item.price} gold.`
    } else {
      return `Item ${itemName} tidak ditemukan dalam inventory.`
    }
  }
  
  calculateAttackPower(strength) {
    return strength * 2;
  }

  calculateTotalPower(character) {
    const attackPower = this.calculateAttackPower(character.strength);
    const defensePower = character.defense;
    const healthPower = character.health;

    return attackPower + defensePower + healthPower;
  }

  async naikLantai() {
    const player = this.m.sender;
    const currentPlayer = this.db.user[player];

    if (!currentPlayer || !currentPlayer.isPlaying) {
        return 'Kamu belum bergabung dalam game. Ketik "mulai-rpg" untuk memulai.';
    }

    const currentFloor = currentPlayer.floor;
    const nextFloor = currentFloor + 1;

    if (nextFloor > this.floors.length) {
        return 'Kamu sudah berada di lantai terakhir.';
    }

    const nextFloorData = this.floors[nextFloor - 1];
    const enemy = this.getRandomMusuh(nextFloor);

    const playerTotalPower = this.calculateTotalPower(currentPlayer);
    const enemyTotalPower = this.calculateTotalPower(enemy);

    const playerWinProbability = playerTotalPower / (playerTotalPower + enemyTotalPower);

    const message = `Prediksi Kemenangan untuk Naik ke Lantai ${nextFloor}:\n\nPeluang Kamu Menang: ${playerWinProbability * 100}%`;

    return message;
  }

}

export { RXJS };
