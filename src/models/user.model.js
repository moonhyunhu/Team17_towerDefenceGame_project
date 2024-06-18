import {prisma} from '../utils/prisma/index.js'

// prisma 사용으로 인해 로직 변경을 위한 회의 필요!
const users = [];

export const addUser = async (user) => {
  users.push(user);
};

export const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = () => {
    return users;
}