import { getGameAssets } from '../init/assets.js';
import { addUserMonster, getUserMonsters, removeMonster } from '../models/monster.model.js';
import { getUserGold, updateUserGold } from '../models/user-gold.model.js';

export const spawnMonster = (userId, payload, socket) => {
  const { monsters } = getGameAssets();
  const monsterInfo = monsters.data.find(
    (monster) => monster.monster_level === payload.monsterLevel,
  );
  if (!monsterInfo) {
    return { status: 'fail', message: '해당 몬스터를 찾을 수 없음' };
  }

  addUserMonster(userId, {
    monsterId: monsterInfo.monster_id,
    monsterLevel: payload.monsterLevel,
  });
  //getUserMonsters(userId);
  console.log('내 몬스터들 ', getUserMonsters(userId));
  return { status: 'success', handlerId:26 };
};

export const killMonster = (userId, payload, socket) => {
  const { monsters } = getGameAssets();
  const clientMonsters = payload.monsters;
  const serverMonster = getUserMonsters(userId);

  // if (clientMonsters.length !== serverMonster) {
    // return { status: 'fail', message: '서버의 몬스터 마릿수와 클라 몬스터 마릿수가 다릅니다' };
  // }

  const killmonsterInfo = monsters.data.find(
    (monster) => monster.monster_id === payload.killMonsterId,
  );
  if (!killmonsterInfo) {
    return { status: 'fail', message: '정상적인 몬스터를 잡지 않았습니다' };
  }
  const userGold = getUserGold(userId);
  const changeUserGold = userGold + killmonsterInfo.monster_gold;
  if (changeUserGold === userGold) {
    return { status: 'fail', message: '너 몬스터 안 잡았잖아' };
  }
  updateUserGold(userId, changeUserGold);
  removeMonster(userId, killmonsterInfo);

  socket.emit('killMonster', {
    userId,
    score: killmonsterInfo.score,
    gold: killmonsterInfo.monster_gold,
  });
  return { status: 'success', handlerId: 20 };
};

export const killBossMonster = (userId, payload, socket) => {
  const { monsters } = getGameAssets();

  const killmonsterInfo = monsters.data.find(
    (monster) => monster.monster_id === payload.killMonsterId,
  );
  if (!killmonsterInfo) {
    return { status: 'fail', message: '정상적인 보스 몬스터를 잡지 않았습니다' };
  }
  const userGold = getUserGold(userId);
  const changeUserGold = userGold + killmonsterInfo.monster_gold;
  if (changeUserGold === userGold) {
    return { status: fail, message: '너 보스 못 잡았잖아' };
  }
  updateUserGold(userId, changeUserGold);
  removeMonster(userId, killmonsterInfo);

  socket.emit('killBoss', {
    userId,
    score: killmonsterInfo.score,
    gold: killmonsterInfo.monster_gold,
  });
  return { status: 'success', handlerId: 21 };
};

export const spawnBoss = (userId, payload, socket) => {
  const { monsters } = getGameAssets();
  const spawnBossInfo = monsters.data.find((monster) => monster.monster_id === payload.spawnBossId);
  console.log('1: ', spawnBossInfo);
  console.log('2', payload.spawnBossId);

  if (!spawnBossInfo) {
    socket.emit('message', '서버에 그 보스가 없대');
    socket.emit('spawnBoss', {
      userId,
      spawnBoss: false,
    });
    return { status: 'fail', message: 'undefined_spawnBoss' };
  } else {
    socket.emit('spawnBoss', {
      userId,
      spawnBoss: true,
    });
    addUserMonster(userId, {
      monsterId: spawnBossInfo.monster_id,
      monsterLevel: spawnBossInfo.monster_level,
    });
  }
  return { status: 'success', handlerId: 25 };
};
