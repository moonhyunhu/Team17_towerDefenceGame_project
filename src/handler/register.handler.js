
import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js'
import { createUserGold } from '../models/user-gold.model.js';



const registerHandler = (io) => {

  io.on('connection', (socket) => {

    const userUUID = uuidv4();
    
    addUser({ uuid: userUUID, socketId: socket.id });
    createUserGold(userUUID);
    handleConnection(socket, userUUID);

    socket.on('event', (data) => handleEvent(io, socket, data));

    socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
