const userGold ={};

export const getUserGold=(userId)=>{
    return userGold[userId]||0;
}

export const updateUserGold=(userId,amount)=>{
    userGold[userId] = amount;
}