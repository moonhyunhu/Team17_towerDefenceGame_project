import { moveStageHandler } from './stage.handler.js'
import { gameStart,gameEnd } from './game.handler.js';
import { endTower, startTower } from './tower.handler.js';
import { killMonster,killBossMonster, spawnBoss, spawnMonster } from './kill.handler.js';
import { purchaseTower } from "./tower.handler.js";

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  13: purchaseTower,
  15: startTower,
  16: endTower,
  20: killMonster,
  21: killBossMonster,
  25: spawnBoss,
  26: spawnMonster,
};

export default handlerMappings;
