// database.js

import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const databaseDir = join(__dirname, '../database');
const filePaths = {
  config: join(databaseDir, 'config.json'),
  user: join(databaseDir, 'user.json'),
  group: join(databaseDir, 'group.json'),
};

function ensureFile(file) {
  try {
    fs.accessSync(file);
  } catch (err) {
    if (String(err).includes('no such file or directory')) {
      fs.writeFileSync(file, JSON.stringify({}, null, 2));
    }
  }
}

function getRandomColor() {
  const colors = ['41', '42', '43', '44', '45', '46', '47']; // Background color ANSI codes
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function mergeDatabase(dbName, file) {
  try {
    const fileData = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(fileData);

    db[dbName] = { ...db[dbName], ...data };

    // Optionally, update the file if needed
    fs.writeFileSync(file, JSON.stringify(db[dbName], null, 2));

    // Generate random background color and brighter text color
    const randomColor = getRandomColor();

    // Stylish console log for INFO
    console.log('%cℹ️ INFO:', 'font-family: monospace; font-weight: bold;', `Merged ${dbName} Database`);

    // AI completion message
    return `${dbName} database merged successfully!`;
  } catch (error) {
    // Generate random background color and brighter text color
    const randomColor = getRandomColor();

    // Stylish console log for ERROR
    console.error('%c❌ ERROR:', 'font-family: monospace; font-weight: bold;', `Error merging ${dbName} database - ${error.message}`);

    // AI error handling
    return `Error merging ${dbName} database. Please check the logs for details.`;
  }
}

function saveDatabase(dbName) {
  try {
    fs.writeFileSync(filePaths[dbName], JSON.stringify(db[dbName], null, 2));
    const randomColor = getRandomColor();
    console.log('%cℹ️ INFO:', 'font-family: monospace; font-weight: bold;', `Saved ${dbName} Database`);
  } catch (error) {
    const randomColor = getRandomColor();
    console.error('%c❌ ERROR:', 'font-family: monospace; font-weight: bold;', `Error saving ${dbName} database - ${error.message}`);
  }
}

// Ensure the existence of config, user, and group files
Object.values(filePaths).forEach((file) => ensureFile(file));

// Initialize the db object
let db = {
  config: JSON.parse(fs.readFileSync(filePaths.config, 'utf8')),
  user: JSON.parse(fs.readFileSync(filePaths.user, 'utf8')),
  group: JSON.parse(fs.readFileSync(filePaths.group, 'utf8')),
};

// Save and update the db every one hour
setInterval(() => {
  Object.keys(filePaths).forEach((dbName) => saveDatabase(dbName));
  writeDB();
}, 60 * 60 * 1000);

// Merge the databases
mergeDatabase('config', filePaths.config);
mergeDatabase('user', filePaths.user);
mergeDatabase('group', filePaths.group);

// Function to write db
function writeDB() {
  try {
    Object.keys(filePaths).forEach((dbName) => {
      fs.writeFileSync(filePaths[dbName], JSON.stringify(db[dbName], null, 2));
    });
    const randomColor = getRandomColor();
    console.log('%c✔️ SUCCESS:', 'font-family: monospace; font-weight: bold;', 'Updated and wrote db successfully');
  } catch (error) {
    const randomColor = getRandomColor();
    console.error('%c❌ ERROR:', 'font-family: monospace; font-weight: bold;', `Failed to update and write db - ${error.message}`);
  }
}

export { db, writeDB };
