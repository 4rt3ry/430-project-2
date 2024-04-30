import { Request, Response } from 'express';
import Account from '../models/Account';
import Message from '../models/Message';

/**
 * Takes in {chatId: string}, queries the account model to find their
 * actual id, then attempts to create/get a room with the original sender.
 * @param req
 * @param res
 * @returns
 */
const createAndGetRoom = async (req: Request, res: Response) => {
    const { chatId } = req.body;
    const otherUser = await Account.findOne({ chatId }).exec();
    const currentUser = await Account.findOne({ _id: req.session.account?._id }).exec();

    if (!otherUser) return res.status(400).json({ error: `User '${chatId}' does not exist` });
    if (!currentUser) return res.status(400).json({ error: 'HUH, APPRENTLY YOUR ACCOUNT DOESN\'T EXIST' });
    if (currentUser.rooms.length >= 5 && !currentUser.premium) return res.status(402).json({ error: 'User must have premium to access more than 5 rooms' });
    const otherStaticChatId = otherUser.staticChatId;
    const { staticChatId } = currentUser;
    let roomId: string;

    // room with yourself
    if (otherStaticChatId === staticChatId) roomId = staticChatId;
    else roomId = [staticChatId, otherStaticChatId].sort().join('-');

    // Return only necessary fields from the message model
    const messages = (await Message.find({ roomId }).exec()).map((m) => ({
        author: m.author,
        message: m.message,
        createdDate: m.createdDate,
    }));

    const room = {
        id: roomId,
        name: otherUser.chatId,
    };

    const result = {
        room,
        messages,
    };

    try {
        const roomExists = currentUser.rooms.some((r) => r.id === room.id);

        if (!roomExists) {
            await Account.updateOne(
                { _id: req.session.account?._id },
                { $push: { rooms: room } },
            ).exec();
        }
    } catch {
        return res.status(500).json({ error: 'Problem updating user\'s list of rooms' });
    }

    // I can't believe professor is teaching everyone's favorite class.

    return res.status(200).json(result);
};

const changeRoomName = async (req: Request, res: Response) => {

    const roomId = (req.body.room?.id ?? "").trim();
    const name = (req.body.room?.name ?? "").trim();

    if (!roomId || !name) {
        return res.status(400).json({ error: 'Must provide both room name and id' });
    }

    try {
        const query = { _id: req.session.account?._id }
        const account = await Account.findOne(query).exec();
        const currentRoomIndex = account?.rooms?.findIndex(r => r.id === roomId) ?? -1;

        if (!account) res.status(500).json({ error: 'Problem retrieving the current account' });

        if (currentRoomIndex > -1) {
            const roomIdentifier = `rooms.${currentRoomIndex}.name`;
            const roomUpdate: { [key: string]: string } = {};
            roomUpdate[roomIdentifier] = name;

            // {
            //  'rooms.index.name': 'roomName'
            //}
            const result = await Account.updateOne(
                query,
                {
                    $set: roomUpdate
                }
            );
            if (!result)
                return res.status(500).json({ error: 'Problem changing room name' });
            return res.status(200).json({message: 'Updated room successfully'});
        }
        return res.status(400).json({ error: 'The specified room does not exist' });
    }
    catch {
        return res.status(500).json({ error: 'Problem changing room name' });
    }
}

/**
 * Retrieve a list of the user's rooms
 * @param req
 * @param res
 * @returns
 */
const getRooms = async (req: Request, res: Response) => {
    try {
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        if (docs) {
            return res.status(200).json({ rooms: docs.rooms });
        }
        return res.status(500).json({ error: 'Could not retrieve a list of rooms' });
    } catch {
        return res.status(500).json({ error: 'Could not retrieve a list of rooms' });
    }
};

export {
    createAndGetRoom,
    getRooms,
    changeRoomName,
};
