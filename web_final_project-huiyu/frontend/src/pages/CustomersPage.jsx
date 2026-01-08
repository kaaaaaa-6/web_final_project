import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Form, Button, Table, Card, Badge, 
  InputGroup, Spinner, OverlayTrigger, Tooltip, Toast, ToastContainer, Breadcrumb 
} from 'react-bootstrap';
import { Trash, PencilSquare, PlusCircle, Save, CheckCircle, ClipboardData, Search, Check, XCircle} from 'react-bootstrap-icons';


const API_BASE_URL = "http://localhost:8080/api/customers";

const CustomersPage = () => {
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false); //  Loading 狀態
  const [error, setError] = useState(null);      //  錯誤訊息處理
  const [successMsg, setSuccessMsg] = useState('');

  // 搜尋與排序篩選狀態
  const [filterStatus, setFilterStatus] = useState('Active');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: 'success', text: '' });

  // 封裝顯示 Toast 的函式
  const showNotify = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
  };

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
      showNotify('danger', '無法連線到伺服器');
    } finally {
      setLoading(false);
    }
  };



  //Event Handlers 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 輸入清理與限制
    if (name === 'idNumber') {
      const cleaned = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 10);
      setFormData(prev => ({ ...prev, idNumber: cleaned }));
      return;
    }

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10); // 最多 10 位
      setFormData(prev => ({ ...prev, phone: digitsOnly }));
      return;
    }

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

    // 進階格式驗證
    const idPattern = /^[A-Z][0-9]{9}$/; // 1 英文字 + 9 位數字
    const phonePattern = /^[0-9]{8,10}$/; 

    if (!idPattern.test(formData.idNumber)) {
      setError('身分證格式需為 1 英文字 + 9 位數字');
      return;
    }

    if (formData.phone && !phonePattern.test(formData.phone)) {
      setError('電話號碼需為 8~10 位數字');
      return;
    }

    // 檢查是否有重複身分證（新增時）
    if (!isEditing) {
      const exists = customers.some(
        (c) => (c.IDNumber || '').toUpperCase() === formData.idNumber.toUpperCase()
      );
      if (exists) {
        setError('此身分證已存在，無法新增。');
        return;
      }
    }

    const url = isEditing ? `${API_BASE_URL}/update` : API_BASE_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // 注意後端欄位對應
      });
      let result = null;
      try {
        result = await res.json();
      } catch (_) {
        // 無法解析 JSON，保持為 null
      }

      if (!res.ok) {
        if (res.status === 409) {
          showNotify('danger', '身分證已存在，無法新增。');
          // setError('身分證已存在，無法新增。');
        } else {
          showNotify('danger', '操作失敗');
        }
        return;
      }

      if (result && result.error) {
        setError(result.error);
        return;
      }

      showNotify('success', isEditing ? '修改成功！' : '新增成功！');
      fetchCustomers(); // 重新整理列表
      resetForm();
    } catch (err) {
      showNotify('danger', '系統錯誤：' + err.message);
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
      const res = await fetch(`${API_BASE_URL}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idnumber: id, status: newStatus })
      });
      const result = await res.json();
      if(result.error) throw new Error(result.error);
      
      // setSuccessMsg(newStatus === 'Active' ? '啟用成功' : '停用成功');
      const msg = currentStatus === 'Active' ? '客戶已停用' : '客戶已啟用';
      showNotify('success', msg);
      fetchCustomers();
    } catch(err) {
      showNotify('danger', '狀態更新失敗: ' + err.message);
    }
  };

  //處理排序點擊===========
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // 顯示排序指標 (小圖示)===========
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fa-solid fa-sort ms-1 opacity-25"></i>;
    } 
    return sortConfig.direction === 'asc' 
      ? <i className="fa-solid fa-sort-up ms-1 text-primary"></i> 
      : <i className="fa-solid fa-sort-down ms-1 text-primary"></i>;
  };

  //資料篩選 + 排序===========
  const filteredCustomers = customers
  .filter(c => {
    const matchStatus = filterStatus === 'All' || c.ConsumptionStatus === filterStatus;
    const matchSearch = 
      (c.IDNumber && c.IDNumber.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (c.CustomerName && c.CustomerName.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchStatus && matchSearch;
  })
  .sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valA = (a[sortConfig.key] || "").toString();
    const valB = (b[sortConfig.key] || "").toString();

    if (sortConfig.direction === 'asc') {
      return valA.localeCompare(valB, 'zh-Hant');
    } else {
      return valB.localeCompare(valA, 'zh-Hant');
    }
  });


  //Render 畫面===========
  return (
    <Container className="py-5">
      {/* 麵包屑導航 */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">首頁</Breadcrumb.Item>
        <Breadcrumb.Item active>客戶管理</Breadcrumb.Item>
      </Breadcrumb>

      {/* Toast 容器 (固定在右上角) */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          bg={toastMessage.type} 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">系統通知</strong>
          </Toast.Header>
          <Toast.Body className={['danger', 'success', 'primary'].includes(toastMessage.type) ? 'text-white' : ''}>
            {toastMessage.text}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: 'var(--brand-1)', fontWeight: '700' }}>客戶管理</h1>
        <Button variant="outline-secondary" href="/" style={{ borderColor: 'var(--brand-1)', color: 'var(--brand-1)', fontWeight: '600' }}>← 回首頁</Button>
      </div>

      {/* 訊息提示區
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>} */}

      <Row className="g-4">
        {/* 左側：表單區域 */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0 border-top-brand">
            <Card.Header className="bg-gradient-brand" style={{ color: 'white', fontWeight: '600' }}>
              {isEditing ? <><PencilSquare className="me-2" />編輯客戶資料</> : <><PlusCircle className="me-2" />新增客戶</>}
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--brand-bg-soft)' }}>
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
                    maxLength={10}
                    pattern="^[A-Za-z][0-9]{9}$"
                    title="身分證格式：1 英文字 + 9 位數字"
                    style={{ borderColor: 'var(--brand-accent)' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    身分證格式需為 1 英文字 + 9 位數字
                  </Form.Control.Feedback>
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
                    style={{ borderColor: 'var(--brand-accent)' }}
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
                    inputMode="numeric"
                    pattern="^[0-9]{8,10}$"
                    maxLength={10}
                    title="電話號碼需為 8~10 位數字"
                    style={{ borderColor: 'var(--brand-accent)' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    電話號碼需為 8~10 位數字
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '600', color: '#8B6F47' }}>地址</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="address"
                    value={formData.address} 
                    onChange={handleInputChange}
                    placeholder="請輸入地址"
                    style={{ borderColor: 'var(--brand-accent)' }}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="bg-gradient-brand"
                    style={{ border: 'none', fontWeight: '600' }}
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
          <Card className="shadow-sm border-0 border-top-brand-2">
            <Card.Header className="bg-gradient-brand" style={{ color: 'white', fontWeight: '600' }}>
              <ClipboardData className="me-2" />客戶列表
            </Card.Header>
            <Card.Body style={{ backgroundColor: 'var(--brand-bg-soft)' }}>
              {/* 搜尋與篩選 */}
              <Row className="mb-4 align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--brand-accent)' }}>
                      <Search style={{ color: 'var(--brand-1)' }} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="搜尋身分證或姓名..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      style={{ borderColor: 'var(--brand-accent)' }}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} className="text-md-end mt-2 mt-md-0">
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    className="me-2"
                    onClick={() => setFilterStatus('Active')}
                    style={filterStatus === 'Active' 
                      ? { background: 'var(--brand-2) ', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
                  >Active</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    className="me-2"
                    onClick={() => setFilterStatus('Inactive')}
                    style={filterStatus === 'Inactive' 
                      ? { background: 'var(--brand-2)', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
                  >Inactive</Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm"
                    onClick={() => setFilterStatus('All')}
                    style={filterStatus === 'All' 
                      ? { background: 'var(--brand-2)', border: 'none', color: '#fff' }
                      : { borderColor: 'var(--brand-1)', color: 'var(--brand-1)', backgroundColor: 'transparent' }}
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
                  <Table hover bordered className="mb-0 customers-table" style={{ borderColor: 'var(--brand-muted)', tableLayout: 'fixed' }}>
                    <thead style={{ background: '#7D5E42', color: 'white', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {/* 使用品牌深色漸層 */}
                      
                      <tr>
                        <th 
                        style={{ borderColor: 'var(--brand-muted)', width: '15%', cursor: 'pointer' }}
                        onClick={() => requestSort('IDNumber')}
                      >
                        身分證{getSortIndicator('IDNumber')}
                        </th>
                        <th 
                          style={{ borderColor: 'var(--brand-muted)', width: '12%', cursor: 'pointer' }}
                          onClick={() => requestSort('CustomerName')}
                        >
                          姓名{getSortIndicator('CustomerName')}
                        </th>
                        <th 
                          style={{ borderColor: 'var(--brand-muted)', width: '15%', cursor: 'pointer' }}
                          onClick={() => requestSort('Phone')}
                        >
                          電話{getSortIndicator('Phone')}
                        </th>
                        <th 
                          style={{ borderColor: 'var(--brand-muted)', width: '30%', cursor: 'pointer' }}
                          onClick={() => requestSort('Address')}
                        >
                          地址 {getSortIndicator('Address')}
                        </th>
                        <th className="status-col" style={{ borderColor: 'var(--brand-muted)', width: '13%' }}>狀態</th>
                        <th style={{ borderColor: 'var(--brand-muted)', textAlign: 'center', width: '12%' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((c) => (
                      <tr key={c.IDNumber} style={{ opacity: c.ConsumptionStatus === 'Inactive' ? 0.6 : 1, borderBottomColor: 'var(--brand-muted)' }}>
                            <td style={{ borderColor: 'var(--brand-muted)' }}>{c.IDNumber}</td>
                            <td style={{ borderColor: 'var(--brand-muted)' }}>{c.CustomerName}</td>
                            <td style={{ borderColor: 'var(--brand-muted)' }}>{c.Phone}</td>
                            <td style={{ borderColor: 'var(--brand-muted)' }}>{c.Address}</td>
                            <td style={{ borderColor: '#E8D7C8' }}>
                              <Badge 
                                className="status-badge"
                                style={{ 
                                  background: c.ConsumptionStatus === 'Active' 
                                    ? 'var(--brand-2)' 
                                    : 'var(--brand-gray)',
                                  fontWeight: '600',
                                  borderRadius: '20px'
                                }}
                              >
                                {c.ConsumptionStatus === 'Active' ? <><CheckCircle className="me-1" />活躍</> : <><XCircle className="me-1" />停用</>}
                              </Badge>
                            </td>
                            <td className="actions-col" style={{ borderColor: 'var(--brand-muted)', textAlign: 'center' }}>
                              <OverlayTrigger placement="top" overlay={<Tooltip>修改客戶資料</Tooltip>}>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary" 
                                  className="me-1 mb-1"
                                  onClick={() => handleEdit(c)}
                                  style={{ borderColor: 'var(--brand-1)', color: 'var(--brand-1)', padding: '0.25rem 0.5rem' }}
                                >
                                  <PencilSquare />
                                </Button>
                              </OverlayTrigger>

                              {c.ConsumptionStatus === 'Active' ? (
                                <OverlayTrigger placement="top" overlay={<Tooltip>停用此客戶</Tooltip>}>
                                  <Button 
                                    size="sm" 
                                    variant="outline-danger"
                                    className="mb-1"
                                    onClick={() => handleToggleStatus(c.IDNumber, c.ConsumptionStatus)}
                                    style={{ color: 'var(--brand-danger-outline)', padding: '0.25rem 0.5rem' }}
                                  >
                                    <XCircle />
                                  </Button>
                                </OverlayTrigger>
                              ) : (
                                <OverlayTrigger placement="top" overlay={<Tooltip>重新啟用客戶</Tooltip>}>
                                  <Button 
                                    size="sm" 
                                    variant="outline-success" 
                                    className="mb-1"
                                    onClick={() => handleToggleStatus(c.IDNumber, c.ConsumptionStatus)}
                                    style={{ borderColor: 'var(--brand-1)', color: 'var(--brand-1)', padding: '0.25rem 0.5rem' }}
                                  >
                                    <CheckCircle />
                                  </Button>
                                </OverlayTrigger>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4" style={{ color: 'var(--brand-1)', fontWeight: '500' }}>
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