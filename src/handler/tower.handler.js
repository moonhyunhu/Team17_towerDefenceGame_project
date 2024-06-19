import { getGameAssets } from "../init/assets.js";
import { getUserGold, updateUserGold } from '../modules/user-gold.module.js';
import { addUserTower } from '../models/user-towers.model.js';

export const purchaseTower = (userId, payload) => {
    const { tower } = getGameAssets();

    // 유저의 골드 확인 
    const userGold = getUserGold(userId);
    
    // 타워 정보 확인
    const towerData = tower.data.find(data => data.tower_id === payload.tower_id);
    if (!towerData) {
        return { status: 'fail', message: 'Invalid tower ID' };
    }
    
    // 타워 가격 확인
    const towerCost = towerData.tower_cost;
    
    // 유저 골드가 충분한지 확인
    if (userGold >= towerCost) {
        updateUserGold(userId, userGold-towerCost);
        
        const { x, y } = payload.position; 
        
        // 유저의 타워 목록에 타워 추가
        addUserTower(userId, {
            towerId: payload.tower_id,
            x: payload.position.x,
            y: payload.position.y
        });        
        return {
            status: 'success',
            message: '타워 구매 완료입니다.',
            position: { x: payload.position.x, y: payload.position.y }
        };
    } else {
        const neededGold = towerCost - userGold;
        return { status: 'fail', message: `골드가 부족합니다. ${neededGold} 더 필요합니다.` };
    }
};
