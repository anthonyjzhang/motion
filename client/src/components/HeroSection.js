import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';
import { Link } from 'react-router-dom';


function HeroSection() {
  return (
    <div className='hero-container'>
      <video src='/videos/video-1.mp4' autoPlay loop muted playsInline/>
      <div className='hero-content'>
        <h1>The Future of Wellness</h1>
        <p>Technology makes healthcare more accessible</p>
        <div className='hero-btns'>
        <Link to="/demo">
          <Button
            className='btns'
            buttonStyle='btn--outline'
            buttonSize='btn--large'
          >
            GET STARTED
          </Button>
      </Link>
          <Button
            className='btns'
            buttonStyle='btn--primary'
            buttonSize='btn--large'
            onClick={console.log('hey')}
          >
            WATCH TRAILER <i className='far fa-play-circle' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
