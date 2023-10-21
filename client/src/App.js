// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './home';
import Demo from './demo';

function App() {
  return (
   // <Home />
   // <Home />
  <Router>
        <hr /> {/* Just a visual separator */}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
    </Router>
  );
}

export default App;
