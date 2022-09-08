import { useCallback, useMemo } from "react";
import { getSocket } from "./socket";

export const useSocket = () => {
  const socket = useMemo(getSocket, []);

  // useEffect(() => {
  //   return () => socket.removeAllListeners();
  // });

  const listen = useCallback(
    (event, callback) => socket.on(event, callback),
    [socket]
  );

  const emit = useCallback(
    (event, ...args) => socket.emit(event, ...args),
    [socket]
  );

  const removeListener = useCallback(
    (...events) => {
      events.forEach((event) => socket.removeAllListeners(event));
    },
    [socket]
  );

  return { emit, listen, removeListener, socketId: socket.id };
};
