//import { moveStageHandler } from './stage.handler.js'
import { gameStart } from './game.handler.js';
import { endTower, startTower } from './tower.handler.js';
// import { highScoreHandler } from './highScore.handler.js';

const handlerMappings = {
  2: gameStart,
  //3: gameEnd,
  // 11: moveStageHandler,
  //12: highScoreHandler,
  // 20: saveTower,
  15: startTower,
  16: endTower
};

export default handlerMappings;
