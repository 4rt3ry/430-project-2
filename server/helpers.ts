import fs from 'fs';

const readFile = (filepath: string) => fs.readFileSync(`${__dirname}/${filepath}`, 'utf-8');
const readJSON = (filepath: string) => JSON.parse(fs.readFileSync(`${__dirname}/${filepath}`, 'utf-8'));
const randomString = (input: string[]) => (input[Math.floor(Math.random() * input.length)]);

export {
    readFile,
    readJSON,
    randomString,
};
