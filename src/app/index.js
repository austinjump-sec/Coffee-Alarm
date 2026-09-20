import React, { useRef, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleAlarm, removeAlarm, stopAlarm } from 'expo-alarm-module';

const nextOccurrence = (dayName, hour, minute) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + ((POSSIBLE_DAYS.indexOf(dayName) - d.getDay() + 7) % 7));
  if (d <= new Date()) d.setDate(d.getDate() + 7);
  return d;
};
import {
  useAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import { Platform } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import styles from '../components/styles.js'
import * as TaskManager from 'expo-task-manager';

const ALARM_NOTIFICATION_TASK = 'COFFEE_ALARM_NOTIFICATION_TASK';

const zeroconf = new Zeroconf();
const militaryToAm = Array.from({ length: 24 }, (_, hour) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return [String(hour).padStart(2, '0'), `${displayHour}:${period}`];
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
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

const weekdayNumbers = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
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

const DEFAULT_SOUNDS = [
  {
    id: 'default',
    name: 'Default',
  },
  {
    id: 'beep',
    name: 'Classic Beep',
  },
];

export default function App() {
  const [alarms, setAlarms] = useState([]);
const [alarmsLoaded, setAlarmsLoaded] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newSound, setNewSound] = useState('beep');

  const [esp32, setEsp32] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMilitary, setMilitary] = useState(false);
  const [isAmPm, setAmPm] = useState(true);
  const [timePeriod, setTimePeriod] = useState('AM');
  const [time, setTime] = useState(false);
  const [pendingAlarm, setPendingAlarm] = useState(null);
  const [sounds, setSounds] = useState(DEFAULT_SOUNDS);
  const [value, setValue] = useState('');
  const defaultPlayer = useAudioPlayer(
  require('../../assets/sounds/default.wav')
);

const beepPlayer = useAudioPlayer(
  require('../../assets/sounds/beep.wav')
);

useEffect(() => {
  const registerAlarmTask = async () => {
    try {
      await Notifications.registerTaskAsync(
        ALARM_NOTIFICATION_TASK
      );

      console.log('Alarm background task registered');
    } catch (error) {
      console.error(
        'Could not register alarm background task:',
        error
      );
    }
  };

  registerAlarmTask();
}, []);

const ALARM_NOTIFICATION_TASK = 'COFFEE_ALARM_NOTIFICATION_TASK';

TaskManager.defineTask(
  ALARM_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error('Alarm background task error:', error);
      return;
    }

    console.log('BACKGROUND ALARM:', data);
  }
);

useEffect(() => {
  // Notification arrived while the JS app is running.
  const receivedSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;

      console.log('Alarm notification received:', data);

      if (data?.alarmId) {
        startAlarmAudio(
          data.soundId,
          notification.request.content.title || 'CoffeeAlarm'
        );
      }
    });

  // User tapped the notification.
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      console.log('Alarm notification tapped:', data);

      if (data?.alarmId) {
        stopAlarmAudio();
        setPendingAlarm(null);
      }
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}, []);
useEffect(() => {
  if (!pendingAlarm) {
    return;
  }

  startAlarmAudio(pendingAlarm.soundId);
}, [pendingAlarm]);
  useEffect(() => {
  const configureAudio = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
    } catch (error) {
      console.error('Could not configure alarm audio:', error);
    }
  };

  configureAudio();
}, []);


const stopAlarmAudio = () => {
  try {
    defaultPlayer.pause();
    beepPlayer.pause();

    defaultPlayer.seekTo(0);
    beepPlayer.seekTo(0);
  } catch (error) {
    console.error('Could not stop alarm audio:', error);
  }
};
const startAlarmAudio = async (soundId, label = 'CoffeeAlarm') => {
  try {
    stopAlarmAudio();

    const player = soundId === 'beep'
      ? beepPlayer
      : defaultPlayer;

    player.loop = true;

    player.setActiveForLockScreen(true, {
      title: label,
      artist: 'CoffeeAlarm',
      albumTitle: 'Alarm',
    });

    await player.play();

    console.log(`Alarm audio started: ${soundId}`);
  } catch (error) {
    console.error('Could not start alarm audio:', error);
  }
};

