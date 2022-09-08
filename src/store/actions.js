import * as types from './types';

export const setMessages = (message) => ({
  type: types.SET_MESSAGES,
  message,
});

export const setShowOption = (value) => ({
  type: types.SET_SHOW_OPTIONS_SCREEN,
  value,
});

export const setCurrentWord = (word) => ({
  type: types.SET_CURRENT_WORD,
  word,
});

export const setScore = (score) => ({
  type: types.SET_SCORE,
  score,
});

export const reset = () => ({
  type: types.RESET,
});

export const setCurrentRound = (round) => ({
  type: types.SET_CURRENT_ROUND,
  round,
});

export const setTimeOver = (isTimeOver) => ({
  type: types.SET_TIME_OVER,
  isTimeOver,
});

export const setDrawingMode = (isDrawing) => ({
  type: types.SET_DRAWING_MODE,
  isDrawing,
});

export const setCurrentPlayer = (player) => ({
  type: types.SET_CURRENT_PLAYER,
  player,
});

export const setOptions = (options) => ({
  type: types.SET_OPTIONS,
  options,
});

export const saveGameSettings = (rounds, drawTime) => ({
  type: types.SAVE_GAME_SETTINGS,
  rounds,
  drawTime,
});

export const setRoomId = (roomId) => ({
  type: types.SET_ROOM_ID,
  roomId,
});

export const setName = (name) => ({
  type: types.SET_NAME,
  name,
});

export const setPlayers = (players) => ({
  type: types.SET_PLAYERS,
  players,
});
