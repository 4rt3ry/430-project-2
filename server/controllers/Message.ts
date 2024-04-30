import { Request, Response } from 'express';
import { IMessage, MessageModel } from '../models/Message';

const createMessage = async (req: Request, res: Response) => {

    const message = {
        author: `${req.body.author}`,
        authorId: `${req.body.authorId}`,
        message: `${req.body.message}`,
        roomId: `${req.body.roomId}`,
    };

    // new message requires all values
    if (Object.values(message).some((a) => a === undefined)) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const dbMessage = new MessageModel(message);
        await dbMessage.save();

        const msgResult: IMessage = {
            author: dbMessage.author,
            authorId: dbMessage.authorId,
            message: dbMessage.message,
            roomId: dbMessage.roomId,
            createdDate: dbMessage.createdDate
        }

        return res.status(201).json(msgResult);
    } catch {
        return res.status(500).json({ error: 'Failed to create message on the server' });
    }
};

const getMessages = async (req: Request, res: Response) => {
    const query = { roomId: `${req.query.roomId}`.trim() };

    try {
        const docs = await MessageModel.find(query, { _id: 0 });


        return res.status(200).json(docs);
    } catch {
        return res.status(500).json({ error: 'Could not retrieve messages' });
    }
};

export {
    createMessage,
    getMessages,
};
