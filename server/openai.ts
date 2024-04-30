
import OpenAI from 'openai';
import { APIError, OpenAIError } from 'openai/error';
import { readJSON, randomString } from './helpers';


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultResponses = readJSON('../data/default-responses.json');
const disableAI = true;

const getAIResponse = async (msg: string) => {

    let newMessage = randomString(defaultResponses.responses.messages);

    try {
        // disable for testing
        if (disableAI) throw new APIError(400, undefined, 'AI is disabled', undefined);

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
            model: 'gpt-3.5-turbo',
        });
        newMessage = completion.choices[0].message.content ?? newMessage;
    } catch (err) {
        const e = err as APIError;
        console.log(e.toString());
        console.log(randomString(defaultResponses.errors[e.code || 'default'].messages));
    }



};

// main();