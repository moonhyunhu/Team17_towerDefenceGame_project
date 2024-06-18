import { Server as SocketIO } from 'socket.io';
import userHandler from '../handler/user.handler.js';

let io; // 전역 변수로 설정

const initSocket = (server) => {
  io = new SocketIO(server, {
    cors: {
      origin: 'http://<>:3000', // 허용하고자 하는 도메인
      methods: ["GET", "POST"]
    }
  });
  io.attach(server);

  // 클라이언트로부터 오는 이벤트를 처리할 핸들러를 서버에 등록
  userHandler(io);
};

export { io }; // io를 export
export default initSocket;
