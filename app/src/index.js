import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter,  Routes, Route } from "react-router-dom";

import Layout from './Layout';
import { Main } from './components/Main';
import { Marketplace } from './components/Marketplace';

import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="marketplace" element={<Marketplace />} />
        </Routes>
      </Layout>
    </BrowserRouter>,
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
