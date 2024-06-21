const userMonsters = {};


// 서버 유저 몬스터 목록에 몬스터 추가
export const addUserMonster = (uuid, monster) => {
    if (!userMonsters[uuid]) {
        userMonsters[uuid] = [];
    }
    userMonsters[uuid].push(monster);
};

// 유저의 몬스터 목록을 가져오는 함수
export const getUserMonsters = (uuid) => {
    return userMonsters[uuid] || [];
};

export const removeMonster = (uuid,monster)=>{
    userMonsters[uuid].splice(monster, 1);
}
