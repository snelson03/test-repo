# Study Room Availability v2.0

## Project Logo

<p align="left">
  <img src="logo.png" width="400"/>
</p>

---

## Client

- **Client Name:** Dr. Nasseef Abukmail
- **Organization:** Ohio University

---

## Team

- **Team Name:** DMPS

### Team Members and Roles

- **Team Leader:** Seth Nelson
- **Documentation Manager:** Meredith Seta
- **Release Manager:** Divyesh Maheshwari
- **Quality Assurance:** Seth Nelson

---

## Project Description

Study Room Availability is a full-stack system designed to help students quickly locate open study spaces across campus. 

The system uses Raspberry Pi–connected PIR motion sensors installed in study rooms to detect real-time occupancy. Sensor data is continuously sent to a backend API, which updates room availability in a centralized database.

Users can access this information through a web or mobile application, where rooms are displayed using a color-coded interface indicating availability, occupancy, or offline status. The application also provides features such as an interactive campus map, room filtering, favorites, and real-time updates.

By combining physical sensor data with a modern web interface, the system eliminates the need for manual searching and significantly improves the efficiency of finding available study rooms.

---

## Documentation

- [Project / Software Deployment Guide](docs/frontend_deploy.md)
- [Backend Deployment Guide](docs/backend_deploy.md)
- [Hardware Setup Guide](docs/hardware_setup.md)
- [User Manual](docs/user_manual.md)

---

## Built With

- React / Expo
- FastAPI
- Python
- SQLite
- Raspberry Pi
- PIR motion sensors
- Vercel
- Cloudflare Tunnel / ngrok

---

