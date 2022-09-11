import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useSocket } from '../../utils/useSocket';
import { colors, penSizes } from '../../utils/constants';
import {
  reset,
  setCurrentRound,
  setCurrentWord,
  setDrawingMode,
  setMessages,
  setScore,
  setShowOption,
  setTimeOver,
} from '../../store/actions';

import Options from '../../components/options/options';
import Header from '../../components/header/header';
import Chats from '../../components/chats/chats';
import Players from '../../components/players/players';
import Controls from '../../components/controls/controls';
import Logo from '../../components/Logo/Logo';
import drawingStartSound from '../../assets/sounds/drawing_start.mp3';
import guessedSound from '../../assets/sounds/guessed.mp3';
import clockSound from '../../assets/sounds/clock.mp3';
import timeOverSound from '../../assets/sounds/time_over.mp3';
import gameOverSound from '../../assets/sounds/game_over.mp3';
import './draw.scss';

let canvas;
let ctx;
let drawing;

const Draw = () => {
  const {
    roomId,
    players,
    currentPlayer,
    rounds,
    currentRound,
    isDrawing,
    drawTime,
    options,
    isTimeOver,
    score,
    currentWord,
    showOptionsScreen,
    messages,
  } = useSelector((state) => state);
  const { emit, listen, removeListener, socketId } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [penColor, setPenColor] = useState('black');
  const [penSize, setPenSize] = useState(penSizes[0]);
  const [erase, setErase] = useState(false);
  const [time, setTime] = useState(-1);

  const [showRound, setShowRound] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [guessed, setGuessed] = useState(false);

  const audiosRef = useRef({
    drawingStart: new Audio(drawingStartSound),
    guessed: new Audio(guessedSound),
    clock: new Audio(clockSound),
    timeOver: new Audio(timeOverSound),
    gameOver: new Audio(gameOverSound),
  });
  const timerRef = useRef();
  const hintRef = useRef();
  const eraseRef = useRef();
  const penColorRef = useRef();
  const penSizeRef = useRef();
  const currentPlayerRef = useRef();
  const isCurrentUserDrawingRef = useRef();
  const isSmallDeviceRef = useRef(window.innerWidth < 800);

  // HACK for using latest state inside callback
  eraseRef.current = erase;
  penColorRef.current = penColor;
  penSizeRef.current = penSize;
  currentPlayerRef.current = currentPlayer.name;
  isCurrentUserDrawingRef.current = currentPlayer.id === socketId;

  useEffect(() => {
    Object.values(audiosRef.current).forEach((audio) => audio.load());
    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');
    const pointer = document.querySelector('.pointer');
    if (pointer) {
      const { left, top } = canvas.getBoundingClientRect();
      pointer.style.left = left + canvas.width / 2 + 'px';
      pointer.style.top = top + canvas.height / 2 + 'px';
    }
  }, []);

  useEffect(() => {
    // Socket listeners
    listen('drawing-started', drawingStarted);
    listen('drawing-over', drawingOver);
    listen('round-over', roundOver);
    listen('game-over', gameOverHandler);
    listen('received-message', receivedMessage);

    listen('mousedown', mousedown);
    listen('mouseup', mouseup);
    listen('mousemove', mousemove);
    listen('erase', setErase);
    listen('clear', clearBoard);
    listen('select-color', setPenColor);
    listen('select-brush', setPenSize);

    return () => {
      removeListener(
        'drawing-started',
        'drawing-over',
        'round-over',
        'game-over',
        'mousedown',
        'mouseup',
        'erase',
        'clear',
        'select-color',
        'select-brush',
        'received-message',
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const elem = document.getElementById('canvas-container');
    // Event listeners
    elem?.addEventListener('mousedown', mousedown);
    elem?.addEventListener('mouseup', mouseup);
    elem?.addEventListener('mousemove', mousemove);
    elem?.addEventListener('touchstart', mousedown);
    elem?.addEventListener('touchend', mouseup);
    elem?.addEventListener('touchmove', mousemove);

    return () => {
      elem?.removeEventListener('mousemove', mousemove);
      elem?.removeEventListener('mouseup', mouseup);
      elem?.removeEventListener('mousedown', mousedown);
      elem?.removeEventListener('touchstart', mousedown);
      elem?.removeEventListener('touchend', mouseup);
      elem?.removeEventListener('touchmove', mousemove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = (clientX, clientY) => {
    if (!drawing) return;
    if (!eraseRef.current) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColorRef.current;
      ctx.lineWidth = penSizeRef.current;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penSizeRef.current + 5;
    }
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.lineTo(clientX, clientY);
    ctx.stroke();
  };

  const mousedown = ({ clientX, clientY, type, touches }) => {
    if (type && !isCurrentUserDrawingRef.current) return;
    drawing = true;
    ctx.beginPath();
    let x = type && isSmallDeviceRef.current ? touches?.[0]?.clientX : clientX;
    let y = type && isSmallDeviceRef.current ? touches?.[0]?.clientY : clientY;
    const rect = canvas.getBoundingClientRect();
    if (type) {
      let _x = (x -= rect.left);
      let _y = (y -= rect.top);
      if (isSmallDeviceRef.current) {
        _x *= 2;
        _y *= 2;
      }
      emit('mousedown', roomId, _x, _y);
    } else if (isSmallDeviceRef.current) {
      x /= 2;
      y /= 2;
    }

    draw(x, y);
  };

  const mouseup = (e) => {
    if (e && !isCurrentUserDrawingRef.current) return;
    drawing = false;
    ctx.closePath();
    if (e) emit('mouseup', roomId);
  };

  const mousemove = ({ clientX, clientY, type, touches }) => {
    if (type && !isCurrentUserDrawingRef.current) return;
    let x = type && isSmallDeviceRef.current ? touches?.[0]?.clientX : clientX;
    let y = type && isSmallDeviceRef.current ? touches?.[0]?.clientY : clientY;
    const { left, top } = canvas.getBoundingClientRect();
    const pointer = document.querySelector('.pointer');

    if (type) {
      let _x = (x -= left);
      let _y = (y -= top);
      if (isSmallDeviceRef.current) {
        _x *= 2;
        _y *= 2;
      }
      if (drawing) emit('mousemove', roomId, _x, _y);
    } else if (isSmallDeviceRef.current) {
      x /= 2;
      y /= 2;
    }

    if (pointer) {
      if (y < 0 || y > canvas.height || x < 0 || x > canvas.width) {
        pointer.style.display = 'none';
      } else {
        pointer.style.display = 'block';
      }
      const penRadius = penSizeRef.current / 2;
      pointer.style.left = x - penRadius + 'px';
      pointer.style.top = y - penRadius + 'px';
    }
    draw(x, y);
  };

  const clearBoard = useCallback(
    (e) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (e) emit('clear', roomId);
    },
    [emit, roomId],
  );

  const drawingStarted = (word) => {
    audiosRef.current.drawingStart.play();
    dispatch(setDrawingMode(true));
    receivedMessage({
      id: Math.random().toString().slice(2),
      message: `${currentPlayerRef.current} is drawing`,
      system: true,
    });
    const theWord = !isCurrentUserDrawingRef.current
      ? word
          .split(' ')
          .map((v) => v.replace(/[a-z|A-Z]/g, '_'))
          .join(' ')
      : word;
    dispatch(setCurrentWord(theWord));
    if (!isCurrentUserDrawingRef.current) {
      hintRef.current = setTimeout(() => {
        const str = word
          .split(' ')
          .map((v) => {
            const strArr = v.split('').fill('_');
            const mid = ~~(v.length / 2);
            strArr[mid] = v[mid];
            return strArr.join('');
          })
          .join(' ');
        dispatch(setCurrentWord(str));
      }, 15000);
    }

    dispatch(setShowOption(false));
    setTime(drawTime);
    timerRef.current = setInterval(() => {
      setTime((lastTime) => {
        if (lastTime === 15) audiosRef.current.clock.play();
        if (lastTime === 0) {
          clearInterval(timerRef.current);
        }
        return lastTime - 1;
      });
    }, 1000);
  };

  const drawingOver = (word, result) => {
    audiosRef.current.clock.pause();
    audiosRef.current.clock.load();
    audiosRef.current.timeOver.play();
    drawing = false;
    setPenColor('black');
    setPenSize(penSizes[0]);
    setErase(false);
    setGuessed(false);
    clearInterval(timerRef.current);
    clearInterval(hintRef.current);
    setTime(-1);
    dispatch(setShowOption(true));
    dispatch(setTimeOver(true));
    dispatch(setScore(result));

    if (!isCurrentUserDrawingRef.current) dispatch(setCurrentWord(word));
    setTimeout(() => {
      dispatch(setShowOption(false));
      clearBoard();
    }, 4000);
  };

  const roundOver = (round) => {
    dispatch(setCurrentRound(round));
    dispatch(setShowOption(true));
    setShowRound(true);
    setTimeout(() => {
      setShowRound(false);
      dispatch(setShowOption(false));
    }, 3000);
  };

  const gameOverHandler = () => {
    audiosRef.current.clock.pause();
    audiosRef.current.clock.load();
    audiosRef.current.gameOver.play();
    dispatch(setShowOption(true));
    setGameOver(true);
    clearInterval(timerRef.current);
    setTime(-1);
    setTimeout(() => {
      dispatch(reset());
      navigate('/');
    }, 8000);
  };

  const receivedMessage = async (message) => {
    if (message.senderId === socketId && message.guessed) {
      audiosRef.current.guessed.play();
      // await new Promise((r) => setTimeout(() => r(), 300));
      setGuessed(true);
    }
    dispatch(setMessages(message));
  };

  return (
    <div className="draw-container d-flex">
      <Logo width={160} />
      <Header
        rounds={rounds}
        currentRound={currentRound}
        currentWord={currentWord}
        time={time}
        totalTime={drawTime}
        isCurrentUserDrawing={isCurrentUserDrawingRef.current}
      />
      <div className="d-flex container">
        <Players roomId={roomId} players={players} score={score} />
        <div style={{ position: 'relative' }}>
          {showOptionsScreen && currentPlayer.id && (
            <Options
              word={currentWord}
              showRound={showRound}
              gameOver={gameOver}
              currentPlayer={currentPlayer}
              currentRound={currentRound}
              options={options}
              roomId={roomId}
              isTimeOver={isTimeOver}
              players={players}
              score={score}
            />
          )}
          <div
            id="canvas-container"
            style={{
              cursor: !isCurrentUserDrawingRef.current ? 'default' : 'none',
            }}
          >
            <canvas
              id="canvas"
              width={isSmallDeviceRef.current ? 315 : 630}
              height={isSmallDeviceRef.current ? 230 : 460}
            ></canvas>
            {isCurrentUserDrawingRef.current && (
              <div
                className="pointer"
                style={{ width: `${penSize}px`, height: `${penSize}px` }}
              ></div>
            )}
          </div>
          {isCurrentUserDrawingRef.current && (
            <Controls
              roomId={roomId}
              colors={colors}
              penSizes={penSizes}
              penColor={penColor}
              penSize={penSize}
              erase={erase}
              setPenColor={setPenColor}
              setPenSize={setPenSize}
              clearBoard={clearBoard}
              setErase={setErase}
            />
          )}
        </div>
        <Chats
          roomId={roomId}
          messages={messages}
          mySocketId={socketId}
          time={time}
          guessed={guessed}
          isDrawing={isDrawing}
          isCurrentUserDrawing={isCurrentUserDrawingRef.current}
        />
      </div>
    </div>
  );
};

export default memo(Draw);
