import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { CLIENT_VERSION } from './Constants.js';

//access 토큰 로컬스토리지에 없을 경우 return
const accessToken = localStorage.getItem('accessToken');
if (!accessToken) {
  alert('로그인이 필요합니다.');
  window.location.href = 'index.html';
}

//monster.json 파일 가져오기(점수와 골드 획득용)
const monsterDataResponse = await fetch('../assets/monster.json');
const monsterInfo = await monsterDataResponse.json();
export const monsterData = monsterInfo.data;

//stage.json 파일 가져오기(스테이지 변경용)
const stageDataResponse = await fetch('../assets/stage.json');
const stageInfo = await stageDataResponse.json();
const stageData = stageInfo.data;

//tower.json 파일 가져오기(타워 금액 & 아이디값 불러오는용)
const towerDataResponse = await fetch('../assets/tower.json');
const towerInfo = await towerDataResponse.json();
const towerData = towerInfo.data;

let serverSocket; // 서버 웹소켓 객체
let sendEvent;
let userId = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수
let stage = 0;

let userGold = 0;
let base; // 기지 객체
let baseHp = 5000; // 기지 체력

let towerCost = 0; // 타워 구입 비용
let numOfInitialTowers = 0; // 초기 타워 개수
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 0; // 몬스터 생성 주기
const monsters = [];
const towers = [];

let currentStage = 1001;
let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수 (개인)
let highScoreAll = 0; // 기존 최고 점수 (전체)
let highScoreMan = ''; // 최고 점수 유저
let isInitGame = false;
let pause = false; // 일시정지
let speedMultiple = 1; // 배속
let intervalId; // 몬스터 반복 소환
let spawnBoss = false;
let gameOver = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImage = new Image();
towerImage.src = 'images/tower.png';

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTowers() {
  /* 
      타워를 초기에 배치하는 함수입니다.
      무언가 빠진 코드가 있는 것 같지 않나요? 
    */
  let lowestLevelTower = towerData.find((data) => data.tower_level === 1);
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, towerCost);
    towers.push(tower);
    tower.draw(ctx, towerImage);
  }
  sendEvent(15, { towers });
}

