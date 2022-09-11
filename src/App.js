import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Draw from './screens/draw/draw';
import Home from './screens/home/home';
import Lobby from './screens/lobby/lobby';
import {
  saveGameSettings,
  setCurrentPlayer,
  setCurrentRound,
  setCurrentWord,
  setDrawingMode,
  setMessages,
  setOptions,
  setPlayers,
  setScore,
  setShowOption,
  setTimeOver,
} from './store/actions';
import { useSocket } from './utils/useSocket';
import ErrorBoundary from './components/ErrorBoundary/errorBoundary';
import { deviceNotSupportedMessage, errorMessages } from './utils/constants';
import playerJoinedSound from './assets/sounds/player_joined.mp3';
import gameStartedSound from './assets/sounds/start_game.mp3';
import './App.scss';

let firstRender = true;

function App() {
  const roomId = useSelector((state) => state.roomId);
  const { socketId, listen, removeListener } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [appError, setAppError] = useState();
  const audiosRef = useRef({
    playerJoined: new Audio(playerJoinedSound),
    gameStarted: new Audio(gameStartedSound),
  });
  const locationRef = useRef(); // to access latest location inside callback
  const socketIdRef = useRef();
  locationRef.current = useLocation();
  socketIdRef.current = socketId;

  useEffect(() => {
    if (firstRender && window.innerWidth < 800) {
      alert(deviceNotSupportedMessage);
      firstRender = false;
    }

    Object.values(audiosRef.current).forEach((audio) => audio.load());
    const handler = (e) => {
      if (locationRef.current.pathname !== '/') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listen('player-joined', playerJoinedHandler);
    listen('game-started', gameStartedHandler);
    listen('joined-ongoing-game', joinedOngoingGameHandler);
    listen('current-player', currentPlayerHandler);
    listen('user-left', userLeftHandler);
    listen('server-error', serverErrorHandler);

    return () =>
      removeListener(
        'player-joined',
        'game-started',
        'joined-ongoing-game',
        'current-player',
        'user-left',
        'server-error',
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playerJoinedHandler = (allPlayers, name, isGameStarted) => {
    audiosRef.current.playerJoined.play();
    dispatch(setPlayers(allPlayers));
    if (isGameStarted) {
      addMessage(`${name} joined`);
    }
  };

  const gameStartedHandler = (rounds, drawTime) => {
    dispatch(saveGameSettings(rounds, drawTime));
    playGameStartSound();
    navigate('/play', { replace: true });
  };

  const joinedOngoingGameHandler = ({
    rounds,
    drawTime,
    currentRound,
    currentWord,
    currrentPlayer,
    score,
    isDrawing,
    currentOptions,
  }) => {
    dispatch(saveGameSettings(rounds, drawTime));
    if (isDrawing) {
      dispatch(setDrawingMode(true));
      addMessage(`${currrentPlayer.name} is drawing`);
    } else {
      if (currrentPlayer.id !== socketIdRef.current) dispatch(setOptions(currentOptions));
      dispatch(setShowOption(true));
    }
    const theWord =
      currrentPlayer.id !== socketIdRef.current
        ? currentWord
            .split(' ')
            .map((v) => v.replace(/[a-z|A-Z]/g, '_'))
            .join(' ')
        : currentWord;
    dispatch(setCurrentWord(theWord));
    dispatch(setCurrentRound(currentRound));
    dispatch(setCurrentPlayer(currrentPlayer));
    dispatch(setScore(score));
    navigate('/play');
  };

  const currentPlayerHandler = (player, options) => {
    dispatch(setCurrentPlayer(player));
    dispatch(setTimeOver(false));
    if (player.id === socketIdRef.current) dispatch(setOptions(options));
    dispatch(setShowOption(true));
  };

  const userLeftHandler = (name, players, score, hasGameStarted) => {
    dispatch(setPlayers(players));
    dispatch(setScore(score));
    if (hasGameStarted) addMessage(`${name} left the game`);
  };

  const serverErrorHandler = (e) => {
    setAppError(errorMessages.server_error);
    console.error(e);
  };

  const addMessage = (message) => {
    dispatch(
      setMessages({
        id: Math.random().toString().slice(2),
        message,
        system: true,
      }),
    );
  };

  const playGameStartSound = () => {
    audiosRef.current.gameStarted.play();
  };

  const errorModalClose = () => {
    setAppError();
    navigate('/');
    setTimeout(() => window.location.reload(), 1);
  };

  return (
    <div className="app">
      <ErrorBoundary
        appError={appError}
        setAppError={setAppError}
        click={errorModalClose}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          {roomId && (
            <>
              <Route
                path="/lobby"
                element={<Lobby playGameStartSound={playGameStartSound} />}
              />
              <Route path="/play" element={<Draw />} />
            </>
          )}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
