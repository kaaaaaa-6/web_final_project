package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"path/filepath"
	"time"

	_ "github.com/microsoft/go-mssqldb"
)

// ===== 資料結構 =====

type Customer struct {
	IDNumber         string    `json:"IDNumber"`
	CustomerName     string    `json:"CustomerName"`
	Phone            *string   `json:"Phone"`
	Address          *string   `json:"Address"`
	RegistrationDate time.Time `json:"RegistrationDate"`
	ConsumptionStatus string   `json:"ConsumptionStatus"`
}

type Order struct {
	OrderNumber        int        `json:"OrderNumber"`
	IDNumber           string     `json:"IDNumber"`
	CustomerName       string     `json:"CustomerName"`
	OrderDate          time.Time  `json:"OrderDate"`
	ExpectedDeliveryDate *time.Time `json:"ExpectedDeliveryDate"`
	ExpectedDeliveryTime *string    `json:"ExpectedDeliveryTime"`
	ActualDeliveryDate   *time.Time `json:"ActualDeliveryDate"`
	ActualDeliveryTime   *string    `json:"ActualDeliveryTime"`
	QtyA               int        `json:"QtyA"`
	QtyB               int        `json:"QtyB"`
	QtyC               int        `json:"QtyC"`
	OrderAmount        float64    `json:"OrderAmount"`
	SupplierName       *string    `json:"SupplierName"`
	SupplierID         *string    `json:"SupplierID"`
}

// ===== 全域變數 =====

var db *sql.DB

// ===== 工具：回傳 JSON =====

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// ===== 客戶 API =====

// GET /api/customers
func handleGetCustomers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT IDNumber, CustomerName, Phone, Address, RegistrationDate, ConsumptionStatus
		FROM CustomerBasicInfo
		ORDER BY RegistrationDate DESC`)
	if err != nil {
		log.Println("Query customers error:", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "取得客戶資料失敗"})
		return
	}
	defer rows.Close()

	var customers []Customer
	for rows.Next() {
		var c Customer
		if err := rows.Scan(
			&c.IDNumber,
			&c.CustomerName,
			&c.Phone,
			&c.Address,
			&c.RegistrationDate,
			&c.ConsumptionStatus,
		); err != nil {
			log.Println("Scan customer error:", err)
			continue
		}
		customers = append(customers, c)
	}

	writeJSON(w, http.StatusOK, customers)
}

// POST /api/customers
func handlePostCustomer(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		IDNumber     string `json:"idnumber"`
		CustomerName string `json:"customerName"`
		Phone        string `json:"phone"`
		Address      string `json:"address"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "無效的請求內容"})
		return
	}

	if body.IDNumber == "" || body.CustomerName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "身分證字號與姓名為必填"})
		return
	}

	_, err := db.Exec(
    `EXEC sp_InsertCustomerBasicInfo 
        @IDNumber = @p1,
        @CustomerName = @p2,
        @Phone = @p3,
        @Address = @p4`,
    body.IDNumber,
    body.CustomerName,
    nullOrString(body.Phone),
    nullOrString(body.Address),
	)
	if err != nil {
		log.Println("Insert customer error:", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "新增客戶失敗"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "新增客戶成功"})
}
type updateCustomerRequest struct {
    IDNumber     string `json:"idnumber"`
    CustomerName string `json:"customerName"`
    Phone        string `json:"phone"`
    Address      string `json:"address"`
	}
func handleUpdateCustomer(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPut {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    var body updateCustomerRequest
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        log.Println("Update customer decode error:", err)
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "請求格式錯誤"})
        return
    }

    log.Println("👉 收到 UPDATE Customer:", body.IDNumber)

    _, err := db.Exec(
        `EXEC sp_UpdateCustomerBasicInfo 
            @IDNumber     = @p1,
            @CustomerName = @p2,
            @Phone        = @p3,
            @Address      = @p4`,
        body.IDNumber,
        body.CustomerName,
        nullOrString(body.Phone),
        nullOrString(body.Address),
    )
    if err != nil {
        log.Println("Update customer error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "修改客戶失敗"})
        return
    }

    writeJSON(w, http.StatusOK, map[string]string{"message": "修改客戶成功"})
}
func handleDeleteCustomer(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodDelete {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    id := r.URL.Query().Get("id")
    if id == "" {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "缺少身分證字號"})
        return
    }

    log.Println("👉 收到 DELETE Customer:", id)

    res, err := db.Exec(
        `EXEC sp_DeleteCustomerBasicInfo @IDNumber = @p1`,
        id,
    )
    if err != nil {
        log.Println("Delete customer error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "刪除客戶失敗，可能已有訂單紀錄"})
        return
    }
	rows, _ := res.RowsAffected()
	log.Println("🧹 刪除客戶 RowsAffected =", rows)
    // writeJSON(w, http.StatusOK, map[string]string{"message": "刪除客戶成功"})
	writeJSON(w, http.StatusOK, map[string]interface{}{
        "message": "刪除客戶成功",
        "rows":    rows,
    })
}
// ===== 訂單 API =====

