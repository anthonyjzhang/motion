import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>Check out these EPIC Workouts!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/img-9.jpg'
              text='Bench Press'
              label='Intermedium'
              path='/demo'
            />
            <CardItem
              src='images/img-2.jpg'
              text='Arm Curl'
              label='Beginner'
              path='/demo'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/img-3.jpg'
              text='Deadlift'
              label='Intermedium'
              path='/demo'
            />
            <CardItem
              src='images/img-4.jpg'
              text='Arnold Press'
              label='Advanced'
              path='/demo'
            />
            <CardItem
              src='images/img-8.jpg'
              text='Jumpping Jacks'
              label='Beginner'
              path='/demo'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
