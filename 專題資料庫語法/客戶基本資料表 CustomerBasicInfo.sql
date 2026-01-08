CREATE TABLE CustomerBasicInfo (
    IDNumber         CHAR(10)       NOT NULL PRIMARY KEY,   
    CustomerName     NVARCHAR(50)   NOT NULL,               
    Phone            NVARCHAR(20)   NULL,                  
    Address          NVARCHAR(100)  NULL,                   
    RegistrationDate DATE           NOT NULL DEFAULT GETDATE(), 
    ConsumptionStatus NVARCHAR(10)  NOT NULL DEFAULT N'Active'   
);
GO