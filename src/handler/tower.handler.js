import { prisma } from '../utils/prisma/index.js';

//초기 배치된 타워 데이터베이스에 저장
export const startTower = async (uuid, payload) => {
  const towerData = payload.towers;
  if (!towerData) {
    return { status: 'fail', message: '최초 타워 설치 오류' };
  }
  if (towerData.length > 3 && towerData.length < 3) {
    return { status: 'fail', message: '최초 타워 개수 오류' };
  }
  for (let i = 0; i < towerData.length; i++) {
    await prisma.tower.create({});
  }
  console.log('스타트함수 처리완료');
  return { status: 'success', handler: 15 };
};

//게임 종료 시 데이터베이스에 저장된 타워 삭제
export const endTower = async (uuid, payload) => {
  await prisma.tower.deleteMany();
  console.log('게임 끝나고 타워데이터 삭제완료');
  return { status: 'success', handler: 16 };
};
