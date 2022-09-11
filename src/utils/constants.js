import avatar1 from '../assets/icons/robot_1.png';
import avatar2 from '../assets/icons/robot_2.png';
import avatar3 from '../assets/icons/robot_3.png';
import avatar4 from '../assets/icons/robot_4.png';
import avatar5 from '../assets/icons/robot_5.png';
import avatar6 from '../assets/icons/robot_6.png';
import react from '../assets/icons/react.png';
import js from '../assets/icons/js.png';
import node from '../assets/icons/node.png';
import socket from '../assets/icons/socket.svg';
import mongoDB from '../assets/icons/mongoDB.png';
import express from '../assets/icons/express.png';

export const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

export const technologies = [
  { img: react, name: 'React', link: 'https://reactjs.org/' },
  { img: js, name: 'JavaScript', link: 'https://www.javascript.com/' },
  { img: node, name: 'NodeJs', link: 'https://nodejs.org/en/about/' },
  { img: socket, name: 'Socket.io', link: 'https://socket.io/' },
  { img: mongoDB, name: 'MongoDB', link: 'https://www.mongodb.com/' },
  { img: express, name: 'Express', link: 'https://expressjs.com/' },
];

export const colors = [
  'white',
  'black',
  'grey',
  'red',
  'orange',
  'yellow',
  'green',
  'lime',
  '#009494',
  'blue',
  'olive',
  'dodgerblue',
  'purple',
  '#f90151',
  'violet',
  '#b34b20',
];

export const penSizes = [5, 15, 25, 35];

export const drawTimes = [60, 70, 80, 90, 100, 110, 120];

export const deviceNotSupportedMessage =
  'This site is best supported in laptop or desktop. Some functionalities may not work in your device.';

export const errorMessages = {
  error_boundary: {
    title: 'Something went wrong',
    message: 'The app has faced an internal error. Please reload the page and try again.',
  },
  server_error: {
    title: 'Internal Server Error',
    message:
      'The server has faced an internal error and is unable to process your request at this moment. Please reload the page and try again.',
  },
};

export const howToPlayTexts = [
  'Create a room.',
  'Share the room id with you friends and ask them to join the room with the same id.',
  'Once everyone joined, configure the game settings and start the game.',
  'One user will choose a word from 3 options.',
  'Next, the user will draw a sketch about the chosen word.',
  'At the same time, the other users would guess the choosen word from the drawing.',
  'Type your guess in the chat window.',
  'Users have to draw or guess within the given time window. Once the time is up, result will be shown and the next user in line would get to choose the word. And this continues until all rounds are over.',
];
