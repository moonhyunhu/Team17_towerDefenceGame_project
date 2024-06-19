import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect } from './helper.js';

const userHandler = (io) => {
  io.on('connection', (socket) => {
    // 연결 시 이벤트
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    handleConnection(socket, userUUID);

    // 연결 해제 시 이벤트
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

export default userHandler;
