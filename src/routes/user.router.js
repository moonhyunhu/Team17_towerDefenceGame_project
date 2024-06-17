import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js'; // prisma에서 user데이터 가져오기
import { hashPassword, comparePassword } from '../utils/hash.js';

const router = express.Router();

//회원가입 API
router.post('/sign-up' ,async(req,res,next)=>{

  return 0;
})

//로그인 API
router.get('/login', async(req,res,next)=>{

  return 0;
})


export default router;
