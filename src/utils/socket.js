import { io } from 'socket.io-client';

let socket;
const SOCKET_SERVER =
  process.env.NODE_ENV === 'production'
    ? 'https://scribble-server.herokuapp.com/'
    : 'http://localhost:8080';

export const initSocket = () => {
  socket = io(SOCKET_SERVER, {
    closeOnBeforeunload: false,
  });
};

export const getSocket = () => {
  return socket;
};
