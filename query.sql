IF DB_ID(N'test') IS NULL
BEGIN
    CREATE DATABASE [test];
END
GO
USE [test];
GO
CREATE TABLE CustomerBasicInfo (
    IDNumber           CHAR(10)       NOT NULL,
    CustomerName       NVARCHAR(50)    NOT NULL,
    Phone              NVARCHAR(20)    NULL,
    Address            NVARCHAR(100)   NULL,
    RegistrationDate   DATE            NOT NULL,
    ConsumptionStatus  NVARCHAR(10)    NOT NULL
);
GO
CREATE TABLE CustomerOrderRecord (
    --- OrderNumber            INT            NOT NULL,
	OrderNumber INT IDENTITY(1,1) NOT NULL,
    IDNumber               CHAR(10)       NOT NULL,
    OrderDate              DATE           NOT NULL,
    ExpectedDeliveryDate   DATE           NOT NULL,
    ExpectedDeliveryTime   TIME(7)        NOT NULL,
    ActualDeliveryDate     DATE           NULL,
    ActualDeliveryTime     TIME(7)        NULL,
    QtyA                   INT            NOT NULL,
    QtyB                   INT            NOT NULL,
    QtyC                   INT            NOT NULL,
    OrderAmount            DECIMAL(10,2)  NULL,
    SupplierName           NVARCHAR(50)   NULL,
    SupplierID             CHAR(6)        NULL
);
GO
CREATE TABLE DeletedCustomerOrderRecord (
    OrderNumber            INT            NOT NULL,
    IDNumber               CHAR(10)       NOT NULL,
    OrderDate              DATE           NOT NULL,
    ExpectedDeliveryDate   DATE           NOT NULL,
    ExpectedDeliveryTime   TIME(7)        NOT NULL,
    ActualDeliveryDate     DATE           NULL,
    ActualDeliveryTime     TIME(7)        NULL,
    QtyA                   INT            NOT NULL,
    QtyB                   INT            NOT NULL,
    QtyC                   INT            NOT NULL,
    OrderAmount            DECIMAL(10,2)  NULL,
    SupplierName           NVARCHAR(50)   NULL,
    SupplierID             CHAR(6)        NULL,
    DeletedAt              DATETIME       NOT NULL
);
GO
CREATE VIEW V_ActiveCustomers
AS
SELECT
    IDNumber,
    CustomerName,
    Phone,
    Address,
    RegistrationDate,
    ConsumptionStatus
FROM dbo.CustomerBasicInfo
WHERE ConsumptionStatus = N'Active';
GO
CREATE VIEW V_CustomerOrders
AS
SELECT
    o.OrderNumber,
    o.IDNumber,
    c.CustomerName,
    o.OrderDate,
    o.ExpectedDeliveryDate,
    o.ExpectedDeliveryTime,
    o.ActualDeliveryDate,
    o.ActualDeliveryTime,
    o.QtyA,
    o.QtyB,
    o.QtyC,
    o.OrderAmount,
    o.SupplierName,
    o.SupplierID
FROM dbo.CustomerOrderRecord AS o
INNER JOIN dbo.CustomerBasicInfo AS c
    ON o.IDNumber = c.IDNumber
WHERE c.ConsumptionStatus = N'Active';

GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_DeleteCustomerBasicInfo]
    @IDNumber CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 如果有訂單，就不允許刪除，避免破壞外鍵
    IF EXISTS (SELECT 1 FROM CustomerOrderRecord WHERE IDNumber = @IDNumber)
    BEGIN
        RAISERROR(N'該客戶已有訂單紀錄，無法刪除', 16, 1);
        RETURN;
    END

    DELETE FROM CustomerBasicInfo
    WHERE IDNumber = @IDNumber;
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_DeleteCustomerOrder]
    @OrderNumber INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM CustomerOrderRecord
    WHERE OrderNumber = @OrderNumber;
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_InsertCustomerBasicInfo]
    @IDNumber      NVARCHAR(10),
    @CustomerName  NVARCHAR(50),
    @Phone         NVARCHAR(20) = NULL,
    @Address       NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CustomerBasicInfo (
        IDNumber,
        CustomerName,
        Phone,
        Address,
        RegistrationDate,
        ConsumptionStatus
    )
    VALUES (
        @IDNumber,
        @CustomerName,
        @Phone,
        @Address,
        CONVERT(date, GETDATE()),
        N'Active'
    );
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_InsertCustomerOrder]
    @IDNumber             CHAR(10),
    @OrderDate            DATE,
    @ExpectedDeliveryDate DATE,
    @ExpectedDeliveryTime TIME,
    @QtyA                 INT,
    @QtyB                 INT,
    @QtyC                 INT,
    @SupplierName         NVARCHAR(50),
    @SupplierID           CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CustomerOrderRecord (
        IDNumber,
        OrderDate, ExpectedDeliveryDate, ExpectedDeliveryTime,
        QtyA, QtyB, QtyC,
        SupplierName, SupplierID
    )
    VALUES (
        @IDNumber,
        @OrderDate, @ExpectedDeliveryDate, @ExpectedDeliveryTime,
        @QtyA, @QtyB, @QtyC,
        @SupplierName, @SupplierID
    );
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_UpdateCustomerBasicInfo]
    @IDNumber      CHAR(10),        
    @CustomerName  NVARCHAR(50),
    @Phone         NVARCHAR(20) = NULL,
    @Address       NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CustomerBasicInfo
    SET CustomerName = @CustomerName,
        Phone        = @Phone,
        Address      = @Address
    WHERE IDNumber = @IDNumber;
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[sp_UpdateCustomerOrder]
    @OrderNumber          INT,           -- PK
    @ExpectedDeliveryDate DATE,
    @ExpectedDeliveryTime TIME,
    @QtyA                 INT,
    @QtyB                 INT,
    @QtyC                 INT,
    @SupplierName         NVARCHAR(50) = NULL,
    @SupplierID           CHAR(6) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE CustomerOrderRecord
    SET ExpectedDeliveryDate = @ExpectedDeliveryDate,
        ExpectedDeliveryTime = @ExpectedDeliveryTime,
        QtyA = @QtyA,
        QtyB = @QtyB,
        QtyC = @QtyC,
        SupplierName = @SupplierName,
        SupplierID   = @SupplierID
    WHERE OrderNumber = @OrderNumber;
END;
GO



SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE PROCEDURE [dbo].[usp_DeleteCustomerBasicInfo]
    @IDNumber NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 先刪訂單（如果有）
    DELETE FROM CustomerOrderRecord
    WHERE IDNumber = @IDNumber;

    -- 再刪客戶本身
    DELETE FROM CustomerBasicInfo
    WHERE IDNumber = @IDNumber;
END;
GO
CREATE TRIGGER TR_Customer_SoftDelete
ON CustomerBasicInfo
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE c
    SET ConsumptionStatus = N'Inactive'
    FROM CustomerBasicInfo c
    JOIN deleted d ON c.IDNumber = d.IDNumber;
END;
GO
CREATE TRIGGER TR_Order_CalcAmount
ON CustomerOrderRecord
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE o
    SET o.OrderAmount = i.QtyA * 100
                       + i.QtyB * 150
                       + i.QtyC * 200
    FROM CustomerOrderRecord o
    JOIN inserted i
      ON o.OrderNumber = i.OrderNumber;
END;
GO