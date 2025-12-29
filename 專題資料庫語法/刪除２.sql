USE [期末專題];
GO

IF OBJECT_ID('sp_DeleteCustomerBasicInfo', 'P') IS NOT NULL
		DROP PROCEDURE sp_DeleteCustomerBasicInfo;
GO

CREATE PROCEDURE sp_DeleteCustomerBasicInfo
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
