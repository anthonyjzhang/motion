import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Services from './components/pages/services';
import Products from './components/pages/products';
import SignUp from './components/pages/signup';
import Demo from './components/pages/demo';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<Home/>} />
          <Route path='/services' element={<Services/>} />
          <Route path='/products' element={<Products/>} />
          <Route path='/sign-up' element={<SignUp/>} />
          <Route path="/demo" element={<Demo/>}  />
        </Routes>
      </Router>
    </>
  );
}

export default App;
