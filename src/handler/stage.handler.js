import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';

export const moveStageHandler = (userId, payload, socket) => {
  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: '스테이지에 유저가 존재하지 않습니다' };
  }

  // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 = 가장 상위의 스테이지 = 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];
  console.log('받은 스테이지', currentStage);

  // payload 의 currentStage 와 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: '서버에 전달된 스테이지와 현재 스테이지가 다릅니다' };
  }

  // 게임 에셋에서 스테이지 정보 가져오기
  const { stages, monsters } = getGameAssets();

  // 현재 스테이지의 정보를 stageTable 에서 가져옴
  const currentStageInfo = stages.data.find((stage) => stage.stage_id === payload.currentStage);
  if (!currentStageInfo) {
    return { status: 'fail', message: '데이터와 일치하는 현재 스테이지를 찾을 수 없습니다' };
  }

  const targetStageInfo = stages.data.find((stage) => stage.stage_id === payload.targetStage);
  if (!targetStageInfo) {
    return { status: 'fail', message: '데이터와 일치하는 다음 스테이지가 없습니다.' };
  } else {
    const targetLevelInfo = monsters.data.find(
      (monster) => monster.monster_id === targetStageInfo.monster,
    );
    //console.log(currentStage)
    // console.log(currentStageInfo)
    // console.log(targetStageInfo)
    //console.log(targetLevelInfo.monster_level);
    if (currentStage.id === 1005) {
      socket.emit('message', '종말을 맞이하라');
      socket.emit('NewStage', {
        userId,
        monsterLevel: 5,
        stage: 1005,
      });
    }

    setStage(userId, payload.targetStage, payload.message);
    //console.log(payload.targetStage);

    socket.emit('NewStage', {
      userId,
      monsterLevel: targetLevelInfo.monster_level,
      stage: payload.targetStage,
    });
    socket.emit('message', '레벨 증가');
  }

  console.log(getStage(userId));

  return { status: 'success', handler: 11 };
};
