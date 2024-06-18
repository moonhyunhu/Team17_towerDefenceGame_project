import { Server as SocketIO } from 'socket.io';

let io; //전역변수

const initSocket = (server) => {
  io = new SocketIO(server, {
    cors: {
      origin: '*', // 허용하고자 하는 도메인
      methods: ["GET", "POST"], // WebSocket handshake에 허용되는 메서드
      allowedHeaders: ["Authorization"] // JWT 등을 허용할 헤더
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

export { io }; // io를 export
export default initSocket;
