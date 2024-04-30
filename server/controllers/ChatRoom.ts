import { Request, Response } from 'express';
import Account from '../models/Account';
import Message from '../models/Message'

/**
 * Takes in {chatId: string}, queries the account model to find their
 * actual id, then attempts to create/get a room with the original sender.
 * @param req
 * @param res
 * @returns
 */
const createAndGetRoom = async (req: Request, res: Response) => {
    const { chatId } = req.body;
    const otherUser = await Account.findOne({ chatId });
    const currentUser = await Account.findOne({ _id: req.session.account?._id });

    if (!otherUser) return res.status(400).json({ error: `User '${chatId}' does not exist` });
    if (!currentUser) return res.status(400).json({ error: `HUH, APPRENTLY YOUR ACCOUNT DOESN'T EXIST` });

    const otherStaticChatId = otherUser.staticChatId;
    const staticChatId = currentUser.staticChatId;
    let roomId: string;

    // room with yourself
    if (otherStaticChatId === staticChatId)
        roomId = staticChatId;
    else
        roomId = [staticChatId, otherStaticChatId].sort().join('-');

    // Return only necessary fields from the message model
    const messages = (await Message.find({ roomId })).map(m => ({
        author: m.author,
        message: m.message,
        createdDate: m.createdDate
    }));

    const result = {
        room: {
            id: roomId,
            name: otherUser.chatId
        },
        messages
    };

    // I can't believe professor is teaching everyone's favorite class.

    return res.status(200).json(result);
};

// tmp to get rid of eslint error
export default createAndGetRoom;

export {
    createAndGetRoom,
};
