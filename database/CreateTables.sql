CREATE TABLE Campus (
	campus_id INT NOT NULL,
	campus_name VARCHAR(100) NOT NULL,
    PRIMARY KEY(campus_id)
);

CREATE TABLE Building (
	building_id INT NOT NULL,
    campus_building_id INT NOT NULL,
	bulding_name VARCHAR(500) NOT NULL,
    number_of_floors INT,
    PRIMARY KEY(building_id),
    FOREIGN KEY(campus_building_id) REFERENCES Campus(campus_id) 
);

CREATE TABLE Rooms (
    room_id INT NOT NULL,
    building_id INT NOT NULL,
    room_number INT NOT NULL,
    floor_number INT,
    PRIMARY KEY(room_id),
    FOREIGN KEY(building_id) REFERENCES Building(building_id) 
);

CREATE TABLE Room_Feature(
    room_id INT ,
    FOREIGN KEY(room_id) REFERENCES Rooms(room_id),
    feature VARCHAR(100) NOT NULL
);

CREATE TABLE Local_Admin (
    admin_id INT NOT NULL,
    campus_id INT NOT NULL,
    admin_fname VARCHAR (50) NOT NULL,
    admin_lname VARCHAR (50),
    PRIMARY KEY(admin_id),
    FOREIGN KEY(campus_id) REFERENCES Campus(campus_id) 
);

CREATE TABLE Users (
    user_id INT NOT NULL,
    campus_id INT NOT NULL,
    user_fname VARCHAR(50),
    user_lname VARCHAR(50),
    PRIMARY KEY(user_id),
    FOREIGN KEY(campus_id) REFERENCES Campus(campus_id)
);

CREATE TABLE Favorit_Rooms(
    room_id INT,
    user_id INT,
    FOREIGN KEY(room_id) REFERENCES Rooms(room_id),
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);