import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Alert, Badge, InputGroup } from 'react-bootstrap';

import { Trash, PencilSquare, PlusCircle, Save, CheckCircle, ClipboardData, Search } from 'react-bootstrap-icons';

const API_Orders_URL = 'http://localhost:8080/api/orders';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
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
    try {
      const res = await fetch(API_Orders_URL);
      const body = await res.json();
      
      if (!res.ok) throw new Error(body.error || "載入失敗");
      
      setOrders(Array.isArray(body) ? body : []);
      if(Array.isArray(body) && body.length === 0) {
        setMessage({ type: 'info', text: '目前無訂單資料' });
      } else {
        setMessage({ type: '', text: '' }); // 清除訊息
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: '載入訂單資料失敗' });
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
    // [Senior Note]: 良好的 UX 應該會自動捲動到表單位置
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
      
      if (result.error) {
        setMessage({ type: 'danger', text: result.error });
      } else {
        setMessage({ type: 'success', text: '已標記交餐成功！' });
        loadOrders();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: '標記失敗' });
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
        <h1 style={{ color: '#8B6F47', fontWeight: '700' }}>客戶訂餐管理系統</h1>
        <Button variant="outline-secondary" href="/" style={{ borderColor: '#8B6F47', color: '#8B6F47', fontWeight: '600' }}>← 回首頁</Button>
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
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid #8B6F47' }}>
            <Card.Header style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', color: 'white', fontWeight: '600' }}>
              {editingId ? <><PencilSquare className="me-2" />編輯訂單</> : <><PlusCircle className="me-2" />新增訂單</>}
            </Card.Header>
            <Card.Body style={{ backgroundColor: '#FFFBF8' }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>客戶身分證 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="orderCustomerId"
                    value={formData.orderCustomerId}
                    onChange={handleInputChange}
                    readOnly={!!editingId} 
                    required 
                    placeholder="例如: A123456789"
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>訂餐日期 <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    readOnly={!!editingId}
                    required
                    style={{ borderColor: '#D4A574' }}
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>預計日期 <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="date" 
                        name="expectedDate"
                        value={formData.expectedDate}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: '#D4A574' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>時間 <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="time" 
                        name="expectedTime"
                        value={formData.expectedTime}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: '#D4A574' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr style={{ borderColor: '#D4A574' }} />
                <Form.Label className="text-muted small" style={{ color: '#8B6F47', fontWeight: '600' }}>餐點數量</Form.Label>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>A餐</Form.Label>
                    <Form.Control type="number" min="0" name="qtyA" value={formData.qtyA} onChange={handleInputChange} style={{ borderColor: '#D4A574' }} />
                  </Col>
                  <Col>
                    <Form.Label>B餐</Form.Label>
                    <Form.Control type="number" min="0" name="qtyB" value={formData.qtyB} onChange={handleInputChange} style={{ borderColor: '#D4A574' }} />
                  </Col>
                  <Col>
                    <Form.Label>C餐</Form.Label>
                    <Form.Control type="number" min="0" name="qtyC" value={formData.qtyC} onChange={handleInputChange} style={{ borderColor: '#D4A574' }} />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>供應商名稱</Form.Label>
                    <Form.Control type="text" name="supplierName" value={formData.supplierName} onChange={handleInputChange} style={{ borderColor: '#D4A574' }} />
                </Form.Group>
                
                <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>供應商編號</Form.Label>
                    <Form.Control type="text" name="supplierId" value={formData.supplierId} onChange={handleInputChange} style={{ borderColor: '#D4A574' }} />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none', fontWeight: '600' }}
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
          <Card className="shadow-sm border-0" style={{ borderTop: '4px solid #9D7E52' }}>
            <Card.Header style={{ background: 'linear-gradient(135deg, #9D7E52 0%, #8B6F47 100%)', color: 'white', fontWeight: '600' }}>
              <ClipboardData className="me-2" />訂單列表
            </Card.Header>
            <Card.Body style={{ backgroundColor: '#FFFBF8' }}>
              <Row className="mb-3 align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#F5EFEB', borderColor: '#D4A574' }}>
                      <Search style={{ color: '#8B6F47' }} />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="搜尋身分證或姓名..." 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      style={{ borderColor: '#D4A574' }}
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
                      ? { background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none', color: '#fff' }
                      : { borderColor: '#8B6F47', color: '#8B6F47', backgroundColor: 'transparent' }}
                  >已交餐</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    className="me-2"
                    onClick={() => setDeliverFilter('Undelivered')}
                    style={deliverFilter === 'Undelivered' 
                      ? { background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none', color: '#fff' }
                      : { borderColor: '#8B6F47', color: '#8B6F47', backgroundColor: 'transparent' }}
                  >未交餐</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    onClick={() => setDeliverFilter('All')}
                    style={deliverFilter === 'All' 
                      ? { background: 'linear-gradient(135deg, #8B6F47 0%, #9D7E52 100%)', border: 'none', color: '#fff' }
                      : { borderColor: '#8B6F47', color: '#8B6F47', backgroundColor: 'transparent' }}
                  >全部</Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table hover bordered striped className="align-middle mb-0" style={{ fontSize: '0.9rem', borderColor: '#E8D7C8', tableLayout: 'fixed' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #6B5437 0%, #7D5E42 100%)', color: 'white', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <tr>
                      <th style={{ borderColor: '#E8D7C8', width: '5%', textAlign: 'center' }}>交餐</th>
                      <th style={{ borderColor: '#E8D7C8', width: '5%' }}>ID</th>
                      <th style={{ borderColor: '#E8D7C8', width: '10%' }}>身分證</th>
                      <th style={{ borderColor: '#E8D7C8', width: '7%' }}>姓名</th>
                      <th style={{ borderColor: '#E8D7C8', width: '10%' }}>訂餐日期</th>
                      <th style={{ borderColor: '#E8D7C8', width: '10%' }}>預計交餐</th>
                      <th style={{ borderColor: '#E8D7C8', width: '10%' }}>實際交餐</th>
                      <th style={{ borderColor: '#E8D7C8', width: '4%' }}>A</th>
                      <th style={{ borderColor: '#E8D7C8', width: '4%' }}>B</th>
                      <th style={{ borderColor: '#E8D7C8', width: '4%' }}>C</th>
                      <th style={{ borderColor: '#E8D7C8', width: '7%' }}>金額</th>
                      <th style={{ borderColor: '#E8D7C8', width: '7%' }}>供應商</th>
                      <th style={{ borderColor: '#E8D7C8', textAlign: 'center', width: '8%' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.OrderNumber} style={{ borderBottomColor: '#E8D7C8' }}>
                        <td style={{ borderColor: '#E8D7C8', textAlign: 'center' }}>
                          {o.ActualDeliveryDate ? (
                            <CheckCircle 
                              size={24} 
                              style={{ color: '#28a745', cursor: 'default' }}
                              title={`已交餐：${toDateValue(o.ActualDeliveryDate)} ${o.ActualDeliveryTime ? toTimeValue(o.ActualDeliveryTime) : ''}`}
                            />
                          ) : (
                            <CheckCircle 
                              size={24} 
                              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.2s' }}
                              onClick={() => handleMarkDelivered(o.OrderNumber)}
                              onMouseEnter={(e) => e.target.style.color = '#A67C52'}
                              onMouseLeave={(e) => e.target.style.color = '#ccc'}
                              title="點擊標記為已交餐"
                            />
                          )}
                        </td>
                        <td className="fw-bold" style={{ borderColor: '#E8D7C8' }}>{o.OrderNumber}</td>
                        <td style={{ borderColor: '#E8D7C8' }}><small>{o.IDNumber}</small></td>
                        <td style={{ borderColor: '#E8D7C8' }}>{o.CustomerName}</td>
                        <td style={{ borderColor: '#E8D7C8' }}><small>{toDateValue(o.OrderDate)}</small></td>
                        <td style={{ borderColor: '#E8D7C8' }}>
                          <small>
                            {toDateValue(o.ExpectedDeliveryDate)}<br/>
                            {o.ExpectedDeliveryTime ? toTimeValue(o.ExpectedDeliveryTime) : '-'}
                          </small>
                        </td>
                        <td style={{ borderColor: '#E8D7C8' }}>
                          <small>
                            {o.ActualDeliveryDate ? toDateValue(o.ActualDeliveryDate) : '-'}<br/>
                            {o.ActualDeliveryTime ? toTimeValue(o.ActualDeliveryTime) : '-'}
                          </small>
                        </td>
                        <td className="text-center" style={{ borderColor: '#E8D7C8' }}>{o.QtyA || 0}</td>
                        <td className="text-center" style={{ borderColor: '#E8D7C8' }}>{o.QtyB || 0}</td>
                        <td className="text-center" style={{ borderColor: '#E8D7C8' }}>{o.QtyC || 0}</td>
                        <td className="text-end fw-bold" style={{ borderColor: '#E8D7C8', color: '#8B6F47' }}>
                          ${o.OrderAmount}
                        </td>
                        <td style={{ borderColor: '#E8D7C8' }}>
                          <small>{o.SupplierName}<br/>{o.SupplierID}</small>
                        </td>
                        <td style={{ borderColor: '#E8D7C8', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1 mb-1"
                            onClick={() => handleEditClick(o)}
                            style={{ borderColor: '#8B6F47', color: '#8B6F47', padding: '0.25rem 0.4rem', fontSize: '0.875rem' }}
                            title="編輯"
                          >
                            <PencilSquare />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="mb-1"
                            onClick={() => handleDelete(o.OrderNumber)}
                            style={{ borderColor: '#C4A69D', color: '#C4A69D', padding: '0.25rem 0.4rem', fontSize: '0.875rem' }}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrdersPage;