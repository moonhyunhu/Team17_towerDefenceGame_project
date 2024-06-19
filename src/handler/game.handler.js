import { getStage, clearStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  setStage(uuid, stages.data[0].id, payload.timestamp);

  return { status: 'success', handler: 2 };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트에서 받은 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  console.log(`score: ${score}`);
  // 모든 검증이 통과된 후, 클라이언트에서 제공한 점수 저장하는 로직
  // saveGameResult(userId, clientScore, gameEndTime);

  // 검증이 통과되면 게임 종료 처리
  return { status: 'success', message: 'Game ended successfully', score, handler: 3 };
};