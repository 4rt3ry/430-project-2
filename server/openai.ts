
import OpenAI from 'openai';
import { APIError } from 'openai/error';
import { readJSON, randomString } from './helpers';
import dotenv from 'dotenv'
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
            'naughty',
            'truthful',
            'silly',
            'serious',
            'sinister',
        ];
        const prompt = `Replace the phrase ${msg} with a ${randomString(descriptors)} response. You can choose whether or not to change the original intent entirely. Respond as if you are a human giving concise answers.`;

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