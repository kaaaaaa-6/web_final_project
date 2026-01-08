import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Alert, Badge, InputGroup, Spinner } from 'react-bootstrap';
import { Trash, PencilSquare, PlusCircle, Save, CheckCircle, ClipboardData, Search, Check } from 'react-bootstrap-icons';


const API_Orders_URL = "http://localhost:8080/api/orders";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderCustomerId: '',
    orderDate: '',
    expectedDate: '',
    expectedTime: '',
    qtyA: 0,
    qtyB: 0,
    qtyC: 0,
    supplierName: '',
    supplierId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' }); 
  const [deliverFilter, setDeliverFilter] = useState('All'); 

  // 日期時間格式化
  const toDateValue = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  const toTimeValue = (timeStr) => {
    if (!timeStr) return "";
    const m = timeStr.match(/(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "";
  };



  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_Orders_URL);
      const body = await res.json();
      
      if (!res.ok) throw new Error(body.error || "載入失敗");
      
      setOrders(Array.isArray(body) ? body : []);
      if(Array.isArray(body) && body.length === 0) {
        setMessage({ type: 'info', text: '目前無訂單資料' });
      } else {
        setMessage({ type: '', text: '' }); 
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: '載入訂單資料失敗' });
    } finally {
      setLoading(false);
    }
  };

  // 載入時執行
  useEffect(() => {
    loadOrders();
  }, []);



  //表單處理邏輯
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      orderCustomerId: '',
      orderDate: '',
      expectedDate: '',
      expectedTime: '',
      qtyA: 0,
      qtyB: 0,
      qtyC: 0,
      supplierName: '',
      supplierId: ''
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  const handleEditClick = (order) => {
    setEditingId(order.OrderNumber);
    setFormData({
      orderCustomerId: order.IDNumber,
      orderDate: toDateValue(order.OrderDate),
      expectedDate: toDateValue(order.ExpectedDeliveryDate),
      expectedTime: order.ExpectedDeliveryTime ? toTimeValue(order.ExpectedDeliveryTime) : '',
      qtyA: order.QtyA || 0,
      qtyB: order.QtyB || 0,
      qtyC: order.QtyC || 0,
      supplierName: order.SupplierName || '',
      supplierId: order.SupplierID || ''
    });
    setMessage({ type: 'info', text: `正在編輯訂單：${order.OrderNumber}` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本驗證
    if (!formData.orderCustomerId || !formData.orderDate || !formData.expectedDate || !formData.expectedTime) {
      setMessage({ type: 'danger', text: '請填寫所有必填欄位 (*)' });
      return;
    }

    const payload = {
      idnumber: formData.orderCustomerId.trim(),
      orderDate: formData.orderDate,
      expectedDate: formData.expectedDate,
      expectedTime: formData.expectedTime,
      qtyA: parseInt(formData.qtyA, 10),
      qtyB: parseInt(formData.qtyB, 10),
      qtyC: parseInt(formData.qtyC, 10),
      supplierName: formData.supplierName.trim(),
      supplierID: formData.supplierId.trim(),
    };

    try {
      let url = API_Orders_URL;
      let method = "POST";
      let bodyData = payload;

      if (editingId) {
        url = `${API_Orders_URL}/update`;
        method = "PUT";
        bodyData = { ...payload, orderNumber: editingId };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();

      if (result.error) {
        setMessage({ type: 'danger', text: result.error });
      } else {
        setMessage({ type: 'success', text: editingId ? '修改成功' : '新增成功' });
        resetForm();
        loadOrders();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: '系統錯誤，請稍後再試' });
    }
  };

  const handleDelete = async (orderNumber) => {
   
    if (!window.confirm(`確定要刪除訂單 ${orderNumber}?`)) return;

    try {
      const res = await fetch(`${API_Orders_URL}/delete?orderNumber=${orderNumber}`, { method: "DELETE" });
      const result = await res.json();
      
      if (result.error) {
        setMessage({ type: 'danger', text: result.error });
      } else {
        setMessage({ type: 'success', text: '刪除成功' });
        if (editingId === orderNumber) resetForm();
        loadOrders();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: '刪除失敗' });
    }
  };

  // 標記已交餐
  const handleMarkDelivered = async (orderNumber) => {
    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    if (!window.confirm(`確定要標記訂單 ${orderNumber} 為已交餐嗎？\n交餐時間：${todayDate} ${currentTime}`)) return;

    try {
      const res = await fetch(`${API_Orders_URL}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber,
          actualDate: todayDate,
          actualTime: currentTime
        })
      });
      const result = await res.json();
      
      if (!res.ok || result.error) {
        setMessage({ type: 'danger', text: result.error || '標記失敗，請稍後再試' });
        console.error('標記交餐錯誤:', result);
      } else {
        setMessage({ type: 'success', text: '已標記交餐成功！' });
        loadOrders();
      }
    } catch (err) {
      console.error('標記交餐失敗:', err);
      setMessage({ type: 'danger', text: '標記失敗，請檢查網路連線' });
    }
  };

  
  // 搜尋過濾
  const filteredOrders = orders.filter(o => {
    const kw = keyword.trim().toLowerCase();
    const matchKeyword = kw
      ? ((o.IDNumber || '').toLowerCase().includes(kw) || (o.CustomerName || '').toLowerCase().includes(kw))
      : true;
    const delivered = !!o.ActualDeliveryDate;
    const matchDeliver =
      deliverFilter === 'All' ||
      (deliverFilter === 'Delivered' && delivered) ||
      (deliverFilter === 'Undelivered' && !delivered);
    return matchKeyword && matchDeliver;
  });

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: 'var(--brand-1)', fontWeight: '700' }}>訂單管理</h1>
        <Button variant="outline-secondary" href="/" style={{ borderColor: 'var(--brand-1)', color: 'var(--brand-1)', fontWeight: '600' }}>← 回首頁</Button>
      </div>

      {/* 訊息提示區塊  */}
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      <Row className="g-4">
        {/* 左側：表單區域 */}
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm border-0 card-border-top-custom">
            <Card.Header className="bg-gradient-brand" style={{ color: 'white', fontWeight: '600' }}>
              {editingId ? <><PencilSquare className="me-2" />編輯訂單</> : <><PlusCircle className="me-2" />新增訂單</>}
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--brand-bg-soft)' }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>客戶身分證 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="orderCustomerId"
                    value={formData.orderCustomerId}
                    onChange={handleInputChange}
                    readOnly={!!editingId} 
                    required 
                    placeholder="例如: A123456789"
                    style={{ borderColor: 'var(--brand-accent)' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>訂餐日期 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    readOnly={!!editingId}
                    required
                    style={{ borderColor: 'var(--brand-accent)' }}
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>預計日期 <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="date" 
                        name="expectedDate"
                        value={formData.expectedDate}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: 'var(--brand-accent)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>時間 <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="time" 
                        name="expectedTime"
                        value={formData.expectedTime}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: 'var(--brand-accent)' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr style={{ borderColor: 'var(--brand-accent)' }} />
                <Form.Label className="text-muted small" style={{ color: 'var(--brand-1)', fontWeight: '600' }}>餐點數量</Form.Label>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>A餐 ($100)</Form.Label>
                    <Form.Control type="number" min="0" name="qtyA" value={formData.qtyA} onChange={handleInputChange} style={{ borderColor: 'var(--brand-accent)' }} />
                  </Col>
                  <Col>
                    <Form.Label>B餐 ($150)</Form.Label>
                    <Form.Control type="number" min="0" name="qtyB" value={formData.qtyB} onChange={handleInputChange} style={{ borderColor: 'var(--brand-accent)' }} />
                  </Col>
                  <Col>
                    <Form.Label>C餐 ($200)</Form.Label>
                    <Form.Control type="number" min="0" name="qtyC" value={formData.qtyC} onChange={handleInputChange} style={{ borderColor: 'var(--brand-accent)' }} />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>供應商名稱</Form.Label>
                    <Form.Control type="text" name="supplierName" value={formData.supplierName} onChange={handleInputChange} style={{ borderColor: 'var(--brand-accent)' }} />
                </Form.Group>
                
                <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: 'var(--brand-1)' }}>供應商編號</Form.Label>
                    <Form.Control type="text" name="supplierId" value={formData.supplierId} onChange={handleInputChange} style={{ borderColor: 'var(--brand-accent)' }} />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ background: ' var(--brand-2)', border: 'none', fontWeight: '600' }}
                  >
                    {editingId ? <><Save className="me-2" />儲存修改</> : <><PlusCircle className="me-2" />確認新增</>}
                  </Button>
                  {editingId && (
                    <Button variant="outline-secondary" onClick={resetForm} style={{ fontWeight: '600' }}>
                      取消編輯
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* 右側：列表區域 */}
        <Col lg={9}>
          <Card className="shadow-sm border-0 border-top-brand-2">
            <Card.Header className="bg-gradient-brand" style={{ color: 'white', fontWeight: '600' }}>
              <ClipboardData className="me-2" />訂單列表
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--brand-bg-soft)' }}>
              <Row className="mb-3 align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--brand-accent)' }}>
                      <Search style={{ color: 'var(--brand-1)' }} />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="搜尋身分證或姓名..." 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      style={{ borderColor: 'var(--brand-accent)' }}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-md-end mt-2 mt-md-0">
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    className="me-2"
                    onClick={() => setDeliverFilter('Delivered')}
                    style={deliverFilter === 'Delivered' 
                      ? { background: ' var(--brand-2)', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
                  >已交餐</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    className="me-2"
                    onClick={() => setDeliverFilter('Undelivered')}
                    style={deliverFilter === 'Undelivered' 
                      ? { background: 'var(--brand-2)', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
                  >未交餐</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    onClick={() => setDeliverFilter('All')}
                    style={deliverFilter === 'All' 
                      ? { background: 'var(--brand-2) ', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
                  >全部</Button>
                </Col>
              </Row>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: 'var(--brand-1)' }} />
                  <p className="mt-2" style={{ color: 'var(--brand-1)' }}>資料載入中...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered striped className="align-middle mb-0" style={{ fontSize: '0.9rem', borderColor: 'var(--brand-muted)', tableLayout: 'fixed' }}>
                    <thead className="bg-gradient-table-header" style={{ fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <tr>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '5%', textAlign: 'center' }}>交餐</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '5%' }}>ID</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '10%' }}>身分證</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '7%' }}>姓名</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '10%' }}>訂餐日期</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '10%' }}>預計交餐</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '10%' }}>實際交餐</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '4%' }}>A</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '4%' }}>B</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '4%' }}>C</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '7%' }}>金額</th>
                        <th style={{ borderColor: 'var(--brand-muted)', width: '7%' }}>供應商</th>
                        <th style={{ borderColor: 'var(--brand-muted)', textAlign: 'center', width: '8%' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.OrderNumber} style={{ borderBottomColor: 'var(--brand-muted)' }}>
                          <td style={{ borderColor: 'var(--brand-muted)', textAlign: 'center' }}>
                            {o.ActualDeliveryDate ? (
                              <span
                                title={`已交餐：${toDateValue(o.ActualDeliveryDate)} ${o.ActualDeliveryTime ? toTimeValue(o.ActualDeliveryTime) : ''}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--state-success-bg)',
                                  boxShadow: '0 0 0 2px var(--state-success-bg) inset',
                                  cursor: 'default'
                                }}
                              >
                                <Check size={16} color={'var(--state-success-fg)'} />
                              </span>
                            ) : (
                              <span
                                role="button"
                                title="點擊標記為已交餐"
                                onClick={() => handleMarkDelivered(o.OrderNumber)}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--text-on-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--state-neutral-icon)'; e.currentTarget.style.color = 'var(--state-neutral-icon)'; }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  border: '2px solid var(--state-neutral-icon)',
                                  color: 'var(--state-neutral-icon)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Check size={16} />
                              </span>
                            )}
                          </td>
                          <td className="fw-bold" style={{ borderColor: 'var(--brand-muted)' }}>{o.OrderNumber}</td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}><small>{o.IDNumber}</small></td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}>{o.CustomerName}</td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}><small>{toDateValue(o.OrderDate)}</small></td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}>
                            <small>
                              {toDateValue(o.ExpectedDeliveryDate)}<br/>
                              {o.ExpectedDeliveryTime ? toTimeValue(o.ExpectedDeliveryTime) : '-'}
                            </small>
                          </td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}>
                            <small>
                              {o.ActualDeliveryDate ? toDateValue(o.ActualDeliveryDate) : '-'}<br/>
                              {o.ActualDeliveryTime ? toTimeValue(o.ActualDeliveryTime) : '-'}
                            </small>
                          </td>
                          <td className="text-center" style={{ borderColor: 'var(--brand-muted)' }}>{o.QtyA || 0}</td>
                          <td className="text-center" style={{ borderColor: 'var(--brand-muted)' }}>{o.QtyB || 0}</td>
                          <td className="text-center" style={{ borderColor: 'var(--brand-muted)' }}>{o.QtyC || 0}</td>
                          <td className="text-end fw-bold" style={{ borderColor: 'var(--brand-muted)', color: 'var(--brand-1)' }}>
                            ${o.OrderAmount}
                          </td>
                          <td style={{ borderColor: 'var(--brand-muted)' }}>
                            <small>{o.SupplierName}<br/>{o.SupplierID}</small>
                          </td>
                          <td style={{ borderColor: 'var(--brand-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-1 mb-1"
                              onClick={() => handleEditClick(o)}
                              style={{ borderColor: 'var(--brand-1)', color: 'var(--brand-1)', padding: '0.25rem 0.4rem', fontSize: '0.875rem' }}
                              title="編輯"
                            >
                              <PencilSquare />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="mb-1"
                              onClick={() => handleDelete(o.OrderNumber)}
                              style={{ borderColor: 'var(--brand-danger-outline)', color: 'var(--brand-danger-outline)', padding: '0.25rem 0.4rem', fontSize: '0.875rem' }}
                              title="刪除"
                            >
                              <Trash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan="13" className="text-center py-4" style={{ color: '#8B6F47', fontWeight: '500' }}>
                            查無符合的訂單資料
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

export default OrdersPage;