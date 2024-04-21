import { Request, Response } from 'express';
import { mongo } from 'mongoose';
import Account from '../models';
import { IAccount } from '../models/Account';

const loginPage = (req: Request, res: Response) => res.render('login');

const logout = (req: Request, res: Response) => {
    req.session.destroy(() => { });
    return res.redirect('/');
};

const login = (req: Request, res: Response) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    if (!username || !pass) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    return Account.authenticate(username, pass, (err?: Error, account?: IAccount) => {
        if (err || !account) {
            return res.status(401).json({ error: 'Wrong username or password!' });
        }

        req.session.account = Account.toAPI(account);
        return res.json({ redirect: '/app' });
    });
};

const signup = async (req: Request, res: Response) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if (!username || !pass || !pass2) {
        return res.status(400).json({ error: 'All fields are required!' });
    }
    if (pass !== pass2) {
        return res.status(400).json({ error: 'Passwords must match' });
    }

    try {
        const hash = await Account.generateHash(pass);
        const newAccount = new Account({ username, password: hash });
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({ redirect: '/app' });
    } catch (err) {
        console.log(err);
        // find out what the error type is

        if ((err as mongo.MongoError).code === 11000) {
            return res.status(400).json({ error: 'Username is already in use!' });
        }
        return res.status(500).json({ error: 'An error occured' });
    }
};

/**
 * Retrieve the user's chat id. Users can communicate
 * by connecting to each other's chat id.
 * @param req
 * @param res
 */
const getPersonalChatId = async (req: Request, res: Response) => {
    try {
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();
        return res.json({ chatId: docs?._chatId });
    } catch {
        return res.status(500).json({ error: 'Could not retrieve chat id' });
    }
};

/**
 * Check if a user's chat id exists
 * @param req
 * @param res
 */
const checkUserChatId = async (req: Request, res: Response) => {
    try {
        const query = { _chatId: new mongo.ObjectId(req.query.chatId?.toString()) };
        const docs = await Account.findOne(query).exec();

        // can find id, tell user it's all ok
        if (docs) return res.status(200).json({ message: true });

        // cannot find id, probably the user's fault
        return res.status(400).json({ message: false });
    } catch {
        return res.status(500).json({ message: false });
    }
};

export {
    login,
    signup,
    loginPage,
    logout,
    getPersonalChatId,
    checkUserChatId,
};
