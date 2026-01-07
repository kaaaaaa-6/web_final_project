USE [期末專題];
GO

IF OBJECT_ID('dbo.sp_InsertCustomerBasicInfo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_InsertCustomerBasicInfo;
GO

CREATE PROCEDURE dbo.sp_InsertCustomerBasicInfo
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
        ConsumptionStatus          -- 這裡明寫
    )
    VALUES (
        @IDNumber,
        @CustomerName,
        @Phone,
        @Address,
        CONVERT(date, GETDATE()),  -- 今天
        N'Active'                  -- 新增客戶一律 Active
    );
END;
GO
