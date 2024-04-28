import { Request, Response } from 'express';
import { mongo } from 'mongoose';
import PasswordValidator from 'password-validator';
import Account, { IAccount } from '../models/Account';

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
 * by connecting to each other's chat id. GET only
 * @param req
 * @param res
 */
const getPersonalChatId = async (req: Request, res: Response) => {
    try {
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();
        return res.json({ chatId: docs?.chatId, staticChatId: docs?.staticChatId });
    } catch {
        return res.status(500).json({ error: 'Could not retrieve chat id' });
    }
};

/**
 * Check if a user's chat id exists. GET only
 * @param req
 * @param res
 */
const checkUserChatId = async (req: Request, res: Response) => {
    try {
        const query = { chatId: req.query.chatId?.toString() };
        const docs = await Account.findOne(query).exec();

        // can find id, tell user it's all ok
        if (docs) return res.status(200).json({ message: true });

        // cannot find id, probably the user's fault
        return res.status(400).json({ message: false });
    } catch {
        return res.status(500).json({ message: false });
    }
};

/**
 * Modify account data.
 * @param req
 * @param res
 * @returns
 */
const modifyAccount = async (req: Request, res: Response) => {
    try {
        // ensure user is actually logged into an account and their id exists
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        console.log(req.body);

        // handle account modifications strictly
        if (docs) {
            const modifications: {
                username?: string,
                acceptedTOU?: boolean,
                acceptedChatId?: boolean,
                chatId?: string,
            } = {};

            // these don't need to be secure
            if (req.body.acceptedTOU === true) modifications.acceptedTOU = true;
            if (req.body.acceptedChatId === true) modifications.acceptedChatId = true;

            // validate any username, chatID, or password changes

            const validator = new PasswordValidator();
            validator
                .is().min(6)
                .is().max(30)
                .has()
                .not()
                .spaces();

            // check if username or chat ID already exist
            if (req.body.username) {
                const unameQuery = { username: req.body.username };
                if (await Account.findOne(unameQuery).exec()) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                if (validator.validate(req.body.username)) {
                    modifications.username = req.body.username;
                } else return res.status(400).json({ error: 'Invalid username' });
            }
            // check if username or chat ID already exist
            if (req.body.chatId) {
                const chatIdQuery = { chatId: req.body.chatId };
                if (await Account.findOne(chatIdQuery).exec()) {
                    return res.status(400).json({ error: 'Chat ID already exists' });
                }

                // chatId does not need to be validated
                modifications.chatId = req.body.chatId;
            }

            // FOR PASSWORD CHANGES, MAKE SURE TO SAVE THE HASH
            // if (validator.validate(req.body.password)) {
            //         modifications.password = req.body.password;
            // }
            // else return res.status(400).json({ error: 'Invalid password' });

            // finally make the modifications
            if (Object.keys(modifications).length > 0) {
                const updatedDoc = await Account.updateOne(
                    query,
                    {
                        $set: modifications,
                    },
                );
                if (updatedDoc) return res.status(200).json({ message: 'Successful update' });
            }
            return res.status(204).json({ message: 'Nothing updated' });
        }

        return res.status(400).json({ error: 'Could not find account' });
    } catch {
        return res.status(500).json({ error: 'Could not modify account.' });
    }
};

const getAccount = async (req: Request, res: Response) => {
    try {
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        if (docs) {
            const account = {
                username: docs?.username,
                password: docs?.password,
                acceptedChatId: docs?.acceptedChatId,
                acceptedTou: docs?.acceptedTOU,
                chatId: docs?.chatId,
            };
            return res.status(200).json(account);
        }
        return res.status(500).json({ error: 'Could not retrieve account' });
    } catch {
        return res.status(500).json({ error: 'Could not retrieve account' });
    }
};

export {
    login,
    signup,
    loginPage,
    logout,
    getPersonalChatId,
    checkUserChatId,
    modifyAccount,
    getAccount,
};
