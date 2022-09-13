import React, { lazy, memo, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spinner from './components/spinner/spinner';
import Home from './screens/home/home';

const Lobby = lazy(() => import(/* webpackChunkName: "Lobby" */ './screens/lobby/lobby'));
const Play = lazy(() => import(/* webpackChunkName: "Play" */ './screens/play/play'));

const Router = ({ roomId, playGameStartSound }) => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/" element={<Home />} />
      {roomId && (
        <>
          <Route
            path="/lobby"
            element={<Lobby playGameStartSound={playGameStartSound} />}
          />
          <Route path="/play" element={<Play />} />
        </>
      )}
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  </Suspense>
);

Router.propTypes = {
  roomId: PropTypes.string,
  playGameStartSound: PropTypes.func.isRequired,
};

Router.defaultProps = {
  roomId: null,
};

export default memo(Router);
