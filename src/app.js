import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import userRouter from './routes/user.router.js';
import { loadGameAssets } from './init/assets.js';
import cors from 'cors'; 
import dotEnv from 'dotenv';


const app = express();
const PORT = 5555;
const server = createServer(app);

// 특정 도메인만 허용하는 CORS 설정
const corsOptions = {
  origin: '*', // 허용하고자 하는 도메인
  allowedHeaders: ["Authorization"], // JWT
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // CORS 미들웨어 사용


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('tower_defence_client'));

initSocket(server);

app.use('/auth', [userRouter])


server.listen(PORT, async () => {
  try {
    const assets = await loadGameAssets();
    // console.log(assets);
    console.log('Assets loaded successfully');
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
});