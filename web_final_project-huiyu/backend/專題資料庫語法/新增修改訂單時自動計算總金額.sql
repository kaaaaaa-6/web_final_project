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