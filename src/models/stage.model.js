//이번엔 객체로 생성하는 이유
//key:uuid, value:[] -> stage 정보는 복수 배열형식
const stages = {};

//스테이지 초기화 함수
export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, payload) => {
  return stages[uuid].push({ id, payload });
};

export const clearStage = (uuid) => {
  return (stages[uuid] = []);
};
