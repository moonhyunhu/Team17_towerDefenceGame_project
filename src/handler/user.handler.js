import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';
import { createUserGold } from '../models/user-gold.model.js';

const userHandler = (io) => {
  io.on('connection', (socket) => {
    // 연결 시 이벤트
    console.log('너 왜 두개 뜨냐');
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });
    console.log('아이오.온', userUUID)

    createUserGold(userUUID);

    handleConnection(socket, userUUID);

    socket.on('event', (data) => {handlerEvent(io, socket, data), console.log('유저 핸들러', data.userId)});

    // 연결 해제 시 이벤트
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default userHandler;
