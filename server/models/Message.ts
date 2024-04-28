import mongoose from 'mongoose';

interface IMessage {
    author: string,
    authorId: String
    roomId: string,
    message: string,
    createdDate: Date,
}

const MessageSchema = new mongoose.Schema<IMessage>({
    author: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: '',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
export {
    MessageModel,
    IMessage,
};
