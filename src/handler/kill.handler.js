export const killMonster = (userId, payload, socket) => {
  socket.emit('killMonster', {
    userId,
    score: payload.killMonsterScore,
    gold: payload.killMonsterGold,
  });
  return { status: 'success', handlerId: 20 };
};
export const killBossMonster = (userId, payload, socket) => {
  socket.emit('killBoss', {
    userId,
    score: payload.killMonsterScore,
    gold: payload.killMonsterGold,
  });
  return { status: 'success', handlerId: 21 };
};

export const spawnBoss = (userId, payload, socket) => {
  socket.emit('spawnBoss', {
    userId,
    spawnBoss: true,
  });
  return { status: 'success', handlerId: 25 };
};
