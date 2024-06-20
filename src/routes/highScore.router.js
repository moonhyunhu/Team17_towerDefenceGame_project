import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';
dotEnv.config();


const router = express.Router();

//** 최고점수 갱신 API **/
router.post('/highScore' , async (req,res,next)=>{
    try{
    const {score} =req.body;

    const bearerToken = req.headers.authorization;
    //bearer토큰 없애기
    const token = bearerToken.split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY); // 토큰을 해석하고 검증
    const userId = decoded.userId; // 요청 객체에 userId 저장

    // userId가 존재하는지 확인
    if (!userId) {
      return res.status(400).json({ message: 'userId가 없습니다.' });
    }
    const highScoreRecord = await prisma.highScoreRecord.findUnique({
        where: { userId: userId },
        });
  //user가 첫번째 score일 경우
    if (!highScoreRecord) {
            const record = await prisma.highScoreRecord.create({
                data: { highScoreRecord: score, userId: userId },
            });
            res.json({ message: '최고 점수 생성 및 갱신' , highScore: record.highScoreRecord});
            return;
          }
    //최고점수보다 현재 스코어가 클 경우
    if (highScoreRecord && highScoreRecord.highScoreRecord < score) {
      // 기존 기록 업데이트
      const updatedRecord = await prisma.highScoreRecord.update({
        where: { userId: userId },
        data: { highScoreRecord: score },
      });
      res.json({ message: '최고 점수 갱신', highScore: updatedRecord.highScoreRecord });
    } else {
      // 현재 점수가 최고 점수보다 작거나 같으면 유지
      res.json({ message: '최고 점수 유지 중', highScore: highScoreRecord.highScoreRecord });
    }
    
}catch (error){
    console.log('최고점수 갱신 오류',error);
    next(error);
}
})

//** 최고점수 가져오기 API **/
router.get('/highScore', async (req, res, next) => {
    try {
      const bearerToken = req.headers.authorization;
  
      if (!bearerToken) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
      }
  
      const token = bearerToken.split(' ')[1];
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      const userId = decoded.userId;
  
      if (!userId) {
        return res.status(400).json({ message: 'userId가 없습니다.' });
      }
  
      const highScoreRecordPerson = await prisma.highScoreRecord.findUnique({
        where: { userId: userId },
      });
      const highScoreRecordAll = await prisma.highScoreRecord.findMany({
        orderBy: { highScoreRecord: 'desc' },
        take: 1, // 가장 높은 점수 하나만 가져오도록 설정
      })
      console.log(highScoreRecordAll);
      
      //예외 처리
      const highestScore = highScoreRecordAll.length > 0 ? highScoreRecordAll[0].highScoreRecord : 0;
      const highestScoreUser = highScoreRecordAll.length > 0 ? highScoreRecordAll[0].userId : 'none';
  
      res.json({
        highScore: highScoreRecordPerson ? highScoreRecordPerson.highScoreRecord : 0,
        highScoreAll: {
          highScore: highestScore,
          userId: highestScoreUser,
        },
      });
    } catch (error) {
      console.log('최고 점수 가져오기 오류', error);
      next(error);
    }
  });
  

export default router;