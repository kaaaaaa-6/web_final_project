import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { People, Cart } from 'react-bootstrap-icons';

const HomePage = () => {

  return (
    <Container>
      <Card className="mb-5" style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', color: 'white' }}>
        <Card.Body className="p-5 text-center">
          <h1 className="display-4 fw-bold mb-3">歡迎使用客戶訂餐管理系統</h1>
          <p className="lead mt-2" style={{ color: '#FFE5CC', fontSize: '1.1rem' }}>高效管理客戶資料與訂單，提升服務品質</p>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #8B6F47' }}>
            <Card.Body className="p-4">
              <h4 style={{ color: '#8B6F47', fontWeight: '700', marginBottom: '1rem' }}><People className="me-2" />客戶管理</h4>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>新增、編輯、刪除客戶資料</p>
              <Button className="w-100" variant="primary" href="/customers">前往管理</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #9D7E52' }}>
            <Card.Body className="p-4">
              <h4 style={{ color: '#8B6F47', fontWeight: '700', marginBottom: '1rem' }}><Cart className="me-2" />訂單管理</h4>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>建立訂單、追蹤交餐狀況、刪除訂單</p>
              <Button className="w-100" variant="success" href="/orders">前往管理</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>  
  );
};

export default HomePage;
