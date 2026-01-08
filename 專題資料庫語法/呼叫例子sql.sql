EXEC sp_InsertCustomerOrder
    @IDNumber             = 'A123456789',
    @OrderDate            = '2024-12-07',
    @ExpectedDeliveryDate = '2024-12-08',
    @ExpectedDeliveryTime = '12:00',
    @QtyA = 1,
    @QtyB = 2,
    @QtyC = 0,
    @SupplierName = N'JOKER',
    @SupplierID   = '000001';