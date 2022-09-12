import React, { memo } from 'react';
import PropTypes from 'prop-types';
import useSocket from '../../utils/useSocket';
import Trophy from '../../assets/icons/trophy.png';
import './options.scss';

const Options = ({
  word,
  showRound,
  gameOver,
  currentPlayer,
  currentRound,
  options,
  roomId,
  isTimeOver,
  players,
  score,
}) => {
  const { emit, socketId } = useSocket();

  const chooseWord = (value) => {
    emit('choose-word', roomId, value);
  };

  if (showRound) {
    return (
      <div className="options-container d-flex">
        <div className="info animate">Round {currentRound}</div>
      </div>
    );
  }

  const _players = [...players];
  if (gameOver) {
    _players.sort((a, b) => score[a.id].rank - score[b.id].rank);
  }
  const isCurrentUser = currentPlayer.id === socketId;
  return (
    <div className={`options-container d-flex ${isCurrentUser ? 'current' : ''}`}>
      {!isTimeOver && !gameOver ? (
        <div className="animate">
          {isCurrentUser ? (
            <>
              <div className="info">Choose a word</div>
              <div>
                {options.map((op) => (
                  <button
                    key={op}
                    className="option"
                    onClick={() => chooseWord(op)}
                    type="button"
                  >
                    {op}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="info">{currentPlayer.name} is choosing a word</div>
          )}
        </div>
      ) : (
        <div className="result">
          <div className="info">{!gameOver ? `The word was: ${word}` : 'Game Over'}</div>
          <div>
            <table>
              <tbody>
                {_players.map((p) => {
                  const _score = score[p.id][gameOver ? 'score' : 'currentScore'];
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>
                        {!gameOver && _score !== 0 && <span>+</span>}
                        <span className={_score === 0 ? 'zero' : ''}>{_score}</span>
                        {gameOver && score[p.id].rank === 1 && (
                          <img src={Trophy} className="winner" alt="trophy" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

Options.propTypes = {
  word: PropTypes.string.isRequired,
  showRound: PropTypes.bool.isRequired,
  gameOver: PropTypes.bool.isRequired,
  currentPlayer: PropTypes.object.isRequired,
  currentRound: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
  roomId: PropTypes.string.isRequired,
  isTimeOver: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
  score: PropTypes.object.isRequired,
};

export default memo(Options);
