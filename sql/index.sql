-- Date Column Indexes
CREATE INDEX IX_BookingRooms_CheckInDate ON tbl_BookingRooms(br_CheckInDate);
CREATE INDEX IX_BookingRooms_CheckOutDate ON tbl_BookingRooms(br_CheckOutDate);
CREATE INDEX IX_BookingServices_CreatedAt ON tbl_BookingServices(bs_CreatedAt);
CREATE INDEX IX_ImportGoods_ImportDate ON tbl_ImportGoods(ig_ImportDate);

-- Foreign Key Indexes
CREATE INDEX IX_BookingRooms_RoomID ON tbl_BookingRooms(br_RoomID);
CREATE INDEX IX_BookingRooms_BookingID ON tbl_BookingRooms(br_BookingID);
CREATE INDEX IX_Bookings_GuestID ON tbl_Bookings(b_GuestID);
CREATE INDEX IX_BookingServices_BookingID ON tbl_BookingServices(bs_BookingID);
CREATE INDEX IX_BookingServices_ServiceID ON tbl_BookingServices(bs_ServiceID);
CREATE INDEX IX_Rooms_FloorID ON tbl_Rooms(r_FloorID);

-- Other Indexes
CREATE INDEX IX_Floors_Floor ON tbl_Floors(f_Floor);