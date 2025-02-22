const users = [];

//유저 테이블 추가
export const addUser = (user) => {
  users.push(user);
};

//유저 지우기
export const removeUser = (uuid) => {
  const index = users.findIndex((user) => user.uuid === uuid);
  //index가 -1이면 이미 배열에 socketId가 없다는 뜻이므로 !사용
  if (index !== -1) {
    //1개 삭제
    return users.splice(index, 1)[0];
  }
};

//유저 조회
export const getUsers = () => {
  return users;
};

