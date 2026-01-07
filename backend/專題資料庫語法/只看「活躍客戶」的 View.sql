CREATE VIEW V_ActiveCustomers AS
SELECT
    IDNumber,
    CustomerName,
    Phone,
    Address,
    RegistrationDate,
    ConsumptionStatus
FROM CustomerBasicInfo
WHERE ConsumptionStatus = N'Active';
GO