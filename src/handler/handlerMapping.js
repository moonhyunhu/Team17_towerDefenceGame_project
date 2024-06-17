// import { moveStageHandler } from '../handlers/stage.handller.js'
// import { gameEnd, gameStart } from './game.handler.js';
// import { highScoreHandler } from './highScore.handler.js';


const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  12: highScoreHandler,
};

export default handlerMappings;