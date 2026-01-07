import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbars from './components/Navbars';
import HomePage from './pages/HomePage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFEB 100%)' }}>
        <Navbars />

        <Container className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Container>

        <footer className="border-top py-3 mt-auto text-center" style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', color: 'white' }}>
          <Container>
            <small style={{ color: '#FFE5CC' }}>
              ©2026/01/09 WEB程式設計 期末專題 - 客戶訂餐管理系統
            </small>
          </Container>
        </footer>
    </div>
    </Router>

    
  );
}

export default App;
