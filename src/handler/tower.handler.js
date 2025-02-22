import { prisma } from '../utils/prisma/index.js';
import { getGameAssets } from '../init/assets.js';
import { getUserGold, updateUserGold } from '../models/user-gold.model.js';
import { addUserTower, getUserTowers } from '../models/tower.model.js';

//초기 배치된 타워 데이터베이스에 저장
export const startTower = async (uuid, payload) => {
  const { towers } = getGameAssets();
  const lowestLevelTower = towers.data.find((tower) => tower.tower_level === 1);

  const towerData = payload.towers;

  if (!towerData) {
    return { status: 'fail', message: '최초 타워 설치 오류' };
  }

  if (towerData.length !== 3) {
    return { status: 'fail', message: '최초 타워 개수 오류' };
  }

  for (let i = 0; i < towerData.length; i++) {
    addUserTower(uuid, {
      towerId: lowestLevelTower.tower_id,
      x: towerData[i].x,
      y: towerData[i].y,
    });
    await prisma.tower.create({});
  }
  const getTowers = getUserTowers(uuid);
  console.log("나의 최초 타워정보: ", getTowers)
  return { status: 'success', handler: 15 };
};

//게임 종료 시 데이터베이스에 저장된 타워 삭제
export const endTower = async (uuid, payload) => {
  await prisma.tower.deleteMany();
  return { status: 'success', handler: 16 };
};

//타워 구매
export const purchaseTower = (userId, payload) => {
  const { towers } = getGameAssets();

  // // 유저의 골드 확인
  const userGold = getUserGold(userId, {
    towerId: payload.tower_id,
    x: payload.position.x,
    y: payload.position.y,
  });

  // 타워 정보 확인
  const towerData = towers.data.find((data) => data.tower_id === payload.tower_id);
  if (!towerData) {
    return { status: 'fail', message: 'Invalid tower ID' };
  }

  // 타워 가격 확인
  const towerCost = towerData.tower_cost;
  const clientGold = payload.userGold;

  if (clientGold !== userGold - towerCost) {
    console.log(clientGold);
    console.log(userGold - towerCost);
    return { status: 'fail', message: `타워의 금액이 맞지 않습니다` };
  }

  // 서버 유저 골드랑 클라이언트 유저 골드가 일치하는지
  if (userGold >= towerCost) {
    const newUserGold = userGold - towerCost;

    updateUserGold(userId, newUserGold);

    // 유저의 타워 목록에 타워 추가
    addUserTower(userId, {
      towerId: payload.tower_id,
      x: payload.position.x,
      y: payload.position.y,
    });

    // Check if tower has been added successfully
    const userTowers = getUserTowers(userId);
    const addedTower = userTowers.find((towers) => towers.towerId === payload.tower_id);

    if (addedTower) {
      console.log('타워 추가 성공', addedTower);
      console.log('현재 내 타워: ', userTowers);
    } else {
      console.log('타워 추가 실패');
    }

    const currentUserGold = getUserGold(userId);

    console.log('현재 보유하는 골드 :', currentUserGold);

    return {
      status: 'success',
      message: '타워 구매 완료입니다.',
      position: { x: payload.position.x, y: payload.position.y },
      newGoldAmount: currentUserGold,
    };
  } else {
    const neededGold = towerCost - clientGold;
    return {
      status: 'fail',
      message: `타워 구매 실패하였습니다. ${neededGold} 골드가 더 필요합니다.`,
    };
  }
};
