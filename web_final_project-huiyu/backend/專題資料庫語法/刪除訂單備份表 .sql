CREATE TABLE DeletedCustomerOrderRecord (
    OrderNumber          INT           NOT NULL,
    IDNumber             CHAR(10)      NOT NULL,
    OrderDate            DATE          NOT NULL,
    ExpectedDeliveryDate DATE          NOT NULL,
    ExpectedDeliveryTime TIME          NOT NULL,
    ActualDeliveryDate   DATE          NULL,
    ActualDeliveryTime   TIME          NULL,
    QtyA                 INT           NOT NULL,
    QtyB                 INT           NOT NULL,
    QtyC                 INT           NOT NULL,
    OrderAmount          DECIMAL(10,2) NULL,
    SupplierName         NVARCHAR(50)  NULL,
    SupplierID           CHAR(6)       NULL,
    DeletedAt            DATETIME      NOT NULL DEFAULT GETDATE()
);
GO