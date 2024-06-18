// import { moveStageHandler } from '../handlers/stage.handller.js'
 import { gameStart, saveTower } from './game.handler.js';
// import { highScoreHandler } from './highScore.handler.js';


const handlerMappings = {
  2: gameStart,
  //3: gameEnd,
  //11: moveStageHandler,
  //12: highScoreHandler,
  20: saveTower,
};

export default handlerMappings;