import { getGameAssets } from '../init/assets.js';
import { getUserGold, updateUserGold } from '../models/user-gold.model.js';

export const killMonster = (userId, payload, socket) => {
  const { monsters } = getGameAssets();

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
  console.log("1: ",killmonsterInfo.monster_gold)
  updateUserGold(userId, changeUserGold);
  console.log("2:",changeUserGold)

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
  
  if (!spawnBossInfo) {
    socket.emit('message', '서버에 그 보스가 없대');
    return { status: 'fail', message: 'undefined_spawnBoss' };
  } else {
    socket.emit('spawnBoss', {
      userId,
      spawnBoss: true,
    });
  }
  return { status: 'success', handlerId: 25 };
};
