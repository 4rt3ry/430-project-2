import bcrypt from 'bcrypt';
import { Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import ShortUniqueId from 'short-unique-id';

// mongodb ObjectID() does not work since its
// pseudo-random is unreliable on Heroku
const uid = new ShortUniqueId({ length: 16 });
const saltRounds = 10;

interface IRedisAccount {
    username: string,
    _id: ObjectId
}

interface IAccount {
    username: string,
    password: string,
    createdDate: Date,
    acceptedTOU: boolean,
    acceptedChatId: boolean,
    chatId: string,
    _id: ObjectId,
}

interface IAccountMethods {
    // authenticate(): any
}

interface IAccountModel extends mongoose.Model<IAccount, object, IAccountMethods> {
    authenticate(
        username: string,
        pass: string,
        callback: (err?: Error, account?: IAccount) => Response
    ): Promise<Response>,
    toAPI(account: IAccount): IRedisAccount,
    generateHash(password: string): Promise<string>,
}

const AccountSchema = new mongoose.Schema<IAccount, IAccountModel, IAccountMethods>({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_\-.]{1,16}$/,
    },
    password: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    chatId: {
        type: String,
        default: `User${uid.rnd()}`,
    },
    acceptedTOU: {
        type: Boolean,
        default: false,
    },
    acceptedChatId: {
        type: Boolean,
        default: false,
    },
});

let model: IAccountModel;

// Converts an account doc to something we can store in redis later on.
AccountSchema.static('toAPI', (doc: IAccount): IRedisAccount => ({
    username: doc.username,
    _id: doc._id,
}));

// Helper function to hash a password
AccountSchema.static('generateHash', (password: string): Promise<string> => bcrypt.hash(password, saltRounds));

/**
 * Match a given username and password against an existing one in the database
 * @param username
 * @param password
 * @param callback
 */
AccountSchema.static('authenticate', async (
    username: string,
    password: string,
    callback: (err?: Error | null, account?: IAccount) => Response,
): Promise<Response> => {
    try {
        const doc = await model.findOne({ username }).exec();
        if (!doc) {
            return callback();
        }

        const match = await bcrypt.compare(password, doc.password);
        if (match) {
            return callback(null, doc);
        }
        return callback();
    } catch (err) {
        return callback(err as mongoose.MongooseError);
    }
});

model = mongoose.model<IAccount, IAccountModel>('Account', AccountSchema);

const AccountModel = model;

export default AccountModel;
export {
    IRedisAccount,
    IAccount,
    AccountModel,
    IAccountModel,
};
