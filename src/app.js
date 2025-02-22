import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import userRouter from './routes/user.router.js';
import cors from 'cors'; 
import dotEnv from 'dotenv';
import highScoreRouter  from './routes/highScore.router.js';

const app = express();
const PORT = 5555;
const server = createServer(app);

// 특정 도메인만 허용하는 CORS 설정
const corsOptions = {
  origin: '*', // 허용하고자 하는 도메인
  allowedHeaders: ["Content-type","Authorization"], // JWT
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // CORS 미들웨어 사용

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('tower_defence_client'));

app.use('/auth', [userRouter]);
app.use('/auth', [userRouter,highScoreRouter])
initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)

  try {
    const assets = await loadGameAssets();
    //console.log(assets);
    console.log('Assets loaded successfully');
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
});
