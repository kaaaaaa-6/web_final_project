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