// GET /api/orders(view調用指令)
func handleGetOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`SELECT 
		OrderNumber, IDNumber, CustomerName,
		OrderDate,
		ExpectedDeliveryDate, ExpectedDeliveryTime,
		ActualDeliveryDate, ActualDeliveryTime,
		QtyA, QtyB, QtyC,
		OrderAmount, SupplierName, SupplierID
		FROM V_CustomerOrders
		ORDER BY OrderDate DESC, OrderNumber DESC`)
	if err != nil {
		log.Println("Query orders error:", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "取得訂單資料失敗"})
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var expTime, actTime sql.NullString
		var expDate, actDate sql.NullTime
		var orderAmount sql.NullFloat64
		if err := rows.Scan(
			&o.OrderNumber,
			&o.IDNumber,
			&o.CustomerName,
			&o.OrderDate,
			&expDate,
			&expTime,
			&actDate,
			&actTime,
			&o.QtyA,
			&o.QtyB,
			&o.QtyC,
			&orderAmount,
			&o.SupplierName,
			&o.SupplierID,
		); err != nil {
			log.Println("Scan order error:", err)
			continue
		}

		if expDate.Valid {
			o.ExpectedDeliveryDate = &expDate.Time
		}
		if expTime.Valid {
			s := expTime.String
			o.ExpectedDeliveryTime = &s
		}
		if actDate.Valid {
			o.ActualDeliveryDate = &actDate.Time
		}
		if actTime.Valid {
			s := actTime.String
			o.ActualDeliveryTime = &s
		}
		if orderAmount.Valid {
			o.OrderAmount = orderAmount.Float64
		}

		orders = append(orders, o)
	}

	writeJSON(w, http.StatusOK, orders)
}

// POST /api/orders
func handlePostOrder(w http.ResponseWriter, r *http.Request) {
	type reqBody struct {
		IDNumber     string `json:"idnumber"`
		OrderDate    string `json:"orderDate"`
		ExpectedDate string `json:"expectedDate"`
		ExpectedTime string `json:"expectedTime"`
		QtyA         int    `json:"qtyA"`
		QtyB         int    `json:"qtyB"`
		QtyC         int    `json:"qtyC"`
		SupplierName string `json:"supplierName"`
		SupplierID   string `json:"supplierID"`
	}

	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "無效的請求內容"})
		return
	}

	if body.IDNumber == "" || body.OrderDate == "" || body.ExpectedDate == "" || body.ExpectedTime == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "客戶、訂餐日期、預計交餐日期/時間為必填"})
		return
	}
	var status string
    err := db.QueryRow(
        `SELECT ConsumptionStatus 
         FROM CustomerBasicInfo
         WHERE IDNumber = @p1`,
        body.IDNumber,
    ).Scan(&status)
	if err == sql.ErrNoRows {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "客戶不存在，無法新增訂單"})
        return
    } else if err != nil {
        log.Println("Check customer status error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "檢查客戶狀態失敗"})
        return
    }

    if status != "Active" {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "此客戶已停用，無法新增訂單"})
        return
    }
	// 呼叫 Stored Procedure sp_InsertCustomerOrder
	_, err = db.Exec(
		`EXEC sp_InsertCustomerOrder
			@IDNumber = @p1,
			@OrderDate = @p2,
			@ExpectedDeliveryDate = @p3,
			@ExpectedDeliveryTime = @p4,
			@QtyA = @p5,
			@QtyB = @p6,
			@QtyC = @p7,
			@SupplierName = @p8,
			@SupplierID = @p9`,
		body.IDNumber,
		body.OrderDate,
		body.ExpectedDate,
		body.ExpectedTime,
		body.QtyA,
		body.QtyB,
		body.QtyC,
		nullOrString(body.SupplierName),
		nullOrString(body.SupplierID),
	)
	if err != nil {
		log.Println("Insert order error:", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "新增訂單失敗"})
		return
	}

	// 金額由 Trigger 自動計算
	writeJSON(w, http.StatusOK, map[string]string{"message": "新增訂單成功"})
}
type updateOrderRequest struct {
    OrderNumber   int    `json:"orderNumber"`
    IDNumber      string `json:"idnumber"`
    OrderDate     string `json:"orderDate"`
    ExpectedDate  string `json:"expectedDate"`
    ExpectedTime  string `json:"expectedTime"`
    QtyA          int    `json:"qtyA"`
    QtyB          int    `json:"qtyB"`
    QtyC          int    `json:"qtyC"`
    SupplierName  string `json:"supplierName"`
    SupplierID    string `json:"supplierID"`
}

