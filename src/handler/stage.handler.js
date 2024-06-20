//유저는 스테이지를 하나씩 올라갈 수 있다. 1->2 O, 1->3 X
//유저는 일정 점수가 되면 다음 스테이지로 이동
//currentStage, targetStage두개를 넘겨야 함

//유저의 현재 스테이지 정보

//오름차순 -> 가장 큰 스테이지 ID를 확인 <-유저의 현재 스테이지

//서버에서 보내주는 현재 유저의 스테이지 위치

//[length-1] 가장 마지막 스테이지의 id를 currentStageId에 저장

//클라이언트 vs 서버 비교
//서버에서 보내준 스테이지id와 payload에 담긴 스테이지id가 다른경우

//점수 검증 로직

//만약 1스테이지 -> 2스테이지로 넘어가는 과정
//오차범위 5 임의로 정함
//2스테이지를 가려면 elapsedTime이 최소 100은 넘어야하고 오차 범위 105까지의 조건을 줌
//100이 안됐는데 2스테이를 간다거나 105가 됐는데도 2스테이지를 안넘어가는 것은 오류이기 때문
//지연시간때문에 딜레이가 생긴 경우
//하드 코딩

//targetStage에 대한 검증 게임 에셋에 존재하는가?

//some 조건이 한개라도 맞으면 true반환
//!사용해서 false가 나오는데 그러면 status: fail을 리턴하는 조건문

//위에 검증을 모두 통과했을 때 userId와 payload에 targetStage를 setStage함수에 넣는다.
//새로운 스테이지에 진입하면 serverTime을 다시 시작해야하기 때문
import { prisma } from '../utils/prisma/index.js';
import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';
//import calculateTotalScore from '../utils/calculateTotalScore.js';
//import { getUserItems } from '../models/item.model.js';

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
  if(currentStage.id === 1005){
    socket.emit('message','종말을 맞이하라')
    socket.emit('NewStage', {
      userId,
      monsterLevel: 5,
      stage: 1005,
    });
  }

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
    console.log(targetLevelInfo.monster_level);

    setStage(userId, payload.targetStage, payload.message);
    console.log(payload.targetStage);

    socket.emit('NewStage', {
      userId,
      monsterLevel: targetLevelInfo.monster_level,
      stage: payload.targetStage,
    });
    socket.emit('message','레벨 증가')
  }

  console.log(getStage(userId));

  return { status: 'success', handler: 11 };
};
