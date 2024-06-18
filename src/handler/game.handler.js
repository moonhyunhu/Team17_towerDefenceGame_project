import { clearStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  setStage(uuid, stages.data[0].stage_id, payload.message);
  console.log(stages.data[0].stage_id, payload.message);

  return { status: 'success', handler: 2 };
};

export const saveTower = (uuid, payload) => {
  const { towers } = getGameAssets();
  return { status: 'success', payload };
};
