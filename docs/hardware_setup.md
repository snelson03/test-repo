# Setting Up Hardware  
## Raspberry Pi & PIR Sensor Setup

**Non-Dockerised • Study Rooms Hardware Integration**

---

> ⚠️ **Important:** Ensure the Raspberry Pi is **powered OFF and unplugged** before making any connections.  
> It is also recommended to route all wires through the enclosure openings as you connect them.

---

## 1. Understanding the Main Code

Reference the file:

```bash
4sensor_api_test.py
```

Open it using:

```bash
nano 4sensor_api_test.py
```

---

### GPIO Pin Configuration

At the top of the file, you will see:

```python
PIR_PINS = [17, 22, 23, 27]
```

These correspond to the GPIO pins used for each PIR sensor.

- You may change these values to match your wiring
- Each value represents one sensor

---

### Room ID Configuration

```python
ROOM_ID = 22
```

- This determines which room in the database is updated
- Change this value to match your desired room

---

## 2. GPIO Pin Selection

> ⚠️ This guide assumes:
```text
GPIO pins: 17, 22, 23, 27
Room ID: 22
```

---

### Step 1 — Connect PIR OUT to GPIO

Using **female-to-female jumper wires**:

- Connect GPIO pin to PIR sensor **OUT**

Example:

```text
GPIO 17 (Physical Pin 11) → PIR OUT
```

Repeat for all sensors using their assigned GPIO pins.

---

### Step 2 — Connect Ground

Using **female-to-female jumper wires**:

- Connect Raspberry Pi **GND** to PIR **GND**

Repeat for all sensors.

---

### Step 3 — Provide Power (5V Rail Setup)

Using a **female-to-male jumper wire**:

- Connect Pi **5V (Pin 2 or 4)** → Breadboard **positive rail**

This distributes power across the board.

---

### Step 4 — Connect VCC to Sensors

Using **male-to-female jumper wires**:

- Breadboard **positive rail → PIR VCC**

Repeat for all sensors using the same rail.

---

### Optional — Extend Power Rail

If space is limited:

- Use a **male-to-male jumper**
- Connect one positive rail to another

```text
Rail 1 → Rail 2
```

This extends available connection points.

---

## 3. Final Wiring Summary

```text
PIR Sensor        Raspberry Pi
-----------       -------------
VCC      ───────► 5V (via breadboard rail)
GND      ───────► GND
OUT      ───────► GPIO (17, 22, 23, 27)
```

---

## 4. System Behavior

Once wiring is complete:

1. Power on the Raspberry Pi  
2. The script should automatically start  
3. Sensors will initialize and stabilize  
4. Continuous motion detection begins  

---

### Sensor Output

- **HIGH (1)** → Motion detected  
- **LOW (0)** → No motion  

---

## 5. Integration with System

Once backend and frontend are running:

- Sensor readings are sent to the API  
- The selected room (`ROOM_ID`) is updated  
- Frontend reflects occupancy in real-time  

---

## Done

Your Raspberry Pi and PIR sensors are now fully configured and integrated.
