import { useEffect, useRef, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useSocket } from '../../utils/useSocket';
import { colors, penSizes } from '../../utils/constants';
import {
  reset,
  setCurrentPlayer,
  setCurrentRound,
  setCurrentWord,
  setDrawingMode,
  setMessages,
  setOptions,
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
      const rect = canvas.getBoundingClientRect();
      pointer.style.left = rect.left + canvas.width / 2 + 'px';
      pointer.style.top = rect.top + canvas.height / 2 + 'px';
    }
  }, []);

  useEffect(() => {
    // Socket listeners
    listen('current-player', currentPlayerHandler);
    listen('drawing-started', drawingStarted);
    listen('drawing-over', drawingOver);
    listen('round-over', roundOver);
    listen('game-over', gameOverHandler);

    listen('mousedown', mousedown);
    listen('mouseup', mouseup);
    listen('mousemove', mousemove);
    listen('erase', setErase);
    listen('clear', clearBoard);
    listen('select-color', setPenColor);
    listen('select-brush', setPenSize);

    listen('received-message', receivedMessage);

    return () => {
      removeListener(
        'current-player',
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
    // Event listeners
    canvas?.addEventListener('mousedown', mousedown);
    canvas?.addEventListener('mouseup', mouseup);
    canvas?.addEventListener('mousemove', mousemove);
    canvas?.addEventListener('touchstart', mousedown);
    canvas?.addEventListener('touchend', mouseup);
    canvas?.addEventListener('touchmove', mousemove);

    return () => {
      canvas?.removeEventListener('mousemove', mousemove);
      canvas?.removeEventListener('mouseup', mouseup);
      canvas?.removeEventListener('mousedown', mousedown);
      canvas?.removeEventListener('touchstart', mousedown);
      canvas?.removeEventListener('touchend', mouseup);
      canvas?.removeEventListener('touchmove', mousemove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  const draw = (clientX, clientY) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    if (!eraseRef.current) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColorRef.current;
      ctx.lineWidth = penSizeRef.current;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      // ctx.strokeStyle = 'red';
      ctx.lineWidth = penSizeRef.current + 5;
    }
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.lineTo(
      clientX - rect.left + penSizeRef.current,
      clientY - rect.top + penSizeRef.current,
    );
    ctx.stroke();
  };

  const mousedown = ({ clientX, clientY, type, touches }) => {
    console.log(clientX, clientY);
    if (type && !isCurrentUserDrawingRef.current) return;
    drawing = true;
    ctx.beginPath();
    const x = type && isSmallDeviceRef.current ? touches?.[0]?.clientX : clientX;
    const y = type && isSmallDeviceRef.current ? touches?.[0]?.clientY : clientY;
    draw(x, y);
    if (type) emit('mousedown', roomId, x * 10, y);
  };

  const mouseup = (e) => {
    if (e && !isCurrentUserDrawingRef.current) return;
    drawing = false;
    ctx.closePath();
    if (e) emit('mouseup', roomId);
  };

  const mousemove = ({ clientX, clientY, type, touches }) => {
    if (type && !isCurrentUserDrawingRef.current) return;
    const x = type && isSmallDeviceRef.current ? touches?.[0]?.clientX : clientX;
    const y = type && isSmallDeviceRef.current ? touches?.[0]?.clientY : clientY;
    if (type) emit('mousemove', roomId, x * 10, y);
    const pointer = document.querySelector('.pointer');
    if (pointer) {
      const { left, top } = canvas.getBoundingClientRect();
      if (
        y < top + 5 ||
        y > top + canvas.height - 10 ||
        x < left + 5 ||
        x > left + canvas.width - 10
      ) {
        pointer.style.display = 'none';
      } else {
        pointer.style.display = 'block';
      }
      const bufferSize = 4 + penSizes.indexOf(penSizeRef.current) * 5;
      pointer.style.left = x + bufferSize + 'px';
      pointer.style.top = y + bufferSize - 1 + 'px';
      // 35 - 19/18
      // 25 - 14/13
      // 15 - 9/8
      // 5 - 4/3
      // 15 / 2^1
    }
    draw(x, y);
  };

  const clearBoard = (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (e) emit('clear', roomId);
  };

  const currentPlayerHandler = (player, options) => {
    currentPlayerRef.current = player.name;
    dispatch(setCurrentPlayer(player));
    dispatch(setTimeOver(false));
    if (player.id === socketId) dispatch(setOptions(options));
    dispatch(setShowOption(true));
  };

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
    // audiosRef.current.gameOver.play();
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
    if (message.sender === socketId && message.guessed) {
      audiosRef.current.guessed.play();
      await new Promise((r) => setTimeout(() => r(), 300));
      setGuessed(true);
    }
    dispatch(setMessages(message));
  };

  return (
    <div className="draw-container d-flex">
      <Logo width={200} />
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
        <div>
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
          <canvas
            id="canvas"
            width={isSmallDeviceRef.current ? 380 : 670}
            height={isSmallDeviceRef.current ? 380 : 500}
            style={{
              cursor: !isCurrentUserDrawingRef.current ? 'default' : 'none',
            }}
          ></canvas>
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
      {isCurrentUserDrawingRef.current && (
        <div
          className="pointer"
          style={{ width: `${penSize}px`, height: `${penSize}px` }}
        ></div>
      )}
    </div>
  );
};

export default memo(Draw);
