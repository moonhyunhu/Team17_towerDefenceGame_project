import { io } from '../init/socket.js';
// import { CLIENT_VERSION } from '../constants.js';
import { getUser, removeUser } from '../models/user.model.js';


export const handleDisconnect = (socket) => {
    removeUser(socket.id);
    console.log(`User disconnected: ${socket.id}`);
    console.log(`Current Users: `, getUser());
}

export const handleConnection = (socket, userUUID) => {
    console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
    console.log(`Current users: `, getUser());

    socket.emit('connection', {uuid: userUUID})
}