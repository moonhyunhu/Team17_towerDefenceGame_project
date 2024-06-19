import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handler/register.handler.js';
//import userHandler from '../handler/user.handler.js';

let io; //전역변수

const initSocket = (server) => {
  io = new SocketIO(server, {
    cors: {
      origin: '*', // 허용하고자 하는 도메인
      methods: ["GET", "POST"], // WebSocket handshake에 허용되는 메서드
      allowedHeaders: ["Authorization"] // JWT 등을 허용할 헤더
    }
  });
  //io.attach(server);

  // 클라이언트로부터 오는 이벤트를 처리할 핸들러를 서버에 등록
  registerHandler(io);

  //userHandler(io);
};

export { io }; // io를 export
export default initSocket;
