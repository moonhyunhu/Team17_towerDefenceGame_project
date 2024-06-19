
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
});


const sendEvent = (handlerId, payload) => {
  console.log('Sending payload to server:', payload); // Log payload being sent to server

    socket.emit('event', {
      userId,
    //   clientVersion: CLIENT_VERSION,
      handlerId,
      payload,
    });
  };



export { sendEvent};