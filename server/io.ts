import { Application } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import sanitizeHTML from 'sanitize-html';

let io: Server;

const handleMessage = (socket: Socket, msg: string) => {
    socket.rooms.forEach((room: string) => {
        // don't send a message to itself
        if (room === socket.id) return;

        io.to(room).emit('chat message', sanitizeHTML(msg, {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: 'escape',
        }));
    });
};

const handleRoomChange = (socket: Socket, roomId: string) => {
    socket.rooms.forEach((room: string) => {
        if (room === socket.id) {
            // tell the user they successfully changed rooms
            // this allows the user to hook events on successful
            // room change
            io.to(room).emit('room change', roomId);
            return;
        }
        socket.leave(room);
    });
    socket.join(roomId);
    console.log(roomId);
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
