import { getGameAssets } from '../init/assets.js';
import { setStage, clearStage, createStage, getStage } from '../models/stage.model.js';
export const gameStart = (userid, payload, socket) => {
  const { stages } = getGameAssets();
  clearStage(userid);
  setStage(userid, stages.data[0].stage_id, payload.message);

  socket.emit('gameStart', {
    userid,
    stage: stages.data[0].stage_id,
  });

  return { status: 'success', handler: 2 };
};

export const gameEnd = (userid, payload, socket)=>{
  const {score} = payload;
  console.log(score);
  socket.emit('gameEnd',{
    userid,
    score,
  })
  return { status: 'success', handler: 3 };
}