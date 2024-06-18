import { getGameAssets } from "../init/assets.js";
import {prisma} from '../utils/prisma/index.js';
import { getUserGold, updateUserGold } from '../modules/user-gold.module.js';


export const purchaseTower = (userId, payload)=>{
    const {tower} = getGameAssets();

        //유저의 골드 확인
        const userGold = getUserGold(userId);
        
        //타워 정보 확인
        const towerData = tower.data.find(data =>data.tower_id===payload.tower_id);
        if(!towerData){
            return{status:'fail', message: 'Invalid tower ID'};
        }
        //타워 가격 확인
        const towerCost = towerData.tower_cost;
        
        //if cost can cover tower price (cost - price)
        if(userGold >= towerCost){
            updateUserGold(userId,userGold-towerCost);
            return{status:'success', message:'타워 구매 완료'};
        } else {
            const neededGold = towerCost - userGold;
            return{status:'fail', message:`골드가 부족합니다. ${neededGold} 더 필요합니다.`}
        };

    };
