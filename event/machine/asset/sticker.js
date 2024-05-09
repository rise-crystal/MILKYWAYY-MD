import fs from 'fs';

if (!fs.existsSync('./database/sticker.json')) {
  fs.writeFileSync('./database/sticker.json', JSON.stringify([], null, 2));
}

export const addCmds = (id, command) => {
  const obj = { id: id, chats: command };
  let setiker = JSON.parse(fs.readFileSync('./database/sticker.json'));
  setiker.push(obj);
  fs.writeFileSync('./database/sticker.json', JSON.stringify(setiker, null, 2));
};

export const getCommandPosition = (id) => {
  let position = null;
  let setiker = JSON.parse(fs.readFileSync('./database/sticker.json'));
  Object.keys(setiker).forEach((i) => {
    if (setiker[i].id === id) {
      position = i;
    }
  });
  if (position !== null) {
    return position;
  }
};

export const getCmd = (id) => {
  let position = null;
  let setiker = JSON.parse(fs.readFileSync('./database/sticker.json'));
  Object.keys(setiker).forEach((i) => {
    if (setiker[i].id === id) {
      position = i;
    }
  });
  if (position !== null) {
    return setiker[position].chats;
  }
};

export const checkSCommand = (id) => {
  let status = false;
  let setiker = JSON.parse(fs.readFileSync('./database/sticker.json'));
  Object.keys(setiker).forEach((i) => {
    if (setiker[i].id === id) {
      status = true;
    }
  });
  return status;
};
