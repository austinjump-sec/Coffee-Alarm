import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#FBF8F3',
    
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
    justifyContent: 'center',
  },

  dashboardButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },

  menuButton: {
    position: 'absolute',
    top: 12,
    left: 18,
    zIndex: 20000,
    elevation: 80,
    width: 42,
    marginTop: 25,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6F4E37',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

  menuButtonText: {
    color: '#FFFDF9',
    fontSize: 24,
    fontWeight: '700',  
    textAlign: 'center',
  includeFontPadding: false,  // <-- Critical for mobile
  textAlignVertical: 'center',
  },

  menuButtonSpacer: {
    height: 42,
  },

  dashboardOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 100,
    flexDirection: 'row',
  },

  dashboardBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    
  },

  dashboard: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#FFFDF9',
    paddingTop: 55,
    paddingHorizontal: 20,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 12,
    shadowColor: '#3E2723',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 4, height: 0 },
  },

  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E4D8CC',
  },

  dashboardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3E2723',
  },

  dashboardClose: {
    fontSize: 32,
    lineHeight: 32,
    color: '#6F4E37',
  },

  dashboardContent: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 12
  },

  dashboardSection: {
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7DE',
  },

  dashboardSectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#6F4E37',
  },

  dashboardPlaceholder: {
    marginTop: 12,
    marginBottom: 6,
    color: '#6D5143',
    fontSize: 13,
    fontWeight: '700',
  },

  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  infoButton: {
    width: 20,
    height: 20,
    marginLeft: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6F4E37',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoButtonText: {
    color: '#6F4E37',
    fontSize: 13,
    fontWeight: '800',
  },

  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  infoModalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '88%',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFDF9',
  },

  infoModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3E2723',
    marginBottom: 10,
  },

  infoModalSectionTitle: {
    marginTop: 10,
    marginBottom: 3,
    color: '#6F4E37',
    fontSize: 14,
    fontWeight: '800',
  },

  infoModalText: {
    color: '#6D5143',
    fontSize: 13,
    lineHeight: 18,
  },

  githubLink: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingVertical: 3,
  },

  githubLinkText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  infoModalButton: {
    marginTop: 18,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: '#6F4E37',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoModalButtonText: {
    color: '#FFFDF9',
    fontWeight: '700',
    fontSize: 15,
  },

  dashboardReset: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 5,
    paddingHorizontal: 2,
    color: '#A4775C',
    fontSize: 13,
    fontWeight: '700',
  },

  dashboardHint: {
    marginTop: 5,
    color: '#967D6D',
    fontSize: 12,
    lineHeight: 17,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3E2723',
    textAlign: 'center',
    marginTop: 5,
  },

  connectionCard: {
    backgroundColor: '#FFFDF9',
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
    color: '#3E2723',
  },

  connectionAddress: {
    color: '#8B7568',
    marginTop: 3,
    fontSize: 12,
  },

  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#3E2723',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D5143',
    marginTop: 16,
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E4D8CC',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 16,
    color: '#3E2723',
    backgroundColor: '#FFFDF9',
  },

  soundOption: {
    borderWidth: 1,
    borderColor: '#E4D8CC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },

  soundOptionSelected: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37',
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
    backgroundColor: '#F1E8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },


  selectDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#795548',
  },

  selectDayTextActive: {
    color: '#FFF'
  },
  selectDayActive: {
    backgroundColor: '#6F4E37'
  },

  primaryButton: {
    backgroundColor: '#6F4E37',
    borderRadius: 11,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFDF9',
    fontWeight: '700',
    fontSize: 15,
  },

  scanButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  scanButton: {
    flex: 1,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6F4E37',
    borderRadius: 11,
    minHeight: 46,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
  },

  secondaryButtonSelected: {
    borderColor: '#6F4E37',
    backgroundColor: '#6F4E37'
  },
  amPmBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6F4E37',
    borderRadius: 11,
    minHeight: 46,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
  },

  amPmBtnSelected: {
    borderColor: '#6F4E37',
    backgroundColor: '#6F4E37'
  },

  secondaryButtonText: {
    color: '#6F4E37',
    fontWeight: '700',
    textAlign: 'center',
  },

  secondaryButtonSelectedText: {
    color: '#FFFDF9'
  },

  addButton: {
    marginTop: 22,
    backgroundColor: '#6F4E37',
    borderRadius: 11,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFDF9',
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
    backgroundColor: '#EADFD4',
    color: '#6F4E37',
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },

  alarmCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
  },

  alarmDisabled: {
    opacity: 0.5,
  },

  alarmTop: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  alarmSwitches: {
    marginTop: 14,
    gap: 8,
  },

  alarmSwitchRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0E7DE',
  },

  switchLabel: {
    color: '#6D5143',
    fontSize: 12,
    fontWeight: '700',
  },

  alarmTime: {
    fontSize: 35,
    fontWeight: '800',
    color: '#3E2723',
  },

  alarmLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4E342E',
    marginTop: 2,
  },

  alarmOptionText: {
    marginTop: 5,
    color: '#967D6D',
    fontSize: 12,
    fontWeight: '600',
  },

  alarmSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
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
    backgroundColor: '#F1E8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayBadgeActive: {
    backgroundColor: '#6F4E37',
  },

  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B7568',
  },

  dayTextActive: {
    color: '#FFFDF9',
  },

  deleteButton: {
    marginTop: 15,
    paddingVertical: 9,
    alignItems: 'center',
  },
  deleteText: {
    color: '#A94442',
    fontWeight: '700',
  },

  jsonButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#6F4E37',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },

  jsonButtonText: {
    color: '#6F4E37',
    fontWeight: '700',
  },

  empty: {
    backgroundColor: '#FFFDF9',
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
    color: '#3E2723',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3E2723',
    textAlign: 'center',
    marginTop: 5,
  },
   
  emptyText: {
    color: '#967D6D',
    marginTop: 5,
  },
  jsonCard: {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  backgroundColor: '#111827',
},

jsonTitle: {
  color: '#FFFFFF',
  fontWeight: '700',
  marginBottom: 8,
},

jsonText: {
  color: '#A7F3D0',
  fontFamily: 'monospace',
  fontSize: 12,
},

});
export default styles

