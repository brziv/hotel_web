-- Table: tbl_Bookings
INSERT INTO [dbo].[tbl_Bookings] (b_BookingID, b_GuestID, b_BookingStatus, b_TotalMoney, b_Deposit, b_CreatedAt)
VALUES
    -- Room 101
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 600.00, 100.00, '2025-04-01 00:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Paid', 750.00, 150.00, '2025-04-02 06:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Cancelled', 0.00, 120.00, '2025-04-04 00:00:00'),
    -- Room 102
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Pending', 0.00, 140.00, '2025-04-01 02:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 690.00, 135.00, '2025-04-02 12:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Paid', 720.00, 140.00, '2025-04-04 06:00:00'),
    -- Room 103
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Cancelled', 0.00, 130.00, '2025-04-01 04:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Pending', 0.00, 145.00, '2025-04-02 18:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 660.00, 125.00, '2025-04-04 12:00:00'),
    -- Room 104
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Paid', 740.00, 150.00, '2025-04-01 06:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Cancelled', 0.00, 135.00, '2025-04-03 00:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Pending', 0.00, 140.00, '2025-04-04 18:00:00'),
    -- Room 105
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 670.00, 130.00, '2025-04-01 08:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Paid', 760.00, 150.00, '2025-04-03 06:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Cancelled', 0.00, 140.00, '2025-04-05 00:00:00'),
    -- Room 201
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Pending', 0.00, 145.00, '2025-04-01 10:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 680.00, 135.00, '2025-04-03 12:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Paid', 730.00, 145.00, '2025-04-05 06:00:00'),
    -- Room 301
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Cancelled', 0.00, 125.00, '2025-04-01 12:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Pending', 0.00, 140.00, '2025-04-03 18:00:00'),
    (NEWID(), '33461d3b-259a-4103-bf64-5b53846a13d3', 'Confirmed', 650.00, 130.00, '2025-04-05 12:00:00');

-- Table: tbl_BookingRooms
INSERT INTO [dbo].[tbl_BookingRooms] (br_ID, br_BookingID, br_RoomID, br_CheckInDate, br_CheckOutDate)
SELECT NEWID(), b_BookingID, 'C9B13D0C-06BB-40B3-8C30-7A8F894FF83B', '2025-04-01 00:00:00', '2025-04-02 00:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 00:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'C9B13D0C-06BB-40B3-8C30-7A8F894FF83B', '2025-04-02 06:00:00', '2025-04-03 18:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-02 06:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'C9B13D0C-06BB-40B3-8C30-7A8F894FF83B', '2025-04-04 00:00:00', '2025-04-05 12:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-04 00:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'A179F05A-3DCB-40BB-9AEE-1AE1B34E8184', '2025-04-01 02:00:00', '2025-04-02 02:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 02:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'A179F05A-3DCB-40BB-9AEE-1AE1B34E8184', '2025-04-02 12:00:00', '2025-04-04 00:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-02 12:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'A179F05A-3DCB-40BB-9AEE-1AE1B34E8184', '2025-04-04 06:00:00', '2025-04-05 18:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-04 06:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '43A40E77-B4E6-4023-9B0A-58AC0A5E1CBF', '2025-04-01 04:00:00', '2025-04-02 04:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 04:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '43A40E77-B4E6-4023-9B0A-58AC0A5E1CBF', '2025-04-02 18:00:00', '2025-04-04 06:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-02 18:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '43A40E77-B4E6-4023-9B0A-58AC0A5E1CBF', '2025-04-04 12:00:00', '2025-04-06 00:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-04 12:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'B19DA686-E982-4B78-8A06-4F16D9FF3777', '2025-04-01 06:00:00', '2025-04-02 06:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 06:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'B19DA686-E982-4B78-8A06-4F16D9FF3777', '2025-04-03 00:00:00', '2025-04-04 12:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-03 00:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'B19DA686-E982-4B78-8A06-4F16D9FF3777', '2025-04-04 18:00:00', '2025-04-06 06:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-04 18:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '86C9A92E-A0C8-464A-884C-49E7844BD06D', '2025-04-01 08:00:00', '2025-04-02 08:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 08:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '86C9A92E-A0C8-464A-884C-49E7844BD06D', '2025-04-03 06:00:00', '2025-04-04 18:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-03 06:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '86C9A92E-A0C8-464A-884C-49E7844BD06D', '2025-04-05 00:00:00', '2025-04-06 12:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-05 00:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'F391FFE9-8168-40FB-BAE4-FAEC64E310EC', '2025-04-01 10:00:00', '2025-04-02 10:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 10:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'F391FFE9-8168-40FB-BAE4-FAEC64E310EC', '2025-04-03 12:00:00', '2025-04-05 00:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-03 12:00:00'
UNION ALL SELECT NEWID(), b_BookingID, 'F391FFE9-8168-40FB-BAE4-FAEC64E310EC', '2025-04-05 06:00:00', '2025-04-06 18:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-05 06:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '9F7BD1B8-BE28-494F-897E-DD68508027C0', '2025-04-01 12:00:00', '2025-04-02 12:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-01 12:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '9F7BD1B8-BE28-494F-897E-DD68508027C0', '2025-04-03 18:00:00', '2025-04-05 06:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-03 18:00:00'
UNION ALL SELECT NEWID(), b_BookingID, '9F7BD1B8-BE28-494F-897E-DD68508027C0', '2025-04-05 12:00:00', '2025-04-07 00:00:00' FROM [dbo].[tbl_Bookings] WHERE b_CreatedAt = '2025-04-05 12:00:00';