func handleUpdateOrder(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPut {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    var body updateOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        log.Println("Update order decode error:", err)
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "請求格式錯誤"})
        return
    }

    log.Println("👉 收到 UPDATE Order:", body.OrderNumber)

    _, err := db.Exec(
        `EXEC sp_UpdateCustomerOrder
            @OrderNumber          = @p1,
            @ExpectedDeliveryDate = @p2,
            @ExpectedDeliveryTime = @p3,
            @QtyA                 = @p4,
            @QtyB                 = @p5,
            @QtyC                 = @p6,
            @SupplierName         = @p7,
            @SupplierID           = @p8`,
        body.OrderNumber,
        body.ExpectedDate,
        body.ExpectedTime,
        body.QtyA,
        body.QtyB,
        body.QtyC,
        nullOrString(body.SupplierName),
        nullOrString(body.SupplierID),
    )
    if err != nil {
        log.Println("Update order error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "修改訂單失敗"})
        return
    }

    writeJSON(w, http.StatusOK, map[string]string{"message": "修改訂單成功"})
}
// DELETE /api/orders/delete?orderNumber=6
func handleDeleteOrder(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodDelete {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    orderNumStr := r.URL.Query().Get("orderNumber")
    if orderNumStr == "" {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "缺少訂單編號"})
        return
    }

    log.Println("👉 收到 DELETE Order:", orderNumStr)

    _, err := db.Exec(
        `EXEC sp_DeleteCustomerOrder @OrderNumber = @p1`,
        orderNumStr, // driver 會幫你轉成 int
    )
    if err != nil {
        log.Println("Delete order error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "刪除訂單失敗"})
        return
    }

    writeJSON(w, http.StatusOK, map[string]string{"message": "刪除訂單成功"})
}
func updateCustomerStatus(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPut {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }

    var payload struct {
        IDNumber string `json:"idnumber"`
        Status   string `json:"status"`
    }

    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        log.Println("updateCustomerStatus decode error:", err)
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "請求格式錯誤"})
        return
    }

    if payload.IDNumber == "" {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "缺少身分證字號"})
        return
    }

    // 只允許改成 Active，不接受其他字串
    if payload.Status != "Active" {
        writeJSON(w, http.StatusBadRequest, map[string]string{"error": "只允許將狀態設為 Active"})
        return
    }

    res, err := db.Exec(`
        UPDATE CustomerBasicInfo
        SET ConsumptionStatus = @p1
        WHERE IDNumber = @p2
    `, payload.Status, payload.IDNumber)
    if err != nil {
        log.Println("updateCustomerStatus DB error:", err)
        writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "更新失敗：" + err.Error()})
        return
    }

    rows, _ := res.RowsAffected()
    log.Println("✅ updateCustomerStatus RowsAffected =", rows)

    writeJSON(w, http.StatusOK, map[string]interface{}{
        "message": "狀態更新成功",
        "rows":    rows,
    })
}

// ===== 小工具：空字串轉 NULL =====

func nullOrString(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// ===== main：初始化 DB + 路由 =====

func main() {
	// 連線字串：依你實際環境調整
	// 例：local SQL Express：
	// connStr := "server=localhost\\SQLEXPRESS;user id=appuser;password=AppUser!12345;database=CustomerOrderDB;encrypt=disable"
	connStr := "server=localhost;port=1433;user id=finaluser;password=user!12345;database=期末專題;encrypt=disable"

	var err error
	db, err = sql.Open("sqlserver", connStr)
	if err != nil {
		log.Fatal("Open DB error:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("Ping DB error:", err)
	}
	log.Println("✅ 已連線到 SQL Server")

	// API: 客戶
	http.HandleFunc("/api/customers", func(w http.ResponseWriter, r *http.Request) {
		// 簡單區分 GET / POST
		if r.Method == http.MethodGet {
			handleGetCustomers(w, r)
		} else if r.Method == http.MethodPost {
			handlePostCustomer(w, r)
		} else {
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
	http.HandleFunc("/api/customers/update", handleUpdateCustomer)

	// API: 訂單
	http.HandleFunc("/api/orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handleGetOrders(w, r)
		} else if r.Method == http.MethodPost {
			handlePostOrder(w, r)
		} else {
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
	http.HandleFunc("/api/orders/update", handleUpdateOrder)
	http.HandleFunc("/api/customers/delete", handleDeleteCustomer)
	http.HandleFunc("/api/orders/delete", handleDeleteOrder)
	http.HandleFunc("/api/customers/status", updateCustomerStatus)

	// 靜態檔案：./public 底下
	publicDir := filepath.Join(".", "public")
	fs := http.FileServer(http.Dir(publicDir))
	http.Handle("/", fs) // 直接讓 / 對應到 public/

	log.Println("🚀 伺服器啟動於 http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe error:", err)
	}
}
