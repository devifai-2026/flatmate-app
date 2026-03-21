import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DatePicker from 'react-native-date-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AvailabilityScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [minStay, setMinStay] = useState('');
  const [maxStay, setMaxStay] = useState('');
  const [rent, setRent] = useState('');
  const [roomType, setRoomType] = useState('Private room');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sectionAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered section entrance
    const staggeredAnims = sectionAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 200 + index * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, staggeredAnims).start();
  }, []);

  const renderRadioOption = (label: string) => {
    const isSelected = roomType === label;
    return (
      <TouchableOpacity
        style={[styles.radioTile, isSelected && styles.radioTileSelected]}
        onPress={() => setRoomType(label)}
        activeOpacity={0.8}
      >
        <Icon 
          name={isSelected ? "circle-check" : "circle"} 
          size={20} 
          color={isSelected ? "#FFF" : "#9CA3AF"} 
        />
        <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF5F5" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: (3 / 6) * SCREEN_WIDTH, transform: [{ scaleX: fadeAnim }] } 
            ]} 
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <Animated.View style={[styles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color="#18181B" />
              </TouchableOpacity>
              <Text style={styles.mainHeading}>Step 3 : Availability</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FlatmateScreen')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Section 1: Availability */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[0], transform: [{ translateY: sectionAnims[0].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>Set the availability</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.datePickerCard} onPress={() => setOpenFrom(true)}>
                <Icon name="calendar-days" size={16} color="#038C98" style={styles.dateIcon} />
                <View>
                  <Text style={styles.inputLabel}>From</Text>
                  <Text style={styles.inputText}>{fromDate.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerCard} onPress={() => setOpenTo(true)}>
                <Icon name="calendar-days" size={16} color="#038C98" style={styles.dateIcon} />
                <View>
                  <Text style={styles.inputLabel}>To</Text>
                  <Text style={styles.inputText}>{toDate.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Section 2: Stay Duration */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[1], transform: [{ translateY: sectionAnims[1].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <View style={styles.row}>
              <View style={styles.durationCard}>
                <Text style={styles.inputLabel}>Minimum stay</Text>
                <View style={styles.durationInputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={minStay}
                    onChangeText={setMinStay}
                  />
                  <Text style={styles.durationSuffix}>Months</Text>
                </View>
              </View>
              <View style={styles.durationCard}>
                <Text style={styles.inputLabel}>Maximum stay</Text>
                <View style={styles.durationInputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={maxStay}
                    onChangeText={setMaxStay}
                  />
                  <Text style={styles.durationSuffix}>Months</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Section 3: Rent */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[2], transform: [{ translateY: sectionAnims[2].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>What's the monthly rent?</Text>
            <View style={styles.rentInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.rentInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={rent}
                onChangeText={setRent}
              />
              <Text style={styles.rentSuffix}>/ month</Text>
            </View>
          </Animated.View>

          {/* Section 4: Room Type */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[3], transform: [{ translateY: sectionAnims[3].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>What kind of room are you looking for?</Text>
            <View style={styles.radioGroup}>
              {renderRadioOption('Private room')}
              {renderRadioOption('Shared room')}
            </View>
          </Animated.View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('FlatmateScreen')}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icon name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <DatePicker
          modal
          open={openFrom}
          date={fromDate}
          mode="date"
          onConfirm={(date) => {
            setOpenFrom(false);
            setFromDate(date);
          }}
          onCancel={() => setOpenFrom(false)}
        />
        <DatePicker
          modal
          open={openTo}
          date={toDate}
          mode="date"
          onConfirm={(date) => {
            setOpenTo(false);
            setToDate(date);
          }}
          onCancel={() => setOpenTo(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5F5',
  },
  container: {
    flex: 1,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#038C98',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.5,
  },
  skipText: {
    fontSize: 16,
    color: '#038C98',
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateIcon: {
    marginRight: 10,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  inputText: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '700',
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textInput: {
    fontSize: 18,
    color: '#18181B',
    fontWeight: '700',
    padding: 0,
    minWidth: 40,
  },
  durationSuffix: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  rentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: '#038C98',
    marginRight: 8,
  },
  rentInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#18181B',
    padding: 0,
  },
  rentSuffix: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  radioTileSelected: {
    backgroundColor: '#038C98',
    borderColor: '#038C98',
  },
  radioText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
  },
  radioTextSelected: {
    color: '#FFFFFF',
  },
  spacer: {
    flex: 1,
    minHeight: 60,
  },
  continueButton: {
    backgroundColor: '#038C98',
    borderRadius: 16,
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default AvailabilityScreen;
