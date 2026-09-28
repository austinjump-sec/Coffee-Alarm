#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <time.h>
#include <ESP32Servo.h>

// This is an alternate servo-based implementation. Its entry points are
// ServoAlarm::begin() and ServoAlarm::handleLoop(); Main.cpp remains unchanged.
namespace ServoAlarm {

// ============================================================
// WiFi
// ============================================================

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

WebServer server(80);
Preferences preferences;

// ============================================================
// Hardware
// ============================================================

// Connect the servo signal wire to this pin. Power the servo from
// an appropriate external supply and share its ground with the ESP32.
const int SERVO_PIN = 26;
const int SERVO_REST_ANGLE = 0;
const int SERVO_TRIGGER_ANGLE = 90;

Servo actuatorServo;

// ============================================================
// Alarm structure
// ============================================================

struct Alarm {
  String id;
  String time;
  String label;
  bool enabled;
  bool vibrate;
  int timeout;
  String days[7];
  int dayCount;
};

Alarm alarms[20];
int alarmCount = 0;

// ============================================================
// Helpers
// ============================================================

bool isToday(const String& dayName) {
  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {
    return false;
  }

  const char* names[] = {
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  };

  return dayName == names[timeinfo.tm_wday];
}

bool alarmShouldRunToday(const Alarm& alarm) {
  for (int i = 0; i < alarm.dayCount; i++) {
    if (isToday(alarm.days[i])) {
      return true;
    }
  }

  return false;
}

bool timeMatches(const String& alarmTime) {
  struct tm timeinfo;

  if (!getLocalTime(&timeinfo)) {
    return false;
  }

  char currentTime[6];

  snprintf(
    currentTime,
    sizeof(currentTime),
    "%02d:%02d",
    timeinfo.tm_hour,
    timeinfo.tm_min
  );

  return alarmTime == String(currentTime);
}

// ============================================================
// Servo actuator
// ============================================================

void triggerCoffeeMaker(const Alarm& alarm) {
  Serial.println("================================");
  Serial.println("ALARM TRIGGERED");
  Serial.println("Label: " + alarm.label);
  Serial.println("ID: " + alarm.id);
  Serial.println("================================");

  actuatorServo.write(SERVO_TRIGGER_ANGLE);
  delay(alarm.timeout);
  actuatorServo.write(SERVO_REST_ANGLE);
}

// ============================================================
// Find alarm
// ============================================================

int findAlarm(const String& id) {
  for (int i = 0; i < alarmCount; i++) {
    if (alarms[i].id == id) {
      return i;
    }
  }

  return -1;
}

// ============================================================
// POST /alarms
// ============================================================

void handleCreateAlarm() {

  if (!server.hasArg("plain")) {
    server.send(
      400,
      "application/json",
      "{\"error\":\"Missing JSON body\"}"
    );
    return;
  }

  String body = server.arg("plain");

  Serial.println("Received alarm:");
  Serial.println(body);

  JsonDocument doc;

  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    server.send(
      400,
      "application/json",
      "{\"error\":\"Invalid JSON\"}"
    );
    return;
  }

  String id = doc["id"] | "";
  String time = doc["time"] | "";
  String label = doc["label"] | "Alarm";

  bool enabled = doc["enabled"] | true;
  bool vibrate = doc["vibrate"] | true;

  int timeout = doc["timeout"] | 5000;

  if (id == "" || time == "") {
    server.send(
      400,
      "application/json",
      "{\"error\":\"id and time are required\"}"
    );
    return;
  }

  // ----------------------------------------------------------
  // Check whether alarm already exists
  // ----------------------------------------------------------

  int index = findAlarm(id);

  if (index == -1) {

    if (alarmCount >= 20) {
      server.send(
        507,
        "application/json",
        "{\"error\":\"Alarm storage full\"}"
      );
      return;
    }

    index = alarmCount++;

    alarms[index].id = id;
  }

  Alarm& alarm = alarms[index];

  alarm.time = time;
  alarm.label = label;
  alarm.enabled = enabled;
  alarm.vibrate = vibrate;
  alarm.timeout = timeout;

  // ----------------------------------------------------------
  // Days
  // ----------------------------------------------------------

  alarm.dayCount = 0;

  if (doc["days"].is<JsonArray>()) {

    JsonArray days = doc["days"];

    for (JsonVariant day : days) {

      if (alarm.dayCount >= 7) {
        break;
      }

      alarm.days[alarm.dayCount++] = day.as<String>();
    }
  }

  // ----------------------------------------------------------
  // Custom JSON argument
  // ----------------------------------------------------------

  Serial.println("Custom JSON:");

  for (JsonPair pair : doc.as<JsonObject>()) {

    String key = pair.key().c_str();

    // Ignore the standard fields.
    if (
      key != "id" &&
      key != "time" &&
      key != "label" &&
      key != "enabled" &&
      key != "timeout" &&
      key != "days" &&
      key != "vibrate"
    ) {
      Serial.print("  ");
      Serial.print(key);
      Serial.print(" = ");
      Serial.println(pair.value().as<String>());
    }
  }

