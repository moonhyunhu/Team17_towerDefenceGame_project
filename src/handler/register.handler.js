//uuid를 통해 유저를 특정할 수 있다 socketId으로는 불가
//서버에서는 socketId를 통해 접속 중이라는 상태를 확인 할 수 있다.
//재 접속하면 기존 socketId가 아닌 새로운 id발급
import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handleEvent } from './helper.js';
import { clearStage, createStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';


const registerHandler = (io) => {
  //io.on = connection이벤트가 발생할때까지 대기 발생하면 뒤에 콜백함수 호출
  io.on('connection', (socket) => {
    //이벤트 처리
    //uuid생성,socketId생성
    //유저 등록 이벤트
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });
    //createStage(userUUID);

    //
    handleConnection(socket, userUUID);
    socket.on('gameStart',{});
    socket.on('gameEnd',()=>{});
    socket.on('initialTower',()=>{});
    socket.on('killMonster',()=>{});
    socket.on('killMonster',()=>{});

    //event라는 이름으로 발생하는 모든 이벤트를 handlerEvent 함수로 전달
    //socket.on('event', (data) => handleEvent(io, socket, data));

    //접속 해제시 이벤트
    //io.on은 서버 대상 전체 이벤트 socket.on은 하나의 유저 대상인 이벤트 처리
    socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
