IF OBJECT_ID('sp_DeleteCustomerOrder', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteCustomerOrder;
GO

CREATE PROCEDURE sp_DeleteCustomerOrder
    @OrderNumber INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM CustomerOrderRecord
    WHERE OrderNumber = @OrderNumber;
END;
GO
