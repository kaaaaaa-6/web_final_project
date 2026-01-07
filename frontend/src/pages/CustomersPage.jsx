import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert, Card, Row, Col, Spinner, Badge, InputGroup } from 'react-bootstrap';

import { Search, PencilSquare, PlusCircle, Save, CheckCircle, XCircle, ClipboardData } from 'react-bootstrap-icons';

const API_BASE_URL = 'http://localhost:8080/api/customers';

const CustomersPage = () => {
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false); //  Loading 狀態
  const [error, setError] = useState(null);      //  錯誤訊息處理
  const [successMsg, setSuccessMsg] = useState('');

  // 搜尋與篩選狀態
  const [filterStatus, setFilterStatus] = useState('Active');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 表單狀態
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    idNumber: '',
    customerName: '',
    phone: '',
    address: ''
  });

  
  // 初始載入
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('無法連線到伺服器，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };



  //Event Handlers ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 重置表單
  const resetForm = () => {
    setFormData({ idNumber: '', customerName: '', phone: '', address: '' });
    setIsEditing(false);
    setError(null);
    setSuccessMsg('');
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 前端基本驗證 
    if (!formData.idNumber || !formData.customerName) {
      setError('身分證與姓名為必填欄位');
      return;
    }

    const url = isEditing ? `${API_BASE_URL}/update` : API_BASE_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // 注意後端欄位對應
      });
      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccessMsg(isEditing ? '修改成功！' : '新增成功！');
      fetchCustomers(); // 重新整理列表
      resetForm();
    } catch (err) {
      setError(err.message || '操作失敗');
    }
  };

  // 編輯模式
  const handleEdit = (customer) => {
    setFormData({
      idNumber: customer.IDNumber,
      customerName: customer.CustomerName,
      phone: customer.Phone || '',
      address: customer.Address || ''
    });
    setIsEditing(true);
    // 滾動到頂部提升體驗
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 切換狀態 (Active <-> Inactive)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const confirmMsg = currentStatus === 'Active' 
      ? `確定要停用客戶 ${id} 嗎？` 
      : `確定要啟用客戶 ${id} 嗎？`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/customers/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idnumber: id, status: newStatus })
      });
      const result = await res.json();
      if(result.error) throw new Error(result.error);
      
      setSuccessMsg(newStatus === 'Active' ? '啟用成功' : '停用成功');
      fetchCustomers();
    } catch(err) {
      setError((newStatus === 'Active' ? '啟用' : '停用') + '失敗: ' + err.message);
    }
  };


  //資料篩選===========
  const filteredCustomers = customers.filter(c => {
    const matchStatus = filterStatus === 'All' || c.ConsumptionStatus === filterStatus;
    const matchSearch = 
      (c.IDNumber && c.IDNumber.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (c.CustomerName && c.CustomerName.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchStatus && matchSearch;
  });


  //Render 畫面===========
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: '#8B6F47', fontWeight: '700' }}>客戶管理系統</h1>
        <Button variant="outline-secondary" href="/" style={{ borderColor: '#8B6F47', color: '#8B6F47', fontWeight: '600' }}>← 回首頁</Button>
      </div>

      {/* 訊息提示區 */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}

      <Row className="g-4">
        {/* 左側：表單區域 */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid #8B6F47' }}>
            <Card.Header style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', color: 'white', fontWeight: '600' }}>
              {isEditing ? <><PencilSquare className="me-2" />編輯客戶資料</> : <><PlusCircle className="me-2" />新增客戶</>}
            </Card.Header>
            <Card.Body style={{ backgroundColor: '#FFFBF8' }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>身分證字號 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="idNumber"
                    value={formData.idNumber} 
                    onChange={handleInputChange}
                    disabled={isEditing}
                    placeholder="請輸入身分證"
                    required
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>姓名 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="customerName"
                    value={formData.customerName} 
                    onChange={handleInputChange}
                    placeholder="請輸入姓名"
                    required
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>電話</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="phone"
                    value={formData.phone} 
                    onChange={handleInputChange}
                    placeholder="請輸入電話"
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>地址</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="address"
                    value={formData.address} 
                    onChange={handleInputChange}
                    placeholder="請輸入地址"
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none', fontWeight: '600' }}
                  >
                    {isEditing ? <><Save className="me-2" />儲存修改</> : <><PlusCircle className="me-2" />新增客戶</>}
                  </Button>
                  {isEditing && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={resetForm}
                      style={{ fontWeight: '600' }}
                    >
                      取消編輯
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* 右側：列表區域 */}
        <Col lg={8}>
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid #9D7E52' }}>
            <Card.Header style={{ background: 'linear-gradient(135deg, #9D7E52 0%, #8B6F47 100%)', color: 'white', fontWeight: '600' }}>
              <ClipboardData className="me-2" />客戶列表
            </Card.Header>
            <Card.Body style={{ backgroundColor: '#FFFBF8' }}>
              {/* 搜尋與篩選 */}
              <Row className="mb-4 align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#F5EFEB', borderColor: '#D4A574' }}>
                      <Search style={{ color: '#8B6F47' }} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="搜尋身分證或姓名..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      style={{ borderColor: '#D4A574' }}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-md-end mt-2 mt-md-0">
                  <Button 
                    variant={filterStatus === 'Active' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setFilterStatus('Active')}
                    style={filterStatus === 'Active' ? { background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none' } : {}}
                  >Active</Button>
                  <Button 
                    variant={filterStatus === 'Inactive' ? 'secondary' : 'outline-secondary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => setFilterStatus('Inactive')}
                  >Inactive</Button>
                  <Button 
                    variant={filterStatus === 'All' ? 'dark' : 'outline-dark'} 
                    size="sm"
                    onClick={() => setFilterStatus('All')}
                  >全部</Button>
                </Col>
              </Row>

              {/* 資料表 */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: '#8B6F47' }} />
                  <p className="mt-2" style={{ color: '#8B6F47' }}>資料載入中...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered className="mb-0" style={{ borderColor: '#E8D7C8', tableLayout: 'fixed' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #6B5437 0%, #7D5E42 100%)', color: 'white', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <tr>
                        <th style={{ borderColor: '#E8D7C8', width: '15%' }}>身分證</th>
                        <th style={{ borderColor: '#E8D7C8', width: '12%' }}>姓名</th>
                        <th style={{ borderColor: '#E8D7C8', width: '13%' }}>電話</th>
                        <th style={{ borderColor: '#E8D7C8', width: '28%' }}>地址</th>
                        <th style={{ borderColor: '#E8D7C8', width: '12%' }}>狀態</th>
                        <th style={{ borderColor: '#E8D7C8', textAlign: 'center', width: '20%' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((c) => (
                      <tr key={c.IDNumber} style={{ opacity: c.ConsumptionStatus === 'Inactive' ? 0.6 : 1, borderBottomColor: '#E8D7C8' }}>
                            <td style={{ borderColor: '#E8D7C8' }}>{c.IDNumber}</td>
                            <td style={{ borderColor: '#E8D7C8' }}>{c.CustomerName}</td>
                            <td style={{ borderColor: '#E8D7C8' }}>{c.Phone}</td>
                            <td style={{ borderColor: '#E8D7C8' }}>{c.Address}</td>
                            <td style={{ borderColor: '#E8D7C8' }}>
                              <Badge 
                                style={{ 
                                  background: c.ConsumptionStatus === 'Active' 
                                    ? 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)' 
                                    : '#999999',
                                  fontSize: '0.9rem',
                                  padding: '0.5em 0.9em',
                                  fontWeight: '600',
                                  borderRadius: '20px'
                                }}
                              >
                                {c.ConsumptionStatus === 'Active' ? <><CheckCircle className="me-1" />活躍</> : <><XCircle className="me-1" />停用</>}
                              </Badge>
                            </td>
                            <td style={{ borderColor: '#E8D7C8', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                className="me-1 mb-1"
                                onClick={() => handleEdit(c)}
                                style={{ borderColor: '#8B6F47', color: '#8B6F47', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F5EFEB'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                title="編輯"
                              >
                                <PencilSquare className="me-1" />編輯
                              </Button>
                              {c.ConsumptionStatus === 'Active' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline-danger" 
                                  className="mb-1"
                                  onClick={() => handleToggleStatus(c.IDNumber, c.ConsumptionStatus)}
                                  style={{ borderColor: '#C4A69D', color: '#C4A69D', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F5EFEB'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                  title="停用"
                                >
                                  <XCircle className="me-1" />停用
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline-success" 
                                  className="mb-1"
                                  onClick={() => handleToggleStatus(c.IDNumber, c.ConsumptionStatus)}
                                  style={{ borderColor: '#8B6F47', color: '#8B6F47', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F5EFEB'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                  title="啟用"
                                >
                                  <CheckCircle className="me-1" />啟用
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4" style={{ color: '#8B6F47', fontWeight: '500' }}>
                            {filteredCustomers.length === 0 && searchKeyword ? '查無符合的客戶資料' : '暫無客戶資料，請新增'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomersPage;