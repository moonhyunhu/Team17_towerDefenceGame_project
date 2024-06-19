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
      
    //최고점수보다 현재 스코어가 클 경우
    if(highScoreRecord < score){
        if (!highScoreRecord) {
            await prisma.highScoreRecord.create({
                data: { highScoreRecord: score, userId: userId },
            });
            res.json({ message: '최고 점수 생성 및 갱신' });
            return;
          }
        else{
        prisma.highScoreRecord.update({
            data: {high_score : score},
        })
        res.json({message: '최고 점수 갱신'});
    }}
}catch (error){
    console.log('최고점수 갱신 오류',error);
    next(error);
}
})


export default router;