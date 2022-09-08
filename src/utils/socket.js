import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  socket = io('http://192.168.1.101:8080', {
    closeOnBeforeunload: false
  });
};

export const getSocket = () => {
  return socket;
};