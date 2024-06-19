
const socket = io('http://localhost:5555', {
//   query: {
//     clientVersion: CLIENT_VERSION,
//   },
});

let userId = null;

socket.on('response', (data) => {
  console.log(data);
});

socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
  console.log('클라 소켓.js', userId)
});


const sendEvent = (handlerId, payload) => {
  console.log('Sending payload to server:', payload); // Log payload being sent to server
  console.log('센드이벤트', userId)

    socket.emit('event', {
      userId,
    //   clientVersion: CLIENT_VERSION,
      handlerId,
      payload,
    });
  };



export { sendEvent};