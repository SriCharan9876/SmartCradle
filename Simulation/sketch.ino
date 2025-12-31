/**************************************************
 *  ESP32 Child Cradle Monitoring – Firebase RTDB
 *  Library: Firebase-ESP32 (Mobizt)
 *  Works in Wokwi
 **************************************************/

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "time.h"

/* ---------------- WiFi ---------------- */
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

/* ---------------- Firebase ---------------- */
#define FIREBASE_DB_URL "YOUR_FIREBASE_URL"
#define FIREBASE_API_KEY "YOUR_FIREBASE_API_KEY"

FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

/* ---------------- Sensors ---------------- */
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOUND_PIN 34
#define LED_PIN 2

Adafruit_MPU6050 mpu;
DHT dht(DHTPIN, DHTTYPE);

/* ---------------- Thresholds ---------------- */
const float TEMP_THRESHOLD = 35.0;
const float HUMIDITY_LOW   = 20.0;
const float HUMIDITY_HIGH  = 80.0;
const int   SOUND_THRESHOLD = 3000;
const float ACC_THRESHOLD_XY = 15.0;
const float ACC_THRESHOLD_Z  = 18.0;

/* ---------------- Time ---------------- */
unsigned long getUnixTime() {
  time_t now;
  time(&now);
  return (unsigned long)now;
}

/* ---------------- Firebase Push ---------------- */
void pushToFirebase(float temperature, float humidity, float soundLevel,
                    sensors_event_t &a, sensors_event_t &g,
                    bool anomaly_temp, bool anomaly_hum,
                    bool anomaly_motion, bool anomaly_noise) {

  unsigned long ts = getUnixTime();
  String path = "/cradleData/" + String(ts);

  FirebaseJson json;

  /* -------- Environment -------- */
  json.set("environment/temperature", temperature);
  json.set("environment/humidity", humidity);

  /* -------- Sound -------- */
  json.set("sound/level", soundLevel);

  /* -------- Motion -------- */
  json.set("motion/acc_x", a.acceleration.x);
  json.set("motion/acc_y", a.acceleration.y);
  json.set("motion/acc_z", a.acceleration.z);

  json.set("motion/gyro_x", g.gyro.x);
  json.set("motion/gyro_y", g.gyro.y);
  json.set("motion/gyro_z", g.gyro.z);

  /* -------- Motion state -------- */
  String motionState = anomaly_motion ? "shake" : "idle";
  json.set("motion/state", motionState);

  /* -------- Motion confidence (rule-based placeholders) -------- */
  json.set("motion/confidence/idle",   anomaly_motion ? 0.05 : 0.99609);
  json.set("motion/confidence/normal", 0.0);
  json.set("motion/confidence/shake",  anomaly_motion ? 0.95 : 0.0);
  json.set("motion/confidence/tilt",   0.0);

  /* -------- Anomalies -------- */
  json.set("anomalies/temperature", anomaly_temp);
  json.set("anomalies/humidity",    anomaly_hum);
  json.set("anomalies/motion",      anomaly_motion);
  json.set("anomalies/noise",       anomaly_noise);
  json.set("anomalies/overall",
           anomaly_temp || anomaly_hum || anomaly_motion || anomaly_noise);

  /* -------- Timestamp -------- */
  json.set("timestamp_unix", (double)ts);

  /* -------- Push to Firebase -------- */
  if (Firebase.setJSON(fbData, path, json)) {
    Serial.println("✅ Firebase push successful");
  } else {
    Serial.print("❌ Firebase error: ");
    Serial.println(fbData.errorReason());
  }

  json.clear();
}

/* ---------------- Setup ---------------- */
void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(SOUND_PIN, INPUT);

  /* WiFi */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected");

  /* Time (NTP) */
  configTime(0, 0, "pool.ntp.org");
  delay(1000);

  /* Firebase */
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DB_URL;

  auth.user.email = "esp32@test.com";
  auth.user.password = "123456";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  /* Sensors */
  dht.begin();

  if (!mpu.begin()) {
    Serial.println("❌ MPU6050 not found");
    while (1);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);

  Serial.println("✅ System initialized");
}

/* ---------------- Loop ---------------- */
void loop() {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();
  int soundVal      = analogRead(SOUND_PIN);

  bool anomaly_motion =
      abs(a.acceleration.x) > ACC_THRESHOLD_XY ||
      abs(a.acceleration.y) > ACC_THRESHOLD_XY ||
      abs(a.acceleration.z) > ACC_THRESHOLD_Z;

  bool anomaly_temp = temperature > TEMP_THRESHOLD;
  bool anomaly_hum  = humidity < HUMIDITY_LOW || humidity > HUMIDITY_HIGH;
  bool anomaly_noise = soundVal > SOUND_THRESHOLD;

  digitalWrite(LED_PIN,
    (anomaly_motion || anomaly_temp || anomaly_hum || anomaly_noise)
    ? HIGH : LOW);

  /* Serial debug */
  Serial.println("----- SENSOR DATA -----");
  Serial.print("Temp: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("Sound: "); Serial.println(soundVal);
  Serial.println("-----------------------");

  /* Firebase push */
  pushToFirebase(
    temperature,
    humidity,
    (float)soundVal,
    a,
    g,
    anomaly_temp,
    anomaly_hum,
    anomaly_motion,
    anomaly_noise
  );

  delay(2000);
}
