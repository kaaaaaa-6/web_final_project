UPDATE CustomerBasicInfo
SET Phone = N'0988123456',
    Address = N'臺中市西屯區...'
WHERE IDNumber = 'A123456789';
DELETE FROM CustomerBasicInfo
WHERE IDNumber = 'A123456789';