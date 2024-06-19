const userGold ={};

export const getUserGold=(uuid)=>{
    return userGold[uuid] || (userGold[uuid] = 100);
}

export const updateUserGold=(uuid,amount)=>{
    userGold[uuid] = amount;
}