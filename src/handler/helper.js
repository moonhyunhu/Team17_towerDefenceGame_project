import { io } from '../init/socket.js';
import { addUser, getUsers, removeUser } from '../models/user.model.js';
import { CLIENT_VERSION } from '../constants.js';
import handlerMappings from './handlerMapping.js';
import { createStage, setStage, getStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const handleConnection = (socket, uuid) => {
  console.log(`New user connected: ${uuid} with socket ID ${socket.id}`);
  console.log('Current users:', getUsers());
  createStage(uuid);
  const { stages } = getGameAssets();
  //console.log(uuid);

  socket.emit('connection', { uuid });

  socket.emit('initialTower', {
    uuid,
    numOfInitialTowers: 3,
  });

  socket.emit('syncGameState', {
    uuid,
    towerCost: 3000,
    monsterLevel: 1,
    monsterSpawnInterval: 3000,
  });;
};

export const handleDisconnect = (socket, uuid) => {
  removeUser(uuid); // 사용자 삭제
  console.log(`User disconnected: ${uuid}`);
  console.log('Current users:', getUsers());
};

export const handleEvent = (io, socket, data) => {
  console.log(`Event received from UUID: ${data.userId}`);
  //console.log(`Event data:`, data);
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    //payload에 넘어온 버전이 지원하지 않는 버전인 경우
    socket.emit('response', { status: 'fail', message: '지원하지 않는 버전입니다.' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: '해당 핸들러를 찾을 수 없습니다.' });
    return;
  }

  const response = handler(data.userId, data.payload, socket, io);
  if (response?.broadcast) { //response가 broadcast형식을 띈다면 id.emit 그렇지 않으면 socket.emit
    io.emit('response', response);
    return;
  }
  socket.emit('response', response);
};
