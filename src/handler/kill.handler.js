export const killMonster = (userId,payload,socket) =>{
    const {killMonsterInfo} = payload
    socket.emit('killMonster',{

    })
}