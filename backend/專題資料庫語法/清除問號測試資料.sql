-- 清除所有包含問號 (?) 的測試資料
-- 此腳本會從資料庫中刪除所有客戶名稱、地址、電話等欄位包含問號的資料

USE [期末專題];
GO

-- 第一步：刪除包含問號的客戶的所有訂單
DELETE FROM CustomerOrderRecord 
WHERE IDNumber IN (
    SELECT IDNumber 
    FROM CustomerBasicInfo 
    WHERE CustomerName LIKE '%?%' 
       OR Phone LIKE '%?%' 
       OR Address LIKE '%?%'
);
GO

-- 第二步：刪除包含問號的客戶基本資料
DELETE FROM CustomerBasicInfo 
WHERE CustomerName LIKE '%?%' 
   OR Phone LIKE '%?%' 
   OR Address LIKE '%?%';
GO

-- 驗證：查看還有多少包含問號的資料
SELECT COUNT(*) AS '包含問號的客戶數' 
FROM CustomerBasicInfo 
WHERE CustomerName LIKE '%?%' 
   OR Phone LIKE '%?%' 
   OR Address LIKE '%?%';
GO

SELECT COUNT(*) AS '包含問號的訂單數' 
FROM CustomerOrderRecord 
WHERE IDNumber IN (
    SELECT IDNumber 
    FROM CustomerBasicInfo 
    WHERE CustomerName LIKE '%?%' 
       OR Phone LIKE '%?%' 
       OR Address LIKE '%?%'
);
GO

-- 完成提示
PRINT '✅ 清除完成！所有包含問號的測試資料已刪除。';
