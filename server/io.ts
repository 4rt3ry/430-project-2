import { Application } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import sanitizeHTML from 'sanitize-html';
import { IMessage } from './models/Message';
import GenerateAIText from './openai'


let io: Server;

const aiProbability = 0.25;

const handleMessage = (socket: Socket, msg: IMessage) => {
    socket.rooms.forEach(async (room: string) => {
        // don't send a message to itself
        if (room === socket.id) return;

        let message = sanitizeHTML(msg.message, {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: 'escape',
        });

        if (Math.random() < aiProbability) {
            message = await GenerateAIText(message);
        }

        const newMessage = {
            author: msg.author,
            authorId: msg.authorId,
            message,
            roomId: msg.roomId,
            createdDate: msg.createdDate
        }

        io.to(room).emit('chat message', newMessage);
    });
};

const handleRoomChange = (socket: Socket, room: {id: string, name: string}) => {
    socket.rooms.forEach((r: string) => {
        if (r === socket.id) {
            // tell the user they successfully changed rooms
            // this allows the user to hook events on successful
            // room change
            io.to(r).emit('room change', room);
            return;
        }
        socket.leave(r);
    });
    socket.join(room.id);
};

const setupServer = (app: Application): http.Server => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket: Socket) => {
        socket.on('chat message', (msg) => handleMessage(socket, msg));
        socket.on('room change', (room) => handleRoomChange(socket, room));
    });

    return server;
};

export default setupServer;
