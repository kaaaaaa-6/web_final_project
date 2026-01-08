USE [期末專題];
GO

IF OBJECT_ID('dbo.V_CustomerOrders', 'V') IS NOT NULL
    DROP VIEW dbo.V_CustomerOrders;
GO

CREATE VIEW dbo.V_CustomerOrders
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
FROM CustomerOrderRecord AS o
JOIN CustomerBasicInfo AS c
    ON o.IDNumber = c.IDNumber
WHERE c.ConsumptionStatus = N'Active';   -- ⭐ 只顯示啟用中的客戶
GO