function placeNewTower() {
  /* 
      타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
      빠진 코드들을 채워넣어주세요! 
    */
  let lowestLevelTower = towerData.find((data) => data.tower_level === 1);

  if (userGold >= towerCost) {
    const { x, y } = getRandomPositionNearPath(200);
    const tower = new Tower(x, y, towerCost);
    towers.push(tower);
    tower.draw(ctx, towerImage);

    userGold -= towerCost;

    const payload = {
      userGold,
      tower_id: lowestLevelTower.tower_id,
      position: { x, y },
    };

    sendEvent(13, payload);
  } else {
    console.log(`골드가 부족합니다 현재 나의 골드:${userGold}`);
  }
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  if (!gameOver) {
    if (spawnBoss) {
      spawnBoss = false;
      let currentMonster = stageData.find((data) => data.stage_id === currentStage).monster;
      monsterLevel = monsterData.find((data) => data.monster_id === currentMonster).monster_level;
      monsters.push(new Monster(monsterPath, monsterImages, monsterLevel + 10));
    } else {
      let currentMonster = stageData.find((data) => data.stage_id === currentStage).monster;
      monsterLevel = monsterData.find((data) => data.monster_id === currentMonster).monster_level;
      monsters.push(new Monster(monsterPath, monsterImages, monsterLevel));
      sendEvent(26,{monsterLevel})
    }
  }
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`현재 계정 최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시
  ctx.fillStyle = 'red';
  ctx.fillText(`전체 계정 최고 기록: ${highScoreAll}`, 100, 250); //전체 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`전체 계정 최고 기록 유저: ${highScoreMan}`, 100, 300); //전체 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx, towerImage);
    if (!pause) {
      tower.updateCooldown(speedMultiple);
      monsters.forEach((monster) => {
        const distance = Math.sqrt(
          Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
        );
        if (distance < tower.range) {
          tower.attack(monster);
        }
      });
    }
  });

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx, baseImage);
  gameOver = false;
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base, pause, speedMultiple);
      if (isDestroyed) {
        /* 게임 오버 */
        sendEvent(16, {});
        sendEvent(3, { score });
        gameOverScreen();
        gameOver = true;
        //highscore 비교 + 갱신
        if (highScore < score) {
          highScore = score;
          // 서버로 최고 점수 업데이트 요청
          fetch('http://qkqhajdcjddl.shop:5555/auth/highScore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
            body: JSON.stringify({ score: highScore }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('최고 점수 갱신 완료:', data);
            })
            .catch((error) => {
              console.error('최고 점수 갱신 실패', error);
            });
        }
        return;
      }
      monster.draw(ctx);
    } else {
      /* 몬스터가 죽었을 때 */
      if (!monster.attack) {
        const currentMonster = monsterData.find((data) => data.monster_level === monster.level);
        //console.log(currentMonster)
        if (currentMonster.monster_id > 110) {
          sendEvent(21, {
            killMonsterId: currentMonster.monster_id,
            killMonsterLevel: currentMonster.monster_level,
            monster:monsters
          }); //보스 처치 이벤트
        } else {
          sendEvent(20, {
            killMonsterId: currentMonster.monster_id,
            monsters
          }); //몬스터 처치 이벤트
        }
        //score += currentMonster.score;
        //userGold += currentMonster.monster_gold;
        monsters.splice(i, 1);

        const currentBoss = monsterData.find((data) => data.monster_level === monster.level);
        let changeStageScore = stageData.find((data) => data.stage_id === currentStage);
        if (score >= changeStageScore.score) {
          sendEvent(25, { spawnBossId: currentBoss.monster_id + 10 }); //보스 소환
          if (currentStage < 1005) {
            sendEvent(11, {
              currentStage: currentStage,
              targetStage: currentStage + 1,
              message: '레벨증가!',
            }); // 스테이지 이동
          }
          //currentStage++;
        }
      } else {
        monsters.splice(i, 1);
      }
      // handleMonsterKill(monster, i);
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  monsterSpawnInterval = stageData.find((data) => data.stage_id === currentStage).spawn_interval;
  intervalId = setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

function pauseGame() {
  console.log('게임 일시정지!');
  pause = true;
  document.body.removeChild(pauseButton);
  document.body.appendChild(replayButton);
  clearInterval(intervalId);
}

function replayGame() {
  console.log('게임 다시 시작!');
  pause = false;
  document.body.removeChild(replayButton);
  document.body.appendChild(pauseButton);
  intervalId = setInterval(spawnMonster, monsterSpawnInterval);
}

function gameSpeed() {
  console.log('1배속!');
  speedMultiple = 1;
  document.body.removeChild(doubleSpeedButton);
  document.body.appendChild(speedButton);
  clearInterval(intervalId);
  intervalId = setInterval(spawnMonster, monsterSpawnInterval);
}

function gameDoubleSpeed() {
  console.log('2배속!');
  speedMultiple = 2;
  document.body.removeChild(speedButton);
  document.body.appendChild(doubleSpeedButton);
  clearInterval(intervalId);
  intervalId = setInterval(spawnMonster, monsterSpawnInterval / speedMultiple);
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  new Promise((resolve) => (towerImage.onload = resolve)),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  /* 서버 접속 코드 (여기도 완성해주세요!) */

  serverSocket = io('http://qkqhajdcjddl.shop:5555', {
    query: {
      clientVersion: CLIENT_VERSION,
    },
    auth: {
      token: accessToken, // 토큰이 저장된 어딘가에서 가져와야 합니다!
    },
  });
  let userId = null;
  serverSocket.on('connection', (data) => {
    console.log('connection: ', data);
    userId = data.uuid;
    sendEvent(2, { message: '잘좀돼라' });
  });

  serverSocket.on('response', (data) => {
    console.log(data);
  });

  sendEvent = (handlerId, payload) => {
    serverSocket.emit('event', {
      userId,
      clientVersion: CLIENT_VERSION,
      handlerId,
      payload,
    });
  };

  serverSocket.on('connect', () => {
    console.log('서버와 연결됨');
    serverSocket.emit('requestUserGold');
  });

  serverSocket.on('disconnect', () => {
    console.log('서버와 연결이 종료됨');
  });
  serverSocket.on('gameStart', (data) => {
    console.log('게임 시작');
    stage = data.stage;
  });
  serverSocket.on('gameEnd', (data) => {
    console.log('게임 종료 점수:', data.score);
  });
  serverSocket.on('message', (data) => {
    console.log('서버가 보낸 메세지:', data);
  });
  serverSocket.on('initialTower', (data) => {
    console.log('최초타워 3개 지급!');
    numOfInitialTowers = data.numOfInitialTowers;
  });

  /* 
    서버의 이벤트들을 받는 코드들은 여기다가 쭉 작성해주시면 됩니다! 
    e.g. serverSocket.on("...", () => {...});
    이 때, 상태 동기화 이벤트의 경우에 아래의 코드를 마지막에 넣어주세요! 최초의 상태 동기화 이후에 게임을 초기화해야 하기 때문입니다! 
    if (!isInitGame) {
      initGame();
    }
  */

  serverSocket.on('userGold', (data) => {
    console.log('Received userGold event with data:', data);
    userGold = data.userGold;
    console.log('User Gold:', userGold);
  });

  // 상태 동기화 이벤트 처리
  serverSocket.on('syncGameState', (data) => {
    console.log('게임 상태 동기화 완료!');
    towerCost = data.towerCost;
    monsterLevel = data.monsterLevel;
    monsterSpawnInterval = data.monsterSpawnInterval;
    // 상태를 반영하여 게임 초기화
    if (!isInitGame) {
      initGame();
    }
  });

  //몬스터 처치 이벤트처리
  serverSocket.on('killMonster', (data) => {
    console.log('몬스터 처치');
    score += data.score;
    userGold += data.gold;
  });

  //보스 처치 이벤트처리
  serverSocket.on('killBoss', (data) => {
    console.log('보스 몬스터 처치');
    score += data.score;
    userGold += data.gold;
  });

  //스테이지 레벨 증가 이벤트 처리
  serverSocket.on('NewStage', (data) => {
    monsterLevel = data.monsterLevel;
    currentStage = data.stage;
    console.log('몬스터 레벨 증가', currentStage);
  });

  //보스 소환 이벤트 처리
  serverSocket.on('spawnBoss', (data) => {
    spawnBoss = data.spawnBoss;
    console.log('보스가 나타났다!');
  });
});

export { sendEvent };

//타워 구입 버튼
const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

//게임 정지 버튼
const pauseButton = document.createElement('button');
pauseButton.textContent = '||';
pauseButton.style.position = 'absolute';
pauseButton.style.top = '10px';
pauseButton.style.right = '130px';
pauseButton.style.padding = '11px 20px';
pauseButton.style.fontSize = '16px';
pauseButton.style.cursor = 'pointer';

pauseButton.addEventListener('click', pauseGame);

//게임 재개 버튼
const replayButton = document.createElement('button');
replayButton.textContent = '▶';
replayButton.style.position = 'absolute';
replayButton.style.top = '10px';
replayButton.style.right = '130px';
replayButton.style.padding = '10px 16px';
replayButton.style.fontSize = '16px';
replayButton.style.cursor = 'pointer';

replayButton.addEventListener('click', replayGame);

document.body.appendChild(pauseButton);

//게임 1배속 버튼
const speedButton = document.createElement('button');
speedButton.textContent = '1x';
speedButton.style.position = 'absolute';
speedButton.style.top = '10px';
speedButton.style.right = '200px';
speedButton.style.padding = '11px 16px';
speedButton.style.fontSize = '16px';
speedButton.style.cursor = 'pointer';

speedButton.addEventListener('click', gameDoubleSpeed);

//게임 2배속 버튼
const doubleSpeedButton = document.createElement('button');
doubleSpeedButton.textContent = '2x';
doubleSpeedButton.style.position = 'absolute';
doubleSpeedButton.style.top = '10px';
doubleSpeedButton.style.right = '200px';
doubleSpeedButton.style.padding = '11px 16px';
doubleSpeedButton.style.fontSize = '16px';
doubleSpeedButton.style.cursor = 'pointer';

doubleSpeedButton.addEventListener('click', gameSpeed);

document.body.appendChild(speedButton);

//게임오버 시 나오는 스크린 함수
function gameOverScreen() {
  const gameOverElement = document.createElement('div');
  gameOverElement.style.position = 'absolute';
  gameOverElement.style.width = '100%';
  gameOverElement.style.height = '100%';
  gameOverElement.style.backgroundImage = 'url("../images/gameOver.png")';
  gameOverElement.style.backgroundSize = 'cover'; //배경이미지 화면과 같이 설정
  gameOverElement.style.fontSize = '40px';
  gameOverElement.style.display = 'flex';
  gameOverElement.style.justifyContent = 'center';
  gameOverElement.style.alignItems = 'center';
  gameOverElement.innerHTML = `
  <div style="text-align: center;"> 
  <h2 style="color: red";>Game Over</h2> 
  <h3 style="color: red";>스파르타 본부를 지키지 못했습니다...</h3> 
  <button id="restartButton" style="padding: 10px 20px; font-size: 24px; cursor: pointer;">게임 다시 시작</button> </div> `;

  gameOverElement.querySelector('#restartButton').addEventListener('click', gameRestart);

  // body에 gameOverElement 추가
  document.body.appendChild(gameOverElement);
}

function gameRestart() {
  location.reload();
}

// 최고 기록 점수 가져오기 (현재는 게임 시작할 때만 가져옴)
fetch('http://qkqhajdcjddl.shop:5555/auth/highScore', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer ' + accessToken,
  },
})
  .then((response) => response.json())
  .then((data) => {
    highScore = +data.highScore;
    highScoreAll = +data.highScoreAll.highScore;
    highScoreMan = data.highScoreAll.userId;
    initGame();
  })
  .catch((error) => {
    console.error('최고 점수 가져오기 실패', error);
  });
