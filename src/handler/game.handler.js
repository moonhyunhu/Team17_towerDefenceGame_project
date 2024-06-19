import { getGameAssets } from '../init/assets.js';
import { setStage, clearStage, createStage, getStage } from '../models/stage.model.js';
export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  setStage(uuid, stages.data[0].stage_id, payload.message);

  return { status: 'success', handler: 2 };
};
