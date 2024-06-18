const socket = io('http://localhost:5555');

socket.on('connection', (data) => {
    console.log('connection: ', data);
})