  // ----------------------------------------------------------
  // Respond
  // ----------------------------------------------------------

  JsonDocument response;

  response["success"] = true;
  response["id"] = alarm.id;
  response["message"] = "Alarm stored";

  String output;
  serializeJson(response, output);

  server.send(
    200,
    "application/json",
    output
  );
}

// ============================================================
// DELETE /alarms/{id}
// ============================================================

void handleDeleteAlarm() {

  String path = server.uri();

  String id = path.substring(strlen("/alarms/"));

  Serial.println("Delete alarm: " + id);

  int index = findAlarm(id);

  if (index == -1) {
    server.send(
      404,
      "application/json",
      "{\"error\":\"Alarm not found\"}"
    );
    return;
  }

  // Shift alarms down.
  for (int i = index; i < alarmCount - 1; i++) {
    alarms[i] = alarms[i + 1];
  }

  alarmCount--;

  server.send(
    200,
    "application/json",
    "{\"success\":true}"
  );
}

// ============================================================
// GET /status
// ============================================================

void handleStatus() {

  JsonDocument doc;

  doc["status"] = "ok";
  doc["device"] = "alarm-esp32";
  doc["alarms"] = alarmCount;
  doc["ip"] = WiFi.localIP().toString();

  String output;

  serializeJson(doc, output);

  server.send(
    200,
    "application/json",
    output
  );
}

// ============================================================
// GET /alarms
// ============================================================

void handleGetAlarms() {

  JsonDocument doc;

  JsonArray array = doc["alarms"].to<JsonArray>();

  for (int i = 0; i < alarmCount; i++) {

    JsonObject obj = array.add<JsonObject>();

    obj["id"] = alarms[i].id;
    obj["time"] = alarms[i].time;
    obj["label"] = alarms[i].label;
    obj["enabled"] = alarms[i].enabled;
    obj["vibrate"] = alarms[i].vibrate;
    obj["timeout"] = alarms[i].timeout;

    JsonArray days = obj["days"].to<JsonArray>();

    for (int j = 0; j < alarms[i].dayCount; j++) {
      days.add(alarms[i].days[j]);
    }
  }

  String output;

  serializeJson(doc, output);

  server.send(
    200,
    "application/json",
    output
  );
}

// ============================================================
// HTTP routing
// ============================================================

void setupRoutes() {

  // App calls this when testing the ESP32.
  server.on(
    "/status",
    HTTP_GET,
    handleStatus
  );

  // Optional: useful for debugging.
  server.on(
    "/alarms",
    HTTP_GET,
    handleGetAlarms
  );

  // App's POST /alarms
  server.on(
    "/alarms",
    HTTP_POST,
    handleCreateAlarm
  );

  // DELETE /alarms/{id}
  server.onNotFound([]() {

    if (
      server.method() == HTTP_DELETE &&
      server.uri().startsWith("/alarms/")
    ) {
      handleDeleteAlarm();
      return;
    }

    server.send(
      404,
      "application/json",
      "{\"error\":\"Not found\"}"
    );
  });
}

// ============================================================
// Setup
// ============================================================

void begin() {

  Serial.begin(115200);

  actuatorServo.setPeriodHertz(50);
  actuatorServo.attach(SERVO_PIN);
  actuatorServo.write(SERVO_REST_ANGLE);

  // ----------------------------------------------------------
  // WiFi
  // ----------------------------------------------------------

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // ----------------------------------------------------------
  // Time
  // ----------------------------------------------------------

  // Change this to your timezone.
  // For example, Eastern Time:
  configTime(
    -5 * 3600,
    3600,
    "pool.ntp.org",
    "time.nist.gov"
  );

  // ----------------------------------------------------------
  // mDNS
  // ----------------------------------------------------------

  if (MDNS.begin("alarm-esp32")) {

    Serial.println("mDNS started");

    // This is what your React Native Zeroconf scanner
    // is looking for:
    //
    // _http._tcp.local.
    //
    MDNS.addService(
      "http",
      "tcp",
      80
    );

  } else {

    Serial.println("mDNS failed");
  }

  // ----------------------------------------------------------
  // HTTP
  // ----------------------------------------------------------

  setupRoutes();

  server.begin();

  Serial.println("HTTP server started");
}

// ============================================================
// Main loop
// ============================================================

void handleLoop() {

  server.handleClient();

  // ----------------------------------------------------------
  // Check alarms
  // ----------------------------------------------------------

  static int lastMinute = -1;

  struct tm timeinfo;

  if (getLocalTime(&timeinfo)) {

    // Only evaluate once per minute.
    if (timeinfo.tm_min != lastMinute) {

      lastMinute = timeinfo.tm_min;

      for (int i = 0; i < alarmCount; i++) {

        Alarm& alarm = alarms[i];

        if (!alarm.enabled) {
          continue;
        }

        if (!alarmShouldRunToday(alarm)) {
          continue;
        }

        if (!timeMatches(alarm.time)) {
          continue;
        }

        triggerCoffeeMaker(alarm);
      }
    }
  }

  delay(10);
}

}  // namespace ServoAlarm

