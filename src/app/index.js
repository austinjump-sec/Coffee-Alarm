import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  PanResponder,
  FlatList,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAlarm, removeAlarm } from 'expo-alarm-module';

const nextOccurrence = (dayName, hour, minute) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(
    d.getDate() + ((POSSIBLE_DAYS.indexOf(dayName) - d.getDay() + 7) % 7)
  );
  if (d <= new Date()) d.setDate(d.getDate() + 7);
  return d;
};

import Zeroconf from 'react-native-zeroconf';
import styles from '../components/styles.js';

const zeroconf = new Zeroconf();
const SETTINGS_STORAGE_KEY = 'coffeeAlarmSettings';
const militaryToAm = Array.from({ length: 24 }, (_, hour) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return [String(hour).padStart(2, '0'), `${displayHour}:${period}`];
});

const formatTime = (time, useAmPm) => {
  if (!useAmPm || !/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  const [hourText, minutes] = time.split(':');
  const hour = Number(hourText);
  const tableEntry = militaryToAm[hour];

  if (!tableEntry) {
    return time;
  }

  return `${tableEntry[1].replace(':', `:${minutes} `)}`;
};

const POSSIBLE_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function App() {
  const [alarms, setAlarms] = useState([]);
  const [alarmsLoaded, setAlarmsLoaded] = useState(false);
  const [defaultAlarmDays, setDefaultAlarmDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);
  const [selectedDays, setSelectedDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  const [address, setAddress] = useState('alarm-esp32');
  const [requestTimeout, setRequestTimeout] = useState(5000);
  const [expandedAlarmId, setExpandedAlarmId] = useState(null);

  const [api, setApi] = useState('/alarms');
  const [arg, setArg] = useState('Coffee');
  const [val, setVal] = useState('Brew');
  const [method, setMethod] = useState('POST');
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [esp32, setEsp32] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMilitary, setMilitary] = useState(false);
  const [isAmPm, setAmPm] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [timePeriod, setTimePeriod] = useState('AM');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isJsonArgumentInfoOpen, setIsJsonArgumentInfoOpen] = useState(false);
  const [isEsp32InfoOpen, setIsEsp32InfoOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const dashboardStartX = useRef(0);



  const cancelAlarmNotifications = async (alarm) => {
    if (Platform.OS !== 'android') {
      return;
    }

    for (const id of alarm.notificationIds || []) {
      await removeAlarm(id);
    }
  };

  const deleteAlarm = async (id) => {
    const alarm = alarms.find((item) => item.id === id);

    if (alarm) {
      await cancelAlarmNotifications(alarm);
    }

    setAlarms((current) => current.filter((item) => item.id !== id));
    await deleteAlarmFromESP32(id);
  };
  const scheduleAlarmNotifications = async (alarm) => {
    // Alarms are intentionally supported only on Android.
    if (Platform.OS !== 'android') {
      return [];
    }

    const [hour, minute] = alarm.time.split(':').map(Number);
    const ids = [];

    for (const day of alarm.days) {
      const uid = `${alarm.id}-${day}`;

      await scheduleAlarm({
        uid,
        day: nextOccurrence(day, hour, minute),
        title: alarm.label,
        description: 'CoffeeAlarm',
        vibrate: alarm.vibrate !== false,
        showDismiss: true,
        showSnooze: true,
        snoozeInterval: 300,
        repeating: true,
        active: true,
      });

      ids.push(uid);
    }

    return ids;
  };

  const handleTimeChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formattedVal = digits;

    if (digits.length === 3) {
      formattedVal = `${digits.slice(0, 1)}:${digits.slice(1)}`;
    } else if (digits.length === 4) {
      formattedVal = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    setNewTime(formattedVal);
  };

  // -----------------------------
  // Load alarms
  // -----------------------------

  useEffect(() => {
    const load = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (typeof settings.address === 'string')
            setAddress(settings.address);
          if (Array.isArray(settings.defaultAlarmDays)) {
            setDefaultAlarmDays(settings.defaultAlarmDays);
            setSelectedDays(settings.defaultAlarmDays);
          }
          if (typeof settings.vibrate === 'boolean')
            setVibrate(settings.vibrate);
          if (Number.isFinite(settings.requestTimeout))
            setRequestTimeout(settings.requestTimeout);
          if (typeof settings.api === 'string') setApi(settings.api);
          if (typeof settings.arg === 'string') setArg(settings.arg);
          if (typeof settings.val === 'string') setVal(settings.val);
          if (typeof settings.method === 'string') setMethod(settings.method);
          if (typeof settings.isAmPm === 'boolean') {
            setAmPm(settings.isAmPm);
            setMilitary(!settings.isAmPm);
          }
        }

        const saved = await AsyncStorage.getItem('alarms');

        if (saved) {
          setAlarms(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Could not load alarms:', error);
      } finally {
        setAlarmsLoaded(true);
        setSettingsLoaded(true);
      }
    };

    load();
  }, []);

  // -----------------------------
  // Save settings across the application
  // -----------------------------

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    const settings = {
      address,
      defaultAlarmDays,
      vibrate,
      requestTimeout,
      api,
      arg,
      val,
      method,
      isAmPm,
    };

    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch(
      (error) => {
        console.error('Could not save application settings:', error);
      }
    );
  }, [
    address,
    defaultAlarmDays,
    vibrate,
    requestTimeout,
    api,
    arg,
    val,
    method,
    isAmPm,
    settingsLoaded,
  ]);

  // -----------------------------
  // Save alarms
  // -----------------------------

  useEffect(() => {
    if (!alarmsLoaded) {
      return;
    }

    AsyncStorage.setItem('alarms', JSON.stringify(alarms)).catch((error) => {
      console.error('Could not save alarms:', error);
    });
  }, [alarms, alarmsLoaded]);

  // -----------------------------
  // Zeroconf setup
  // -----------------------------

  useEffect(() => {
    const handleStart = () => {
      console.log('mDNS scan started');
      setIsScanning(true);
    };

    const handleResolved = (service) => {
      console.log('mDNS service resolved:', service);

      if (service.name === address) {
        const confirmedAddress = `http://${service.host}:${service.port}`;

        setEsp32({ confirmedAddress });

        setIsScanning(false);

        console.log('Connected to ESP32:', confirmedAddress);
      }
    };

    const handleError = (error) => {
      console.error('mDNS error:', error);
      setIsScanning(false);
    };

    zeroconf.on('start', handleStart);
    zeroconf.on('resolved', handleResolved);
    zeroconf.on('error', handleError);

    return () => {
      zeroconf.removeListener('start', handleStart);

      zeroconf.removeListener('resolved', handleResolved);

      zeroconf.removeListener('error', handleError);
    };
  }, [address]);

  // -----------------------------
  // Find ESP32
  // -----------------------------

  const scanForESP32 = () => {
    setIsScanning(true);

    try {
      zeroconf.scan('http', 'tcp', 'local.');
    } catch (error) {
      console.error('Could not start mDNS scan:', error);

      setIsScanning(false);

      Alert.alert('ESP32 Error:', error);
    }
  };

  // -----------------------------
  // Test ESP32 connection
  // -----------------------------

  const testESP32 = async () => {
    if (!esp32) {
      Alert.alert('ESP32', 'No ESP32 is connected.');
      return;
    }

    try {
      const response = await fetch(`${esp32.confirmedAddress}/status`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`ESP32 returned ${response.status}`);
      }

      Alert.alert('ESP32 Connected', 'The ESP32 responded successfully.');
    } catch (error) {
      console.error('ESP32 connection failed:', error);

      Alert.alert('Connection Failed', 'Could not communicate with the ESP32.');
    }
  };

  // -----------------------------
  // Send alarm to ESP32
  // -----------------------------

  const sendAlarmToESP32 = async (alarm) => {
    if (!esp32) {
      console.log('No ESP32 connected. Alarm saved locally.');
      return false;
    }

    try {
      setIsSending(true);

      const response = await fetch(`${esp32.confirmedAddress}${api}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alarm.id,
          time: alarm.time,
          label: alarm.label,
          enabled: alarm.enabled,
          timeout: requestTimeout,
          [arg]: val,
          days: alarm.days,
        }),
      });

      if (!response.ok) {
        throw new Error(`ESP32 returned ${response.status}`);
      }

      console.log('Alarm synchronized with ESP32');

      return true;
    } catch (error) {
      console.error('Could not communicate with ESP32:', error);

      Alert.alert(
        'ESP32 Sync Failed',
        'The alarm was saved on the phone, but could not be sent to the ESP32.'
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // -----------------------------
  // Delete alarm from ESP32
  // -----------------------------

  const deleteAlarmFromESP32 = async (id) => {
    if (!esp32) {
      return;
    }

    try {
      const response = await fetch(`${esp32.confirmedAddress}${api}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`ESP32 returned ${response.status}`);
      }

      console.log('Alarm deleted from ESP32');
    } catch (error) {
      console.error('Could not delete alarm from ESP32:', error);
    }
  };

  // -----------------------------
  // Select days
  // -----------------------------

  const toggleSelectedDay = (day) => {
    setSelectedDays((current) => {
      if (current.includes(day)) {
        return current.filter((item) => item !== day);
      }

      return [...current, day];
    });
  };

  const toggleDefaultAlarmDay = (day) => {
    setDefaultAlarmDays((current) => {
      const nextDays = current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day];

      setSelectedDays(nextDays);
      return nextDays;
    });
  };

  // -----------------------------
  // Add alarm
  // -----------------------------

  const addAlarm = async () => {
    if (!newTime) {
      Alert.alert('Missing Time', 'Please select an alarm time.');
      return;
    }

    const timeParts = newTime.split(':');
    const enteredHours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    if (
      timeParts.length !== 2 ||
      !/^\d{1,2}:\d{2}$/.test(newTime) ||
      !Number.isInteger(enteredHours) ||
      !Number.isInteger(minutes) ||
      minutes < 0 ||
      minutes > 59 ||
      (isAmPm && (enteredHours < 1 || enteredHours > 12)) ||
      (!isAmPm && (enteredHours < 0 || enteredHours > 23))
    ) {
      Alert.alert(
        'Invalid time',
        isAmPm
          ? 'Enter an AM/PM time such as 7:00.'
          : 'Enter a valid time such as 07:00.'
      );
      return;
    }

    let hours = enteredHours;

    if (isAmPm) {
      hours =
        timePeriod === 'AM' ? enteredHours % 12 : (enteredHours % 12) + 12;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one day.');
      return;
    }

    const normalizedTime = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}`;

    const alarm = {
      id: Date.now().toString(),
      time: normalizedTime,
      label: newLabel.trim() || 'Alarm',
      enabled: true,
      vibrate,
      timeout: requestTimeout,
      days: selectedDays,
      [arg]: val,
      notificationIds: [],
    };

    if (Platform.OS === 'android') {
      alarm.notificationIds = await scheduleAlarmNotifications(alarm);
    }

    const updatedAlarms = [...alarms, alarm].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    setAlarms(updatedAlarms);

    // Send schedule to ESP32.
    await sendAlarmToESP32(alarm);

    // Reset form.
    setNewLabel('');
    setSelectedDays(defaultAlarmDays);
  };

  // -----------------------------
  // Enable / disable alarm
  // -----------------------------

  const toggleAlarmVibration = async (id) => {
    const alarm = alarms.find((item) => item.id === id);

    if (!alarm) {
      return;
    }

    await cancelAlarmNotifications(alarm);

    const changedAlarm = {
      ...alarm,
      vibrate: alarm.vibrate === false,
      notificationIds: [],
    };

    if (changedAlarm.enabled) {
      changedAlarm.notificationIds = await scheduleAlarmNotifications(
        changedAlarm
      );
    }

    setAlarms((current) =>
      current.map((item) => (item.id === id ? changedAlarm : item))
    );

    await sendAlarmToESP32(changedAlarm);
  };

  const toggleAlarm = async (id) => {
    const alarm = alarms.find((item) => item.id === id);

    if (!alarm) {
      return;
    }

    if (alarm.enabled) {
      await cancelAlarmNotifications(alarm);

      const changedAlarm = {
        ...alarm,
        enabled: false,
        notificationIds: [],
      };

      setAlarms((current) =>
        current.map((item) => (item.id === id ? changedAlarm : item))
      );

      await sendAlarmToESP32(changedAlarm);
      return;
    }

    const changedAlarm = {
      ...alarm,
      enabled: true,
    };

    changedAlarm.notificationIds = await scheduleAlarmNotifications(
      changedAlarm
    );

    setAlarms((current) =>
      current.map((item) => (item.id === id ? changedAlarm : item))
    );

    await sendAlarmToESP32(changedAlarm);
  };

  // -----------------------------
  // Render alarm
  // -----------------------------

  const renderAlarm = ({ item }) => {
    const expanded = expandedAlarmId === item.id;

    const esp32Payload = {
      id: item.id,
      time: item.time,
      label: item.label,
      enabled: item.enabled,
      timeout: item.timeout,
      days: item.days,
      vibrate: item.vibrate,
    };

    return (
      <View style={[styles.alarmCard, !item.enabled && styles.alarmDisabled]}>
        <View style={styles.alarmTop}>
          <View>
            <Text style={styles.alarmTime}>
              {formatTime(item.time, isAmPm)}
            </Text>

            <Text style={styles.alarmLabel}>{item.label}</Text>

            <Text style={styles.alarmOptionText}>
              Vibration: {item.vibrate !== false ? 'On' : 'Off'}
            </Text>
          </View>

          <View style={styles.alarmSwitches}>
            <View style={styles.alarmSwitchRow}>
              <Text style={styles.switchLabel}>Vibrate</Text>
              <Switch
                value={item.vibrate !== false}
                onValueChange={() => toggleAlarmVibration(item.id)}
              />
            </View>
            <View style={styles.alarmSwitchRow}>
              <Text style={styles.switchLabel}>Enabled</Text>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleAlarm(item.id)}
              />
            </View>
          </View>
        </View>

        <View style={styles.daysContainer}>
          {POSSIBLE_DAYS.map((day) => {
            const active = item.days?.includes(day);

            return (
              <View
                key={day}
                style={[styles.dayBadge, active && styles.dayBadgeActive]}>
                <Text style={[styles.dayText, active && styles.dayTextActive]}>
                  {day.substring(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable
          style={styles.jsonButton}
          onPress={() => setExpandedAlarmId(expanded ? null : item.id)}>
          <Text style={styles.jsonButtonText}>
            {expanded ? 'Hide JSON' : 'View JSON'}
          </Text>
        </Pressable>

        {expanded && (
          <View style={styles.jsonCard}>
            <Text style={styles.jsonTitle}>ESP32 JSON Payload</Text>

            <Text selectable style={styles.jsonText}>
              *Note: Customized JSON Arguments Appended From Dashboard to
              Payload Are Not Shown Here.*
              {JSON.stringify(esp32Payload, null, 2)}
            </Text>
          </View>
        )}

        <Pressable
          style={styles.deleteButton}
          onPress={(event) => {
            event.stopPropagation();
            deleteAlarm(item.id);
          }}>
          <Text style={styles.deleteText}>Delete Alarm</Text>
        </Pressable>
      </View>
    );
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <View style={styles.appShell}>
      <SafeAreaView style={styles.container}>
        <Pressable
          accessibilityLabel="Open dashboard"
          style={styles.menuButton}
          onPress={() =>{
          setIsDashboardOpen(true);
          Alert.alert("Btn pressed");
          }
          }>
          <Text style={styles.menuButtonText}>☰</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}
  keyboardShouldPersistTaps="handled">
          <View style={styles.menuButtonSpacer} />
          <Text style={styles.title}>☕ CoffeeAlarm</Text>
          <Text style={styles.subtitle}>A Modifiable DIY ESP-32 Connected Alarm App </Text>

          {/* ESP32 CONNECTION */}

          <View style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: esp32 ? '#22C55E' : '#EF4444',
                  },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.connectionTitle}>
                  {esp32
                    ? 'ESP32 Trigger Connected'
                    : 'ESP32 Trigger Not Connected'}
                </Text>

                {esp32 && (
                  <Text style={styles.connectionAddress}>
                    {esp32.confirmedAddress}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.scanButtonRow}>
              <Pressable
                style={[styles.primaryButton, styles.scanButton]}
                onPress={scanForESP32}
                disabled={isScanning}>
                <Text style={styles.primaryButtonText}>
                  {isScanning ? 'Scanning...' : 'Find ESP32'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="ESP32 setup information"
                style={styles.infoButton}
                onPress={() => setIsEsp32InfoOpen(true)}>
                <Text style={styles.infoButtonText}>i</Text>
              </Pressable>
            </View>

            {esp32 && (
              <Pressable style={styles.secondaryButton} onPress={testESP32}>
                <Text style={styles.secondaryButtonText}>Test Connection</Text>
              </Pressable>
            )}
          </View>

          {/* NEW ALARM */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>New Alarm</Text>

            <Text style={styles.inputLabel}>Time</Text>

            <TextInput
              nativeID="timeInput"
              style={styles.input}
              value={newTime}
              onChangeText={handleTimeChange}
              placeholder="Enter in AM/PM or military time (07:00)"
              keyboardType="number-pad"
              placeholderTextColor="#999"
              maxLength={5}
            />
            {isAmPm && (
              <View style={styles.buttonRow}>
                <Pressable
                  style={[
                    styles.amPmBtn,
                    timePeriod === 'AM' && styles.amPmBtnSelected,
                  ]}
                  onPress={() => setTimePeriod('AM')}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      timePeriod === 'AM' && styles.secondaryButtonSelectedText,
                    ]}>
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.amPmBtn,
                    timePeriod === 'PM' && styles.amPmBtnSelected,
                  ]}
                  onPress={() => setTimePeriod('PM')}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      timePeriod === 'PM' && styles.secondaryButtonSelectedText,
                    ]}>
                    PM
                  </Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.inputLabel}>Label</Text>

            <TextInput
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Wake up"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Repeat Days</Text>

            <View style={styles.daysSelect}>
              {POSSIBLE_DAYS.map((day) => {
                const selected = selectedDays.includes(day);

                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.selectDay,
                      selected && styles.selectDayActive,
                    ]}
                    onPress={() => toggleSelectedDay(day)}>
                    <Text
                      style={[
                        styles.selectDayText,
                        selected && styles.selectDayTextActive,
                      ]}>
                      {day.substring(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.alarmSettingRow}>
              <Text style={styles.inputLabel}>Vibration</Text>
              <Switch value={vibrate} onValueChange={setVibrate} />
            </View>

            <Pressable
              style={styles.addButton}
              onPress={addAlarm}
              disabled={isSending}>
              <Text style={styles.addButtonText}>
                {isSending ? 'Sending...' : 'Add Alarm'}
              </Text>
            </Pressable>
          </View>

          {/* ALARMS */}

          <View style={styles.alarmSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Your Alarms</Text>

              <Text style={styles.count}>{alarms.length}</Text>
            </View>

            {alarms.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>⏰☕</Text>

                <Text style={styles.emptyTitle}>No alarms yet</Text>

                <Text style={styles.emptyText}>
                  Create your first alarm above.
                </Text>
              </View>
            ) : (
              <FlatList
                data={alarms}
                renderItem={renderAlarm}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={isEsp32InfoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEsp32InfoOpen(false)}>
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalCard}>
            <Text style={styles.infoModalTitle}>ESP32 Setup</Text>

            <Text style={styles.infoModalText}>
              CoffeeAlarm is a DIY project. Copy the Arduino code to your ESP32
              and modify it if your hardware requires changes.
            </Text>

            <Pressable
              accessibilityRole="link"
              style={styles.githubLink}
              onPress={() => Linking.openURL('https://github.com/austinjump-sec/CofeeAlarm/')}>
              <Text style={styles.githubLinkText}>View Arduino code on GitHub</Text>
            </Pressable>

            <Text style={styles.infoModalSectionTitle}>What you need</Text>
            <Text style={styles.infoModalText}>
              • A safe actuator, such as a button-pressing motor or a properly
              designed electrical switch.
              {'\n'}• Never connect mains power directly to the ESP32.
              {'\n'}• Prepare the coffee pot, water, and grounds the night before.
            </Text>

            <Text style={styles.infoModalSectionTitle}>How it works</Text>
            <Text style={styles.infoModalText}>
              The app sends your alarm over local Wi-Fi. At the scheduled time,
              the ESP32 runs the Arduino code to activate the coffee maker, while
              your phone can trigger its own alarm.
            </Text>

            <Pressable
              style={styles.infoModalButton}
              onPress={() => setIsEsp32InfoOpen(false)}>
              <Text style={styles.infoModalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isJsonArgumentInfoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsJsonArgumentInfoOpen(false)}>
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalCard}>
            <Text style={styles.infoModalTitle}>Custom JSON Argument</Text>
            <Text style={styles.infoModalText}>
              Will be appended to the default JSON and sent to the ESP32 upon
              wake-up. This value does not do anything unless you modify the
              ESP32's Arduino code.
            </Text>
            <Pressable
              style={styles.infoModalButton}
              onPress={() => setIsJsonArgumentInfoOpen(false)}>
              <Text style={styles.infoModalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Dashboard Overlay */}
      {isDashboardOpen && (
        <View style={styles.dashboardOverlay}>
          <Pressable
            accessibilityLabel="Close dashboard"
            style={styles.dashboardBackdrop}
            onPress={() => setIsDashboardOpen(false)}
          />
          <View style={styles.dashboard}>
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>Advanced Settings</Text>
              <Pressable
                accessibilityLabel="Close dashboard"
                onPress={() => setIsDashboardOpen(false)}>
                <Text style={styles.dashboardClose}>×</Text>
              </Pressable>
            </View>

            {/* Dashboard contents */}
            <ScrollView
              style={styles.dashboardContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.dashboardSection}>
                <Text style={styles.dashboardSectionTitle}>Time Format</Text>
                <View style={styles.dashboardButtonRow}>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[
                        styles.secondaryButton,
                        isAmPm && styles.secondaryButtonSelected,
                      ]}
                      onPress={() => {
                        setAmPm(true);
                        setMilitary(false);
                      }}>
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          isAmPm && styles.secondaryButtonSelectedText,
                        ]}>
                        AM/PM Time
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.secondaryButton,
                        isMilitary && styles.secondaryButtonSelected,
                      ]}
                      onPress={() => {
                        setMilitary(true);
                        setAmPm(false);
                      }}>
                      <Text
                        style={[
                          styles.secondaryButtonText,   
                          isMilitary && styles.secondaryButtonSelectedText,
                        ]}>
                        Military Time
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.dashboardSection}>
                  <Text style={styles.dashboardSectionTitle}>
                    Alarm Defaults
                  </Text>
                  <Text style={styles.dashboardHint}>
                    These days are selected automatically for new alarms.
                  </Text>
                  <View style={styles.daysSelect}>
                    {POSSIBLE_DAYS.map((day) => {
                      const selected = defaultAlarmDays.includes(day);

                      return (
                        <Pressable
                          key={day}
                          style={[
                            styles.selectDay,
                            selected && styles.selectDayActive,
                          ]}
                          onPress={() => toggleDefaultAlarmDay(day)}>
                          <Text
                            style={[
                              styles.selectDayText,
                              selected && styles.selectDayTextActive,
                            ]}>
                            {day.substring(0, 3)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.dashboardSection}>
                  <Text style={styles.dashboardSectionTitle}>
                    ESP32 Networking
                  </Text>
                  <Text style={styles.dashboardPlaceholder}>ESP32 Address</Text>

                  <TextInput
                    id="addressInput"
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Add ESP32 Address"
                  />
                  <Pressable
                    onPress={() => {
                      setAddress('alarm-esp32');
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text> Using: {address || 'alarm-esp32'}</Text>

                  <Text style={styles.dashboardPlaceholder}>
                    Request timeout
                  </Text>
                  <Text style={styles.dashboardHint}>
                    Prevents hanging or disconnects.
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={requestTimeout}
                    onChangeText={(text) => {
                      const value = text.replace(/\D/g, '');
                      setRequestTimeout(Number(value));
                    }}
                    placeholder="Add Request Timeout in ms"
                  />
                  <Pressable
                    onPress={() => {
                      setRequestTimeout(5000);
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text>Using: {requestTimeout || 5000}</Text>
                </View>

                <View style={styles.dashboardSection}>
                  <Text style={styles.dashboardSectionTitle}>
                    ESP32 Payload Delivery
                  </Text>

                  <Text style={styles.dashboardPlaceholder}>
                    ESP 32 API Endpoint{' '}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={api}
                    onChangeText={setApi}
                    placeholder="Add custom API endpoint"
                  />

                  <Pressable
                    onPress={() => {
                      setApi(`/alarms`);
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text>Using: {api || '/alarms'}</Text>
                  <View style={styles.infoLabelRow}>
                    <Text style={styles.dashboardPlaceholder}>
                      Create ESP32 JSON argument
                    </Text>
                    <Pressable
                      accessibilityLabel="JSON argument information"
                      style={styles.infoButton}
                      onPress={() => setIsJsonArgumentInfoOpen(true)}>
                      <Text style={styles.infoButtonText}>i</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={arg}
                    onChangeText={setArg}
                    placeholder="Add custom JSON argument"
                  />
                  <Pressable
                    onPress={(text) => {
                      setArg('Coffee');
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text>Using: {arg || 'Coffee'}</Text>
                  <Text style={styles.dashboardPlaceholder}>
                    Create ESP32 JSON Value 
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={val}
                    onChangeText={setVal}
                    placeholder="Add custom JSON argument"
                  />
                  <Pressable
                    onPress={(text) => {
                      setVal('Brew');
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text>Using: {val || 'Brew'}</Text>
                  <Text>Full JSON: {`${arg}: ${val}` || 'Coffee:Brew'}</Text>

                  <Text style={styles.dashboardPlaceholder}>
                    ESP32 JSON method
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={method}
                    onChangeText={setMethod}
                    placeholder="Add Custom Json Method"
                  />
                  <Pressable
                    onPress={() => {
                      setMethod('POST');
                    }}>
                    <Text style={styles.dashboardReset}>Reset to default</Text>
                  </Pressable>
                  <Text>Using: {method || 'POST'}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
