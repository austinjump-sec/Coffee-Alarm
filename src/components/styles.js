import React from 'react';
import{ StyleSheet } from 'react-native'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#172033',
  },

  subtitle: {
    fontSize: 15,
    color: '#737B8C',
    marginTop: 5,
    marginBottom: 20,
  },

  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  connectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
  },

  connectionAddress: {
    color: '#737B8C',
    marginTop: 3,
    fontSize: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#172033',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D6678',
    marginTop: 16,
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 16,
    color: '#172033',
    backgroundColor: '#FFFFFF',
  },

  soundRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  soundOption: {
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },

  soundOptionSelected: {
    backgroundColor: '#5367DF',
    borderColor: '#5367DF',
  },

  soundOptionText: {
    color: '#4F596B',
    fontWeight: '600',
  },

  soundOptionTextSelected: {
    color: '#FFFFFF',
  },

  daysSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  selectDay: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },


  selectDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#687185',
  },

  selectDayTextActive: {
    color: '#FFF'
  },
  selectDayActive: {
    backgroundColor: "#5367DF"
  },

  primaryButton: {
    backgroundColor: '#5367DF',
    borderRadius: 11,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#5367DF',
    borderRadius: 11,
    minHeight: 46,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonSelected: {
    borderColor: '#5367DF',
    backgroundColor: '#5367DF'
  },

  secondaryButtonText: {
    color: '#5367DF',
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryButtonSelectedText: {
    color: '#FFFFFF'
  },

  addButton: {
    marginTop: 22,
    backgroundColor: '#5367DF',
    borderRadius: 11,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  alarmSection: {
    marginBottom: 20,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  count: {
    marginLeft: 10,
    backgroundColor: '#E6E9F7',
    color: '#5665A5',
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },

  alarmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },

  alarmDisabled: {
    opacity: 0.5,
  },

  alarmTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  alarmTime: {
    fontSize: 35,
    fontWeight: '800',
    color: '#172033',
  },

  alarmLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#313A4D',
    marginTop: 2,
  },

  soundText: {
    fontSize: 13,
    color: '#7A8292',
    marginTop: 4,
  },

  daysContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 15,
  },

  dayBadge: {
    width: 36,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayBadgeActive: {
    backgroundColor: '#5367DF',
  },

  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737B8C',
  },

  dayTextActive: {
    color: '#FFFFFF',
  },

  deleteButton: {
    marginTop: 15,
    paddingVertical: 9,
    alignItems: 'center',
  },
  deleteButtonHover: {
    borderRadius: 12
  },

  deleteText: {
    color: '#E34D59',
    fontWeight: '700',
  },
  deleteTextHover: {
    color: "#FFF"
  },

  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    color: '#172033',
  },

  emptyText: {
    color: '#7A8292',
    marginTop: 5,
  },
});
export default styles

