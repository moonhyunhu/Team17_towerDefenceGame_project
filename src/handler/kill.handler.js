import { getUserGold, updateUserGold } from "../models/user-gold.model.js"

export const killMonster = (userId,payload,socket) =>{
    const userGold = getUserGold(userId);
    const changeUserGold = userGold + payload.killMonsterGold;
    updateUserGold(userId, changeUserGold)

    socket.emit('killMonster',{
        userId,
        score:payload.killMonsterScore,
        gold:payload.killMonsterGold,

    })
}