import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Demo from './demo';

function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the main landing page of the application.</p>
            <ul>
                <li><Link to="/demo">Demo</Link></li>
            </ul>
            
            <Routes>
                <Route path="/demo" component={Demo} />
            </Routes>
        </div>
    );
}

export default Home;