
const userGold = {}; 

export const createUserGold = (uuid) => {
  userGold[uuid] = 5000; // Set initial gold to 5000
  console.log(userGold[uuid]); // Log initial gold amount (optional)
};

// Function to retrieve user's current gold amount
export const getUserGold = (uuid) => {
  return userGold[uuid]; 
};

// Function to update user's gold amount
export const updateUserGold = (uuid, amount) => {
  userGold[uuid] = amount; // Update user's gold amount
};