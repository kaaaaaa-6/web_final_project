import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { House, Shop, PeopleFill, CartDashFill } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

function Navbars() {
  return (
    <Navbar expand="lg" sticky="top" style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Container>                    
        <Navbar.Brand as={NavLink} to="/" className="fw-bold text-light gap-2" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
          <Shop size={28} style={{ marginRight: '0.5rem' }} />客戶訂餐管理系統
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: 'rgba(255,255,255,0.5)' }} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-1">
            <Nav.Link as={NavLink} to="/" className="text-light" style={{ fontWeight: '500', transition: 'all 0.3s' }}><House className="me-2" size={18}/> 首頁</Nav.Link>
            <Nav.Link as={NavLink} to="/customers" className="text-light" style={{ fontWeight: '500', transition: 'all 0.3s' }}><PeopleFill className="me-2" size={18}/> 客戶管理</Nav.Link>
            <Nav.Link as={NavLink} to="/orders" className="text-light" style={{ fontWeight: '500', transition: 'all 0.3s' }}><CartDashFill className="me-2" size={18}/> 訂單管理</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navbars;