import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { People, Cart } from 'react-bootstrap-icons';

const HomePage = () => {

  return (
    <Container>
      <Card className="big-card-custom mb-5">
        <Card.Body className="p-5 text-center">
          <h1 className="display-4 fw-bold mb-3">歡迎使用客戶訂餐管理系統</h1>
          <p className="lead-text mt-2" style={{ fontSize: '1.1rem' }}>高效管理客戶資料與訂單，提升服務品質</p>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6} className="mb-3">
          <Card className="small-card-custom card-border-top-custom h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="text-primary-custom" style={{ fontWeight: '700', marginBottom: '1rem' }}><People className="me-2" />客戶管理</h4>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>新增、編輯、刪除客戶資料</p>
              <Button className="btn-primary-custom w-100" href="/customers">前往管理</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="small-card-custom card-border-top-custom h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <h4 className="text-primary-custom" style={{ fontWeight: '700', marginBottom: '1rem' }}><Cart className="me-2" />訂單管理</h4>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>建立訂單、追蹤交餐狀況、刪除訂單</p>
              <Button className="btn-primary-custom w-100" href="/orders">前往管理</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>  
  );
};

export default HomePage;
