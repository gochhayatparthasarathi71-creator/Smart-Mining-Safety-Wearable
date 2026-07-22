/*
  ================================================================
  Smart Mining Safety Belt — ESP32 Firmware (Bonus Hardware Layer)
  ================================================================
  Reads live data from the belt's onboard sensor suite and POSTs it
  to the backend's ingest endpoint, where it flows through the same
  alert engine and Socket.io broadcast used by the demo simulator.

  SENSOR SUITE (adjust pins to match your actual wiring):
   - MQ-7   -> Carbon Monoxide (CO) gas sensor      (Analog)
   - MQ-4   -> Methane (CH4) gas sensor              (Analog)
   - MQ-136 / electrochemical O2 cell -> Oxygen (%)  (Analog)
   - MPU6050 -> Accelerometer/Gyroscope (fall detect) (I2C)
   - MAX30100/MAX30102 -> Heart rate & SpO2           (I2C)
   - DS18B20 / MLX90614 -> Body temperature           (OneWire/I2C)
   - NEO-6M GPS module -> Location                    (UART)
   - Push button -> Manual SOS panic button           (Digital)
   - Li-ion battery + voltage divider -> Battery %    (Analog)

  LIBRARIES NEEDED (Arduino Library Manager):
   - WiFi.h (built-in for ESP32)
   - HTTPClient.h (built-in for ESP32)
   - ArduinoJson (by Benoit Blanchon)
   - Adafruit_MPU6050 + Adafruit Sensor
   - MAX30100_PulseOximeter (by OXullo Intersecans)
   - TinyGPSPlus (by Mikal Hart)

  NOTE: This is reference/starter firmware for the hackathon demo.
  Calibrate each analog gas sensor against your specific MQ module's
  datasheet curve before relying on it for real safety decisions.
  ================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------------- CONFIG ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Point this at your backend server (use your machine's LAN IP, not localhost,
// since the ESP32 is a separate device on the network)
const char* SERVER_INGEST_URL = "http://192.168.1.100:5000/api/sensors/ingest";
const char* SERVER_SOS_URL    = "http://192.168.1.100:5000/api/sensors/sos";

const char* BELT_ID = "BELT-A1"; // must match a seeded Miner.beltId in the DB

// ---------------- PIN MAP ----------------
#define PIN_MQ7_CO       34   // Analog
#define PIN_MQ4_CH4      35   // Analog
#define PIN_O2_SENSOR    32   // Analog
#define PIN_BATTERY      33   // Analog (through voltage divider)
#define PIN_SOS_BUTTON   14   // Digital, INPUT_PULLUP

const unsigned long SEND_INTERVAL_MS = 3000;
unsigned long lastSend = 0;

// ---------------- SENSOR READ HELPERS ----------------
// Replace these with real calibration curves for your specific MQ sensors.

float readCO_ppm() {
  int raw = analogRead(PIN_MQ7_CO);           // 0-4095 on ESP32 ADC
  float voltage = raw * (3.3 / 4095.0);
  // Placeholder linear mapping — calibrate against MQ-7 datasheet Rs/Ro curve
  return voltage * 40.0;
}

float readCH4_percent() {
  int raw = analogRead(PIN_MQ4_CH4);
  float voltage = raw * (3.3 / 4095.0);
  return voltage * 0.5; // placeholder mapping to %LEL
}

float readO2_percent() {
  int raw = analogRead(PIN_O2_SENSOR);
  float voltage = raw * (3.3 / 4095.0);
  // Typical O2 cells output ~mV proportional to 20.9% at fresh air; calibrate!
  return 20.9 - (voltage * 2.0);
}

int readBatteryPercent() {
  int raw = analogRead(PIN_BATTERY);
  float voltage = raw * (3.3 / 4095.0) * 2.0; // *2 if using a 1:1 divider from a 2S pack
  int percent = (int)((voltage - 3.0) / (4.2 - 3.0) * 100.0);
  return constrain(percent, 0, 100);
}

bool readSOSButton() {
  return digitalRead(PIN_SOS_BUTTON) == LOW; // active-low with INPUT_PULLUP
}

// Stubbed values below — wire up Adafruit_MPU6050 / MAX30100 / TinyGPSPlus
// per the library docs and replace these functions with real reads.
bool detectFall()          { return false; }
int  readHeartRate()       { return 78; }
float readBodyTemp()       { return 36.6; }
double readLatitude()      { return 21.2514; }
double readLongitude()     { return 81.6296; }

// ---------------- WIFI ----------------
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

// ---------------- SEND SENSOR PAYLOAD ----------------
void sendReading() {
  if (WiFi.status() != WL_CONNECTED) return;

  StaticJsonDocument<512> doc;
  doc["beltId"] = BELT_ID;

  JsonObject gas = doc.createNestedObject("gas");
  gas["co"] = readCO_ppm();
  gas["ch4"] = readCH4_percent();
  gas["o2"] = readO2_percent();

  doc["heartRate"] = readHeartRate();
  doc["bodyTemperature"] = readBodyTemp();
  doc["fallDetected"] = detectFall();
  doc["batteryLevel"] = readBatteryPercent();

  JsonObject location = doc.createNestedObject("location");
  location["lat"] = readLatitude();
  location["lng"] = readLongitude();
  location["depth"] = 180;
  location["zone"] = "Zone A - Main Shaft";

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(SERVER_INGEST_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  Serial.printf("Ingest POST -> %d\n", code);
  http.end();
}

// ---------------- SEND SOS ----------------
void sendSOS() {
  if (WiFi.status() != WL_CONNECTED) return;

  StaticJsonDocument<256> doc;
  doc["beltId"] = BELT_ID;
  JsonObject location = doc.createNestedObject("location");
  location["lat"] = readLatitude();
  location["lng"] = readLongitude();
  location["zone"] = "Zone A - Main Shaft";

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(SERVER_SOS_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  Serial.printf("SOS POST -> %d\n", code);
  http.end();
}

// ---------------- SETUP / LOOP ----------------
void setup() {
  Serial.begin(115200);
  pinMode(PIN_SOS_BUTTON, INPUT_PULLUP);
  connectWiFi();
}

void loop() {
  if (readSOSButton()) {
    sendSOS();
    delay(2000); // debounce so we don't spam SOS while held
  }

  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    sendReading();
    lastSend = millis();
  }
}
