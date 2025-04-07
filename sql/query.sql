-- Table: tbl_Guests
CREATE TABLE tbl_Guests (
    g_GuestID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    g_FirstName NVARCHAR(50) NOT NULL,
    g_LastName NVARCHAR(50) NOT NULL,
    g_Email NVARCHAR(100) UNIQUE,
    g_PhoneNumber NVARCHAR(15) NOT NULL
);
go
CREATE TABLE tbl_Floors (
    f_FloorID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    f_Floor NVARCHAR(10) NOT NULL
);
-- Table: tbl_Rooms
go
CREATE TABLE tbl_Rooms (
    r_RoomID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    r_RoomNumber NVARCHAR(10) UNIQUE NOT NULL,
    r_FloorID UNIQUEIDENTIFIER NOT NULL,
    r_RoomType NVARCHAR(50) NOT NULL,
    r_PricePerHour DECIMAL(10,2) NOT NULL,
    r_Status NVARCHAR(20) NOT NULL,
    FOREIGN KEY (r_FloorID) REFERENCES tbl_Floors(f_FloorID),
	CONSTRAINT chk_PricePerHour CHECK (r_PricePerHour >= 0),
    CONSTRAINT chk_RoomStatus CHECK (r_Status IN ('Available', 'Occupied'))
);
go
-- Table: tbl_Bookings
CREATE TABLE tbl_Bookings (
    b_BookingID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    b_GuestID UNIQUEIDENTIFIER NOT NULL,
    b_BookingStatus NVARCHAR(20) NOT NULL,--Pending, Confirmed, Paid, Cancelled
	b_TotalMoney DECIMAL(10,2) DEFAULT 0,
	b_Deposit DECIMAL(10,2),
    b_CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (b_GuestID) REFERENCES tbl_Guests(g_GuestID)
);
go
CREATE TABLE tbl_BookingRooms (
	br_BookingRoomsID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),  
    br_BookingID UNIQUEIDENTIFIER NOT NULL,
    br_RoomID UNIQUEIDENTIFIER NOT NULL,    
	br_CheckInDate DATETIME NOT NULL,
    br_CheckOutDate DATETIME NOT NULL,
    FOREIGN KEY (br_BookingID) REFERENCES tbl_Bookings(b_BookingID),
    FOREIGN KEY (br_RoomID) REFERENCES tbl_Rooms(r_RoomID),
	CONSTRAINT chk_CheckOutDate CHECK (br_CheckOutDate > br_CheckInDate)
);
go
-- Table: tbl_Payments
CREATE TABLE tbl_Payments (
    p_PaymentID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    p_BookingID UNIQUEIDENTIFIER NOT NULL,
    p_AmountPaid DECIMAL(10,2) NOT NULL,
    p_PaymentMethod NVARCHAR(50) NOT NULL,--cash, visa, 
	p_PaymentDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (p_BookingID) REFERENCES tbl_Bookings(b_BookingID)
);
go
-- Table: tbl_Employees
CREATE TABLE tbl_Employees (
    e_EmployeeID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    e_FirstName NVARCHAR(50) NOT NULL,
    e_LastName NVARCHAR(50) NOT NULL,
    e_Email NVARCHAR(100) UNIQUE NOT NULL,
    e_PhoneNumber NVARCHAR(15),
    e_Position NVARCHAR(50) NOT NULL,
    e_Salary DECIMAL(10,2) NOT NULL
);
go
-- Table: tbl_Services
CREATE TABLE tbl_Services (
    s_ServiceID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    s_ServiceName NVARCHAR(100) NOT NULL,
    s_ServiceCostPrice DECIMAL(10,2) NOT NULL,
	s_ServiceSellPrice DECIMAL(10,2) NOT NULL,
	CONSTRAINT chk_ServicePrice CHECK (s_ServiceSellPrice >= 0 AND s_ServiceCostPrice >= 0)
);
go
-- Table: tbl_BookingServices (For additional services booked)
CREATE TABLE tbl_BookingServices (                                       
	bs_BookingServicesID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    bs_BookingID UNIQUEIDENTIFIER NOT NULL,
    bs_ServiceID UNIQUEIDENTIFIER NOT NULL,
    bs_Quantity INT NOT NULL,
	bs_CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bs_BookingID) REFERENCES tbl_Bookings(b_BookingID),
    FOREIGN KEY (bs_ServiceID) REFERENCES tbl_Services(s_ServiceID)
);

go
CREATE TABLE tbl_Partner (
    p_PartnerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),  
    p_PartnerName NVARCHAR(255) NOT NULL,         
    p_PartnerType NVARCHAR(100),                  -- Type of partner (e.g., Travel Agency, Supplier...)
    p_PhoneNumber NVARCHAR(15) NOT NULL,                   
    p_Email NVARCHAR(255) UNIQUE,             
    p_Address NVARCHAR(50)                           
);

