CREATE PROCEDURE sp_InsertCustomerOrder
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
