import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>We are able to detect the following moves</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/chair.jpg'
              text='Chair Pose'
              label='Intermedium'
              path='/demo'
            />
            <CardItem
              src='images/dog.jpg'
              text='Dog Pose'
              label='Beginner'
              path='/demo'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/cobra.jpg'
              text='Cobra Pose'
              label='Intermedium'
              path='/demo'
            />
            <CardItem
              src='images/tree.jpg'
              text='Tree Pose'
              label='Advanced'
              path='/demo'
            />
            <CardItem
              src='images/warrior.jpg'
              text='Warrier Pose'
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
