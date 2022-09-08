import * as types from './types';

const initialState = {
  name: '',
  roomId: null,
  rounds: 0,
  currentRound: 1,
  drawTime: 0,
  players: [],
  currentPlayer: {},
  currentWord: null,
  isDrawing: false,
  isTimeOver: false,
  options: [],
  showOptionsScreen: false,
  score: {},
  messages: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_ROOM_ID:
      return {
        ...state,
        roomId: action.roomId,
      };
    case types.SET_NAME:
      return {
        ...state,
        name: action.name,
      };
    case types.SET_PLAYERS:
      return {
        ...state,
        players: action.players,
      };
    case types.SAVE_GAME_SETTINGS:
      return {
        ...state,
        rounds: action.rounds,
        drawTime: action.drawTime,
      };
    case types.SET_CURRENT_PLAYER:
      return {
        ...state,
        currentPlayer: action.player,
      };
    case types.SET_OPTIONS:
      return {
        ...state,
        options: action.options,
      };
    case types.SET_SHOW_OPTIONS_SCREEN:
      return {
        ...state,
        showOptionsScreen: action.value,
      };
    case types.SET_CURRENT_WORD:
      return {
        ...state,
        currentWord: action.word,
      };
    case types.SET_DRAWING_MODE:
      return {
        ...state,
        isDrawing: action.isDrawing,
      };
    case types.SET_TIME_OVER:
      return {
        ...state,
        isTimeOver: action.isTimeOver,
        isDrawing: false,
      };
    case types.SET_CURRENT_ROUND:
      return {
        ...state,
        currentRound: action.round,
      };
    case types.SET_SCORE:
      return {
        ...state,
        score: action.score,
      };
    case types.SET_MESSAGES:
      return {
        ...state,
        messages: [...state.messages, action.message],
      };

    case types.RESET:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