-- Table: tbl_BookingServices
INSERT INTO [dbo].[tbl_BookingServices] (bs_ID, bs_BookingID, bs_ServiceID, bs_Quantity, bs_CreatedAt)
SELECT NEWID(), b_BookingID, '62899db3-c97b-4625-9981-4a0244913c6a', 1, b_CreatedAt FROM [dbo].[tbl_Bookings] 
WHERE b_BookingStatus = 'Confirmed' AND b_CreatedAt IN ('2025-04-01 00:00:00', '2025-04-02 12:00:00', '2025-04-04 12:00:00', '2025-04-01 08:00:00', '2025-04-03 12:00:00', '2025-04-06 16:00:00')
UNION ALL
SELECT NEWID(), b_BookingID, 'e6e2396d-cedd-4b74-9c0d-8fbe67bd68e2', 2, b_CreatedAt FROM [dbo].[tbl_Bookings] 
WHERE b_BookingStatus = 'Confirmed' AND b_CreatedAt IN ('2025-04-01 00:00:00', '2025-04-02 12:00:00', '2025-04-04 12:00:00', '2025-04-01 08:00:00', '2025-04-03 12:00:00', '2025-04-06 16:00:00')
UNION ALL
SELECT NEWID(), b_BookingID, '93636007-1c95-43ee-971a-a20ece759f9e', 3, b_CreatedAt FROM [dbo].[tbl_Bookings] 
WHERE b_BookingStatus = 'Confirmed' AND b_CreatedAt IN ('2025-04-01 00:00:00', '2025-04-02 12:00:00', '2025-04-04 12:00:00', '2025-04-01 08:00:00', '2025-04-03 12:00:00', '2025-04-06 16:00:00');

-- Table: tbl_Payments
INSERT INTO [dbo].[tbl_Payments] (p_PaymentID, p_BookingID, p_AmountPaid, p_PaymentDate, p_PaymentMethod)
SELECT 
    NEWID(), 
    b.b_BookingID, 
    b.b_TotalMoney, 
    br.br_CheckOutDate, 
    'Cash'
FROM [dbo].[tbl_Bookings] b
JOIN [dbo].[tbl_BookingRooms] br ON b.b_BookingID = br.br_BookingID
WHERE b.b_BookingStatus = 'Paid'

UNION ALL
SELECT 
    NEWID(), 
    b.b_BookingID, 
    b.b_Deposit, 
    br.br_CheckOutDate, 
    'Cash'
FROM [dbo].[tbl_Bookings] b
JOIN [dbo].[tbl_BookingRooms] br ON b.b_BookingID = br.br_BookingID
WHERE b.b_BookingStatus IN ('Pending', 'Cancelled');