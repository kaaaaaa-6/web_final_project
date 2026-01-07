CREATE TRIGGER TR_Order_DeleteToBackup
ON CustomerOrderRecord
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO DeletedCustomerOrderRecord (
        OrderNumber, IDNumber, OrderDate,
        ExpectedDeliveryDate, ExpectedDeliveryTime,
        ActualDeliveryDate,   ActualDeliveryTime,
        QtyA, QtyB, QtyC,
        OrderAmount, SupplierName, SupplierID
    )
    SELECT
        d.OrderNumber, d.IDNumber, d.OrderDate,
        d.ExpectedDeliveryDate, d.ExpectedDeliveryTime,
        d.ActualDeliveryDate,   d.ActualDeliveryTime,
        d.QtyA, d.QtyB, d.QtyC,
        d.OrderAmount, d.SupplierName, d.SupplierID
    FROM deleted d;
END;
GO
