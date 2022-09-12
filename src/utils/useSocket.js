import { useCallback, useMemo } from 'react';
import { getSocket } from './socket';

const useSocket = () => {
  const socket = useMemo(getSocket, []);

  const listen = useCallback((event, callback) => socket.on(event, callback), [socket]);

  const emit = useCallback((event, ...args) => socket.emit(event, ...args), [socket]);

  const removeListener = useCallback(
    (...events) => {
      events.forEach((event) => socket.removeAllListeners(event));
    },
    [socket],
  );

  return { emit, listen, removeListener, socketId: socket.id };
};

export default useSocket;
