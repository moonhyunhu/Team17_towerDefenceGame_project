import { io } from '../init/socket.js';
// import { CLIENT_VERSION } from '../constants.js';
import { getUser, removeUser } from '../models/user.model.js';
import { getUserGold } from '../models/user-gold.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = (socket) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log(`Current Users: `, getUser());
};

export const handleConnection = (socket, uuid) => {
  console.log(`New user connected: ${uuid} with socket ID ${socket.id}`);
  console.log(`Current users: `, getUser());

  socket.emit('connection', { uuid });
  socket.emit('syncGameState', {
    uuid,
    towerCost: 3000,
    monsterLevel: 1,
    monsterSpawnInterval: 3000,
  });

  socket.on('requestUserGold', () => {
    const userGold = getUserGold(uuid); // Fixed the incorrect variable name
    console.log('Sending userGold:', userGold); // Log userGold being sent
    socket.emit('userGold', { userGold });
  });

  socket.on('placeNewTower', (payload) => {
    console.log('Received placeNewTower event with payload:', payload); // Log received payload
    const result = purchaseTower(uuid, payload);
    console.log('Tower purchase result:', result);
    socket.emit('towerPurchaseResult', result); // Sending tower purchase result back to the client
  });
};

export const handlerEvent = (io, socket, data) => {
  // if (!CLIENT_VERSION.includes(data.clientVersion)) {
  //   socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
  //   return;
  // }
  //mappings 연동
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }
  // 적절한 핸들러에 userID 와 payload를 전달하고 결과를 받습니다.
  const response = handler(data.userId, data.payload);
  // 만약 결과에 broadcast (모든 유저에게 전달)이 있다면 broadcast 합니다.
  if (response.broadcast) {
    io.emit('response', 'broadcast');
    return;
  }
  // 해당 유저에게 적절한 response를 전달합니다.
  socket.emit('response', response);
};
