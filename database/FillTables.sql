INSERT INTO Campus (campus_id, campus_name)
VALUES
(1,"Ohio University");

INSERT INTO Building (building_id, campus_building_id, bulding_name, number_of_floors)
VALUES
(1,1,"Stocker Center",3),
(2,1,"Academic Research Center",NULL);

INSERT INTO Rooms (room_id, building_id, room_number, floor_number)
VALUES
(1,1,101,1),
(2,1,102,1),
(3,2,101,1);

INSERT INTO Room_Feature (room_id,feature)
VALUES
(1,"TV"),
(1,"White Board"),
(2,"Window");

INSERT INTO Local_Admin (admin_id, campus_id, admin_fname, admin_lname)
VALUES
(1,1,"Paige","Fatula"),
(2,1,"Meredith","Seta");

INSERT INTO Users (user_id, campus_id, user_fname, user_lname)
VALUES
(1,1,"teddy","thecat"),
(2,1, "james", "maddison"),
(3,1, "hellen", "ellen");

INSERT INTO Favorit_Rooms (room_id, user_id)
VALUES
(1,1),
(1,2),
(2,2);