const stopCurrentAlarm = () => {
  stopAlarmAudio();
  setPendingAlarm(null);
  stopAlarm()
};



  const getNotificationChannel = (soundId) =>
  soundId === 'beep'
    ? 'alarm-beep'
    : 'alarm-default';
 useEffect(() => {
  const setupNotificationChannel = async () => {
    if (Platform.OS === 'android') {
await Notifications.setNotificationChannelAsync('alarm-default', {
  name: 'Alarms - Default',
  importance: Notifications.AndroidImportance.MAX,
  sound: 'default.wav',
  vibrationPattern: [0, 250, 250, 250],
  bypassDnd: true,
});

await Notifications.setNotificationChannelAsync('alarm-beep', {
  name: 'Alarms - Beep',
  importance: Notifications.AndroidImportance.MAX,
  sound: 'beep.wav',
  vibrationPattern: [0, 250, 250, 250],
  bypassDnd: true,
});
    }
  };

  setupNotificationChannel();
}, []);

  const cancelAlarmNotifications = async (alarm) => {
  if (Platform.OS === 'web') {
    return;
  }

  for (const id of alarm.notificationIds || []) {
  if (Platform.OS === 'android') removeAlarm(id);
  else await Notifications.cancelScheduledNotificationAsync(id);
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
  if (Platform.OS === 'web') {
    return [];
  }
  if (Platform.OS === 'android') {
  const [hour, minute] = alarm.time.split(':').map(Number);
  const ids = [];
  for (const day of alarm.days) {
    const uid = `${alarm.id}-${day}`;
    await scheduleAlarm({
      uid,
      day: nextOccurrence(day, hour, minute),
      title: alarm.label,
      description: 'CoffeeAlarm',
      showDismiss: true,
      showSnooze: false,
      snoozeInterval: 5,
      repeating: true,
      active: true,
    });
    ids.push(uid);
  }
  return ids;
}

  const channelId =
    alarm.soundId === 'beep'
      ? 'alarm-beep'
      : 'alarm-default';

  const soundFile =
    alarm.soundId === 'beep'
      ? 'beep.wav'
      : 'default.wav';

  const notificationIds = [];

  for (const day of alarm.days) {
    const [hour, minute] = alarm.time.split(':').map(Number);

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label,
          body: `${alarm.label} | CoffeeAlarm`,
          sound: soundFile,
          data: {
            alarmId: alarm.id,
            soundId: alarm.soundId,
          },
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekdayNumbers[day],
          hour,
          minute,
          repeats: true,

          // IMPORTANT
          channelId,

          // For alarm-clock behavior on supported Expo/Android versions
          delivery: 'alarmClock',
        },
      });

    notificationIds.push(notificationId);
  }

  return notificationIds;
};

  useEffect(() => {
  requestNotificationPermission();
}, []);

