CREATE PROCEDURE sp_InsertCustomerBasicInfo
    @IDNumber         CHAR(10),
    @CustomerName     NVARCHAR(50),
    @Phone            NVARCHAR(20) = NULL,
    @Address          NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CustomerBasicInfo (
        IDNumber, CustomerName, Phone, Address
    )
    VALUES (
        @IDNumber, @CustomerName, @Phone, @Address
    );
END;
GO