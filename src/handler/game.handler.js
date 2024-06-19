import { getGameAssets } from '../init/assets.js';
import { setStage, clearStage, createStage, getStage } from '../models/stage.model.js';
export const gameStart = (uuid, payload, socket) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  setStage(uuid, stages.data[0].stage_id, payload.message);

  //console.log(uuid);
  socket.emit('gameStart', {
    uuid,
    stage: stages.data[0].stage_id,
  });

  return { status: 'success', handler: 2 };
};