const requestNotificationPermission = async () => {
  if (Platform.OS === 'web') {
    return;
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
};
  const handleTimeChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formattedVal = digits;

    // Accept 700 and 0700 as 7:00 / 07:00 in either time mode.
    if (digits.length === 3) {
      formattedVal = `${digits.slice(0, 1)}:${digits.slice(1)}`;
    } else if (digits.length === 4) {
      formattedVal = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    setNewTime(formattedVal);
  }

  // -----------------------------
  // Load alarms
  // -----------------------------

  useEffect(() => {
  const load = async () => {
    try {
      const saved = await AsyncStorage.getItem('alarms');

      if (saved) {
        setAlarms(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Could not load alarms:', error);
    } finally {
      setAlarmsLoaded(true);
    }
  };

  load();
}, []);

  

  const loadAlarms = async () => {
    try {
      const saved = await AsyncStorage.getItem('alarms');

      if (saved) {
        setAlarms(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Could not load alarms:', error);
    }
  };

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

  const saveAlarms = async () => {
    try {
      await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
    } catch (error) {
      console.error('Could not save alarms:', error);
    }
  };

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

      if (service.name === 'alarm-espresso' || service.name === 'alarm-esp32') {
        const address = `http://${service.host}:${service.port}`;

        setEsp32({
          name: service.name,
          host: service.host,
          port: service.port,
          address,
        });

        setIsScanning(false);

        console.log('Connected to ESP32:', address);
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
  }, []);

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

      Alert.alert('ESP32 Error', 'Could not start device discovery.');
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
      const response = await fetch(`${esp32.address}/status`, {
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

      const response = await fetch(`${esp32.address}/alarms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alarm.id,
          time: alarm.time,
          label: alarm.label,
          enabled: alarm.enabled,
          days: alarm.days,
          soundId: alarm.soundId,
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
      const response = await fetch(`${esp32.address}/alarms/${id}`, {
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
      hours = timePeriod === 'AM'
        ? enteredHours % 12
        : (enteredHours % 12) + 12;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one day.');
      return;
    }

    const normalizedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const alarm = {
      id: Date.now().toString(),
      time: normalizedTime,
      label: newLabel.trim() || 'Alarm',
      soundId: newSound,
      enabled: true,
      days: selectedDays,
      notificationIds: [],
    };
    if (Platform.OS !== 'web') {
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
    setSelectedDays([]);
  };

  // -----------------------------
  // Delete alarm
  // -----------------------------

  // -----------------------------
  // Enable / disable alarm
  // -----------------------------

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
      current.map((item) =>
        item.id === id ? changedAlarm : item
      )
    );

    await sendAlarmToESP32(changedAlarm);
    return;
  }

  const changedAlarm = {
    ...alarm,
    enabled: true,
  };

  changedAlarm.notificationIds =
    await scheduleAlarmNotifications(changedAlarm);

  setAlarms((current) =>
    current.map((item) =>
      item.id === id ? changedAlarm : item
    )
  );

  await sendAlarmToESP32(changedAlarm);
};

  // -----------------------------
  // Render alarm
  // -----------------------------

  const renderAlarm = ({ item }) => {
    const sound = sounds.find((s) => s.id === item.soundId);

    return (
      <View style={[styles.alarmCard, !item.enabled && styles.alarmDisabled]}>
        <View style={styles.alarmTop}>
          <View>
            <Text style={styles.alarmTime}>
              {formatTime(item.time, isAmPm)}
            </Text>

            <Text style={styles.alarmLabel}>{item.label}</Text>

            <Text style={styles.soundText}>
              {sound?.name || 'Default sound'}
            </Text>
          </View>

          <Switch
            value={item.enabled}
            onValueChange={() => toggleAlarm(item.id)}
            trackColor={{
              false: '#767577',
              true: '#6375E8',
            }}
            thumbColor="#FFFFFF"
          />
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
          style={styles.deleteButton}
          onPress={() => deleteAlarm(item.id)}>
            <Text
              style={ styles.deleteText}>
              Delete Alarm
            </Text>
          
        </Pressable>
      </View>
    );
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>☕ CoffeeAlarm</Text>

       

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
                <Text style={styles.connectionAddress}>{esp32.address}</Text>
              )}
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={scanForESP32}
            disabled={isScanning}>
            <Text style={styles.primaryButtonText}>
              {isScanning ? 'Scanning...' : 'Find ESP32'}
            </Text>
          </Pressable>

          {esp32 && (
            <Pressable style={styles.secondaryButton} onPress={testESP32}>
              <Text style={styles.secondaryButtonText}>Test Connection</Text>
            </Pressable>
          )}
        </View>

        {/* NEW ALARM */}
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
            style={[styles.soundOption,
                                  timePeriod === 'AM' && styles.soundOptionSelected]}
                  onPress={() => setTimePeriod('AM')}>
            
            <Text
              style={[
                styles.secondaryButtonText,
                timePeriod === 'AM' && styles.secondaryButtonSelectedText
              ]}>
             AM
            </Text>
            
          </Pressable>
          <Pressable
            style={[styles.soundOption,
                timePeriod === 'PM' && styles.soundOptionSelected]}
                onPress={() => setTimePeriod('PM')}>
            <Text
              style={[
                styles.secondaryButtonText,
                timePeriod === 'PM' && styles.secondaryButtonSelectedText]
              }>
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

          <Text style={styles.inputLabel}>Sound</Text>

          <View style={styles.soundRow}>
            {sounds.map((sound) => {
              const selected = newSound === sound.id;

              return (
                <Pressable
                  key={sound.id}
                  style={[
                    styles.soundOption,
                    selected && styles.soundOptionSelected,
                  ]}
                  onPress={() => setNewSound(sound.id)}>
                  <Text
                    style={[
                      styles.soundOptionText,
                      selected && styles.soundOptionTextSelected,
                    ]}>
                    {sound.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Repeat Days</Text>

          <View style={styles.daysSelect}>
            {POSSIBLE_DAYS.map((day) => {
              const selected = selectedDays.includes(day);

              return (
                <Pressable
                  key={day}
                  style={[styles.selectDay, selected && styles.selectDayActive]}
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
  );
}


