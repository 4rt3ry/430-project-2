import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const saltRounds = 10;

interface IRedisAccount {
    username: string,
    _id: number
}

interface IAccount {
    username: string,
    password: string,
    createdDate: Date
}

interface IAccountMethods {
    authenticate(): any
}

interface IAccountModel extends mongoose.Model<IAccount, object, IAccountMethods> {
    toAPI(): IRedisAccount,
    generateHash(): Promise<string>,
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
});

// let model: IAccountModel;
const model = mongoose.model<IAccount, IAccountModel>('Account', AccountSchema);

// Converts an account doc to something we can store in redis later on.
AccountSchema.static('toAPI', (doc): IRedisAccount => ({
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
AccountSchema.method('authenticate', async (
    username: string,
    password: string,
    callback: <T>(err?: Error | null, account?: IAccount) => T,
) => {
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

export default model;
