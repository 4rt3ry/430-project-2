import { Request, Response } from 'express';
import { mongo } from 'mongoose';
import PasswordValidator from 'password-validator';
import Account, { IAccount } from '../models/Account';
import bcrypt from 'bcrypt'

const validator = new PasswordValidator();
validator
    .is().min(6)
    .is().max(30)
    .has()
    .not()
    .spaces();

const loginPage = (req: Request, res: Response) => res.render('login');

const accountPage = (req: Request, res: Response) => res.render('account');

const logout = (req: Request, res: Response) => {
    req.session.destroy(() => { });
    return res.redirect('/');
};

const login = (req: Request, res: Response) => {
    const username = (req.body.username ?? "").trim();
    const pass = (req.body.pass ?? "").trim();
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

/**
 * When signing up, username and password must pass validation (6+ chars, no spaces, unique)
 * @param req 
 * @param res 
 * @returns 
 */
const signup = async (req: Request, res: Response) => {
    const username = (req.body.username ?? "").trim();
    const pass = (req.body.pass ?? "").trim();
    const pass2 = (req.body.pass2 ?? "").trim();

    if (!username || !pass || !pass2) {
        return res.status(400).json({ error: 'All fields are required!' });
    }
    if (pass !== pass2) {
        return res.status(400).json({ error: 'Passwords must match' });
    }

    if (!validator.validate(username)) {
        return res.status(400).json({ error: 'Username must be between 6 and 30 characters and have no spaces.' });
    }
    if (!validator.validate(pass)) {
        return res.status(400).json({ error: 'Password must be between 6 and 30 characters and have no spaces.' });
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
 * To change username or password, use modifyAccountSecure
 * @param req
 * @param res
 * @returns
 */
const modifyAccount = async (req: Request, res: Response) => {
    try {
        // ensure user is actually logged into an account and their id exists
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        const acceptedTOU = req.body.acceptedTOU;
        const acceptedChatId = req.body.acceptedChatId;
        const chatId = (req.body.chatId ?? "").trim();

        // handle account modifications strictly
        if (docs) {
            const modifications: {
                acceptedTOU?: boolean,
                acceptedChatId?: boolean,
                chatId?: string
            } = {};

            // these don't need to be secure
            if (acceptedTOU === true) modifications.acceptedTOU = true;
            if (acceptedChatId === true) modifications.acceptedChatId = true;

            // check if username or chat ID already exist
            if (chatId) {
                const chatIdQuery = { chatId };
                if (await Account.findOne(chatIdQuery).exec()) {
                    return res.status(400).json({ error: 'Chat ID already exists' });
                }

                // chatId does not need to be validated
                modifications.chatId = chatId;
            }

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

/**
 * Requires the client to provide a password for security
 * @param req 
 * @param res 
 */
const modifyAccountSecure = async (req: Request, res: Response) => {
    try {
        // ensure user is actually logged into an account and their id exists
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        if (docs) {

            const password = (req.body.password ?? "").trim();
            const newUsername = (req.body.newUsername ?? "").trim();
            const newPassword = (req.body.newPassword ?? "").trim();
            const newPassword2 = (req.body.newPassword2 ?? "").trim();

            if (!password)
                return res.status(400).json({error: 'Must supply a password'});

            // ensure current password is correct before moving on
            const correctPass = await bcrypt.compare(password, docs.password);
            if (!correctPass) {
                return res.status(400).json({error: 'Password is incorrect'});
            }


            const modifications: {
                username?: string,
                password?: string,
            } = {};

            // validate any username, chatID, or password changes

            // check if username or chat ID already exist
            if (newUsername) {
                const unameQuery = { username: newUsername };
                if (await Account.findOne(unameQuery).exec()) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                if (validator.validate(newUsername)) {
                    modifications.username = newUsername;
                } else return res.status(400).json({ error: 'Username must 6-30 characters in length with no spaces' });
            }

            // If user creates a new password, make sure to store the hash
            if (newPassword) {
                if (newPassword !== newPassword2)
                    return res.status(400).json({error: 'New passwords must match'});
                if (validator.validate(newPassword)) {
                    const hash = await Account.generateHash(newPassword);
                    modifications.password = hash;
                }
                else return res.status(400).json({ error: 'Password must 6-30 characters in length with no spaces' });
            }

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
}

const getAccount = async (req: Request, res: Response) => {
    if (req.headers.accept === 'text/html') return accountPage(req, res);

    try {
        const query = { _id: req.session.account?._id };
        const docs = await Account.findOne(query).exec();

        if (docs) {
            const account = {
                username: docs?.username,
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
    accountPage,
    getPersonalChatId,
    checkUserChatId,
    modifyAccount,
    modifyAccountSecure,
    getAccount,
};
