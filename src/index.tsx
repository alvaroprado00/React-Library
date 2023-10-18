import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51O1sioJHJGIp0wG5HsVSh1cuh5gIZvqryUwt7298n4EfcChmqU0CwXHIyewnMbmZT4a2ZbbV844y7iWIYSE8tJny00lPw7w6Rd');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <Elements stripe={stripePromise}>
      <App/>
    </Elements>
  </BrowserRouter>
);

