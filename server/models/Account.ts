import bcrypt from 'bcrypt';
import mongoose, { InferSchemaType, MongooseError, StringExpressionOperatorReturningBoolean } from 'mongoose';

const saltRounds = 10;

interface RedisAccount {
    username: string,
    _id: number
}

const AccountSchema = new mongoose.Schema({
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

type Account = InferSchemaType<typeof AccountSchema>;

let AccountModel: unknown;

// Converts an account doc to something we can store in redis later on.
AccountSchema.statics.toAPI = (doc): RedisAccount => ({
    username: doc.username,
    _id: doc._id,
});

// Helper function to hash a password
AccountSchema.statics.generateHash = (password: string): Promise<string> => bcrypt.hash(password, saltRounds);

/**
 * Match a given username and password against an existing one in the database
 * @param username
 * @param password
 * @param callback
 */
AccountSchema.statics.authenticate = async (
    username: string,
    password: string,
    callback: <T>(err?: Error | null, account?: Account) => T,
) => {
    try {
        const doc = await AccountModel.findOne({ username }).exec();
        if (!doc) {
            return callback();
        }

        const match = await bcrypt.compare(password, doc.password);
        if (match) {
            return callback(null, doc);
        }
        return callback();
    } catch (err) {
        return callback(err as MongooseError);
    }
};

AccountModel = mongoose.model('Account', AccountSchema);
export { AccountModel };
