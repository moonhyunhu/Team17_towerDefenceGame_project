import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma/index.js';
import io from '../init/socket.js';
import dotEnv from 'dotenv';

dotEnv.config();

const router = express.Router();

//* 로그인 API *//
router.post('/sign-in', async (req, res, next) => {
  const { userId, userPw } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { userId } });

    if (!user || !(await bcrypt.compare(userPw, user.userPw))) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.TOKEN_SECRET_KEY, {
      expiresIn: '1h',
    });
    console.log(token, userId);
    res.status(201).json({ accessToken: token ,userId: user.userId});
  } catch (error) {
    res.status(500).json({ message: '서버 오류' });
  }
});

//* 회원가입 API *//
router.post('/sign-up', async (req, res, next) => {
  const { userId, userPw } = req.body;

  try {
    // 데이터 존재 확인
    if (!userId || !userPw) {
      return res.status(400).json({ message: '데이터를 올바르게 입력해주세요.' });
    }

    // 아이디와 비밀번호 조건
    if (userId.length < 5 || userPw.length < 5) {
      return res.status(400).json({ message: '아이디와 비밀번호는 5자 이상으로 만들어주세요.' });
    }
    if (userId.length > 13 || userPw.length > 13) {
      return res.status(400).json({ message: '아이디와 비밀번호는 12자 이하로 만들어주세요.' });
    }

    // userId가 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({ where: { userId } });

    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(userPw, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        userId,
        userPw: hashedPassword,
      },
    });

    // 회원가입 성공 메시지 반환
    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.error('회원가입 에러:', error); 
    res.status(500).json({ message: '서버 오류' });
  }
});

export default router;
