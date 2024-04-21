import fs from 'fs';
import { IRedisAccount } from './models/Account';

const readFile = (filepath: string) => fs.readFileSync(`${__dirname}/${filepath}`, 'utf-8');
const readJSON = (filepath: string) => JSON.parse(fs.readFileSync(`${__dirname}/${filepath}`, 'utf-8'));
const randomString = (input: string[]) => (input[Math.floor(Math.random() * input.length)]);

declare module 'express-session' {
    export interface SessionData {
       account?: IRedisAccount
    }
 }

export {
    readFile,
    readJSON,
    randomString,
};
