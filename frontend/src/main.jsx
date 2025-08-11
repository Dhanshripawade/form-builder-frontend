import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Builder from './pages/Builder';
import PreviewFill from './pages/PreviewFill';
import './index.css';

function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 ">
        {/* <nav className="bg-white shadow p-6 ">
          <div className=" container mx-auto flex gap-4 justify-center items-center">
            <Link to="/" className="font-bold text-4xl ">Builder Form</Link>
          </div>
        </nav> */}
        <Routes>
          <Route path="/" element={<Builder/>} />
          <Route path="/forms/:id" element={<PreviewFill/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />);
