import OpenAI from 'openai';
import { APIError } from 'openai/error';
import dotenv from 'dotenv';
import { readJSON, randomString } from './helpers';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultResponses = readJSON('../data/default-responses.json');
const disableAI = false;

const getAIResponse = async (msg: string) => {
    let newMessage = randomString(defaultResponses.responses.messages);

    try {
        // disable for testing
        if (disableAI) throw new APIError(400, undefined, 'AI is disabled', undefined);

        const descriptors = [
            'chaotic',
            'truthful',
            'silly',
            'serious',
            'sinister',
        ];
        const prompt = `Someone sent the message "${msg}". Replace their message with a ${randomString(descriptors)} phrase.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'gpt-3.5-turbo',
        });
        newMessage = completion.choices[0].message.content ?? newMessage;
    } catch (err) {
        const e = err as APIError;
        newMessage = randomString(defaultResponses.errors[e.code || 'default'].messages);
    }
    return newMessage;
};

export default getAIResponse;

// main();
