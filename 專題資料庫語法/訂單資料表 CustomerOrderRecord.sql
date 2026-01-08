CREATE TABLE CustomerOrderRecord (
    OrderNumber          INT IDENTITY(1,1) PRIMARY KEY,  
    IDNumber             CHAR(10)       NOT NULL,        
    OrderDate            DATE           NOT NULL,        
    ExpectedDeliveryDate DATE           NOT NULL,        
    ExpectedDeliveryTime TIME           NOT NULL,        
    ActualDeliveryDate   DATE           NULL,            
    ActualDeliveryTime   TIME           NULL,            

    QtyA                 INT            NOT NULL DEFAULT 0,  
    QtyB                 INT            NOT NULL DEFAULT 0,  
    QtyC                 INT            NOT NULL DEFAULT 0,  

    OrderAmount          DECIMAL(10,2)  NULL,            
    SupplierName         NVARCHAR(50)   NULL,            
    SupplierID           CHAR(6)        NULL,            
    
    CONSTRAINT FK_Order_Customer
        FOREIGN KEY (IDNumber) REFERENCES CustomerBasicInfo(IDNumber)
);
GO