go
CREATE TABLE tbl_Goods (
    g_GoodsID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),  
    g_GoodsName NVARCHAR(255) NOT NULL,         
    g_Category NVARCHAR(100),                   
    g_Quantity INT DEFAULT 0,                  
    g_Unit NVARCHAR(30),                        --a bottle, a case, a pack...
	g_CostPrice DECIMAL(10,2) NOT NULL,
	g_SellingPrice DECIMAL(10,2) NOT NULL,
	g_Currency NVARCHAR(30) NOT NULL                      ---- USD,USD                         
);
go
CREATE TABLE tbl_ServiceGoods (
	sg_ServiceGoodsID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),  
    sg_ServiceID UNIQUEIDENTIFIER NOT NULL,
    sg_GoodsID UNIQUEIDENTIFIER NOT NULL,
    sg_Quantity INT NOT NULL,
    FOREIGN KEY (sg_ServiceID) REFERENCES tbl_Services(s_ServiceID),
    FOREIGN KEY (sg_GoodsID) REFERENCES tbl_Goods(g_GoodsID)
);
go
CREATE TABLE tbl_ImportGoods (
    ig_ImportID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),   
    ig_SumPrice DECIMAL(10,2) NOT NULL,  
    ig_Currency NVARCHAR(30) NOT NULL,  
    ig_ImportDate DATETIME DEFAULT GETDATE(),  
    ig_Supplier NVARCHAR(200),  
);
go
CREATE TABLE tbl_ImportGoodsDetails (
    igd_ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    igd_ImportID UNIQUEIDENTIFIER NOT NULL,
    igd_GoodsID UNIQUEIDENTIFIER NOT NULL,
    igd_Quantity INT NOT NULL,
    igd_CostPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (igd_ImportID) REFERENCES tbl_ImportGoods(ig_ImportID),
    FOREIGN KEY (igd_GoodsID) REFERENCES tbl_Goods(g_GoodsID)
);


--- Procedure

--1) Check-in
CREATE OR ALTER PROCEDURE pro_check_in
    @BookingID UNIQUEIDENTIFIER
AS
BEGIN
    UPDATE tbl_Bookings
    SET b_BookingStatus = 'Confirmed'
    WHERE b_BookingID = @BookingID;

    UPDATE tbl_Rooms
    SET r_Status = 'Occupied'
    WHERE r_RoomID IN (
        SELECT br_RoomID
        FROM tbl_BookingRooms
        WHERE br_BookingID = @BookingID
    );
END;
GO

--2) Check-out
CREATE OR ALTER PROCEDURE pro_check_out
    @BookingID UNIQUEIDENTIFIER,
    @PaymentMethod NVARCHAR(50)
AS
BEGIN
    DECLARE @TotalMoney DECIMAL(10,2);

    -- Sum from Booking
    SELECT @TotalMoney = b_TotalMoney
    FROM tbl_Bookings
    WHERE b_BookingID = @BookingID;

    -- Add to Payments
    INSERT INTO tbl_Payments (p_BookingID, p_AmountPaid, p_PaymentMethod)
    VALUES (@BookingID, @TotalMoney, @PaymentMethod);

    -- Update Booking to "Paid"
    UPDATE tbl_Bookings
    SET b_BookingStatus = 'Paid'
    WHERE b_BookingID = @BookingID;

    -- Update Room status to "Available"
    UPDATE tbl_Rooms
    SET r_Status = 'Available'
    WHERE r_RoomID IN (
        SELECT br_RoomID
        FROM tbl_BookingRooms
        WHERE br_BookingID = @BookingID
    );
END;
GO

--3) Book services
CREATE OR ALTER PROCEDURE pro_edit_services
    @BookingID UNIQUEIDENTIFIER,
    @PackageID UNIQUEIDENTIFIER,
    @Quantity INT
AS
BEGIN
    DECLARE @ServicePrice DECIMAL(10,2);

    -- Get service sell price
    SELECT @ServicePrice = s_ServiceSellPrice 
    FROM tbl_ServicePackages 
    WHERE sp_PackageID = @PackageID;

    -- Add to booking services
    INSERT INTO tbl_BookingServices (bs_BookingID, bs_ServiceID, bs_Quantity)
    VALUES (@BookingID, @PackageID, @Quantity);

    -- Update total money in bookings
    UPDATE tbl_Bookings
    SET b_TotalMoney = b_TotalMoney + (@ServicePrice * @Quantity)
    WHERE b_BookingID = @BookingID;
END;
GO

--4) Find bookings for index graph
CREATE OR ALTER PROCEDURE pro_find_bookings
    @CheckInDate DATETIME,
    @CheckOutDate DATETIME,
    @Floor NVARCHAR(10)
AS
BEGIN
    SELECT r.*, b.*, br_CheckInDate, br_CheckOutDate
    FROM tbl_Bookings b
    JOIN tbl_BookingRooms br ON b.b_BookingID = br.br_BookingID
    JOIN tbl_Rooms r ON br.br_RoomID = r.r_RoomID
    JOIN tbl_Floors f ON r.r_FloorID = f.f_FloorID
    WHERE (@CheckInDate < br_CheckOutDate AND @CheckOutDate > br_CheckInDate)
        AND f.f_Floor = @Floor;
END;
GO

--5) Find available rooms
CREATE OR ALTER PROCEDURE pro_FindAvailableRooms
    @CheckInDate DATETIME,
    @CheckOutDate DATETIME,
    @Floor NVARCHAR(10)
AS
BEGIN
    WITH BookedRooms AS (
        SELECT DISTINCT br.br_RoomID
        FROM tbl_Bookings b
        JOIN tbl_BookingRooms br ON b.b_BookingID = br.br_BookingID
        WHERE (@CheckInDate < DATEADD(HOUR, 1, br.br_CheckOutDate) 
            AND @CheckOutDate > br.br_CheckInDate)
    )
    SELECT r.r_RoomID, r.r_RoomNumber, f.f_Floor, r.r_RoomType, r.r_PricePerHour
    FROM tbl_Rooms r
    JOIN tbl_Floors f ON r.r_FloorID = f.f_FloorID
    WHERE r.r_RoomID NOT IN (SELECT br_RoomID FROM BookedRooms) 
        AND f.f_Floor = @Floor;
END;
GO
