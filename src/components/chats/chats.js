import React, { memo, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import useSocket from '../../utils/useSocket';
import './chats.scss';

const Chats = ({
  roomId,
  messages,
  mySocketId,
  time,
  guessed,
  isDrawing,
  isCurrentUserDrawing,
}) => {
  const { emit } = useSocket();
  const ulRef = useRef();
  const inputRef = useRef();

  const placeholder = useMemo(() => {
    if (!isDrawing) return 'Type a Message';
    if (isCurrentUserDrawing) return 'You cannot guess';
    if (guessed) return 'You have Guessed the word';
    return 'Type your Guess here';
  }, [guessed, isCurrentUserDrawing, isDrawing]);

  useEffect(() => {
    if (ulRef.current && messages.length) {
      const lastMessage = ulRef.current.querySelector('li:last-child');
      if (lastMessage) lastMessage.scrollIntoView();
    }
  }, [messages]);

  const onKeypressHandler = ({ keyCode }) => {
    if (guessed || keyCode !== 13) return;
    send();
  };

  const send = () => {
    const { value } = inputRef.current;
    if (value.trim() === '') return;
    emit('send-message', roomId, value, time, mySocketId);
    inputRef.current.value = '';
  };

  return (
    <div className="chats-container">
      <div className="message-container">
        <ul ref={ulRef}>
          {messages.map((m) => {
            const fromMe = m.senderId === mySocketId;
            return (
              <li key={m.id}>
                <div
                  className={`message ${m.system && 'system'} ${
                    (m.guessed || (m.close && fromMe)) && 'guessed'
                  }`}
                >
                  {!m.guessed && !m.system && (!m.close || !fromMe) && (
                    <>
                      <span style={{ fontWeight: 600 }}>{!fromMe ? m.name : 'You'}:</span>
                      &nbsp;
                    </>
                  )}
                  {m.close && fromMe ? `${m.message} is close` : m.message}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="input-container d-flex">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onKeyUp={onKeypressHandler}
          readOnly={isDrawing && (guessed || isCurrentUserDrawing)}
        />
        <button className="send" onClick={send} type="button" />
      </div>
    </div>
  );
};

Chats.propTypes = {
  roomId: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  mySocketId: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  guessed: PropTypes.bool.isRequired,
  isDrawing: PropTypes.bool.isRequired,
  isCurrentUserDrawing: PropTypes.bool.isRequired,
};

export default memo(Chats);
