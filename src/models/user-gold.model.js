
const userGold = {}; // Object to store user gold amounts

// Function to initialize user's gold to 5000
export const createUserGold = (uuid) => {
  userGold[uuid] = 5000; // Set initial gold to 5000
  console.log(userGold[uuid]); // Log initial gold amount (optional)
};

// Function to retrieve user's current gold amount
export const getUserGold = (uuid) => {
  console.log('유저골드 모델' ,uuid)
  console.log(userGold);
  console.log('이야앙', userGold[uuid])
  return userGold[uuid]; 
};

// Function to update user's gold amount
export const updateUserGold = (uuid, amount) => {
  userGold[uuid] = amount; // Update user's gold amount
};