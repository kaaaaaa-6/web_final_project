CREATE VIEW V_CustomerOrders AS
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
FROM CustomerOrderRecord o
JOIN CustomerBasicInfo c ON o.IDNumber = c.IDNumber;
GO
