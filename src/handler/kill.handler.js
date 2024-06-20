export const killMonster = (userId,payload,socket) =>{
    socket.emit('killMonster',{
        userId,
        score:payload.killMonsterScore,
        gold:payload.killMonsterGold,

    })
}