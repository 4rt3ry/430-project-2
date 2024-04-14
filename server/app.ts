// import { APIError } from 'openai/error';

import path from 'path';
import OpenAI from 'openai';
import { APIError, OpenAIError } from 'openai/error';
import express from 'express';
import compression from 'compression';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import mongoose, { MongooseError } from 'mongoose';
import expressHandlebars from 'express-handlebars';
import helmet from 'helmet';
import session, { Session } from 'express-session';
import redis from 'redis';
import router from './router';
import { readJSON, randomString } from './helpers';

require('dotenv').config();
const RedisStore = require('connect-redis').default;

// setup server
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// setup databases
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/openbm';
mongoose.connect(dbURI).catch((err: MongooseError) => {
    if (err) {
        console.log('Could not connect to database');
        throw err;
    }
});

const redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// setup openai
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultResponses = readJSON('../data/default-responses.json');
const disableAI = true;

// connect to redis, start app
redisClient.connect().then(() => {
    const app = express() as express.Express;

    app.use(helmet());
    app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
    app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // use sessions to secure user logins
    app.use(session({
        name: 'sessionid',
        store: new RedisStore({
            client: redisClient,
        }),
        secret: 'we need to cook jesse',
        resave: false,
        saveUninitialized: false,
    }));

    app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
    app.set('view engine', 'handlebars');
    app.set('view', `${__dirname}/../views`);

    router(app);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});

const main = async () => {
    try {
        if (disableAI) throw new APIError(400, undefined, 'AI is disabled', undefined);
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
            model: 'gpt-3.5-turbo',
        });
        console.log(completion.choices[0]);
    } catch (err) {
        const e = err as APIError;
        console.log(e.toString());
        console.log(randomString(defaultResponses.errors[e.code || 'default'].messages));
    }
};

// main();
