import { CLIENT_VERSION } from './Constants.js';

const socket = io('http://localhost:5555', {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
const sendEvent = (handlerId, payload) => {
  socket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent };