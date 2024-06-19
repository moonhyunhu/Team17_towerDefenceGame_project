const userTowers = {};

// 유저 타워 목록에 타워 추가
export const addUserTower = (uuid, tower) => {
    if (!userTowers[uuid]) {
        userTowers[uuid] = [];
    }
    userTowers[uuid].push(tower);
};

// 유저의 타워 목록을 가져오는 함수
export const getUserTowers = (uuid, ) => {
    return userTowers[uuid] || [];
};
