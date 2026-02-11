import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/List';
import Detail from './pages/Detail';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f7f9' }}>
        <Routes>
          <Route path="/" element={<Home />} />
         <Route path="/list" element={<List />} />
         <Route path="/detail/:id" element={<Detail />} />
        </Routes>
        
        {/* 底部导航栏，常驻显示 */}
        <NavBar />
      </div>
    </Router>
  );
}

export default App;