import { Application } from 'express';
import http from 'http'
import { Server, Socket } from 'socket.io'

let io: Server;

const handleMessage = (socket: Socket, msg: string) => {
    socket.rooms.forEach((room: string) => {
        // don't send a message to itself
        if (room === socket.id) return;

        io.to(room).emit('chat message', msg);
    })
}

const handleRoomChange = (socket: Socket, roomId: string) => {
    socket.rooms.forEach((room: string) => {
        if (room === socket.id) return;
        socket.leave(room);
    });
    socket.join(roomId);
}

const setupServer = (app: Application): http.Server => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket: Socket) => {
        socket.on('chat message', (msg) => handleMessage(socket, msg));
        socket.on('room change', (room) => handleRoomChange(socket, room));
    });

    return server;
}

export default setupServer;