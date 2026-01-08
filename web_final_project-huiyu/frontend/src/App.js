import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ThemeProvider } from './context/ThemeContext';
import Navbars from './components/Navbars';
import HomePage from './pages/HomePage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import './styles/theme.css';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbars />

        <Container className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Container>

        <footer className="footer-custom border-top py-3 mt-auto text-center">
          <Container>
            <small>
              ©2026/01/09 WEB程式設計 期末專題 - 客戶訂餐管理系統
            </small>
          </Container>
        </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
