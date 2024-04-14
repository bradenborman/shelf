import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './shelfapp.scss';
import Scene from '../scene/scene';

const ShelfApp: React.FC = () => {
  return (
    <Router>
      <div id="app">
        <Routes>
          <Route path='/' element={<Scene />} />
        </Routes>
      </div>
    </Router>
  );
};

export default ShelfApp;