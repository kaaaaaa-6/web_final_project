import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbars from './components/Navbars';
import HomePage from './pages/HomePage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <Router>
      <Navbars />

      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
      
    </Router>
  );
}

export default App;
