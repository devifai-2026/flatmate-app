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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COMPATIBILITY_OPTIONS = [
  'Smoker', 'Drinker', 'Pets', 'Bachelor', 'Vegan', 'Couple'
];

const FlatmateScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [preferredGender, setPreferredGender] = useState('I don\'t mind');
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [compatibleWith, setCompatibleWith] = useState<string[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sectionAnims = useRef([
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

  const toggleCompatibility = (option: string) => {
    if (compatibleWith.includes(option)) {
      setCompatibleWith(compatibleWith.filter(o => o !== option));
    } else {
      setCompatibleWith([...compatibleWith, option]);
    }
  };

  const renderRadioOption = (label: string) => {
    const isSelected = preferredGender === label;
    return (
      <TouchableOpacity
        style={[styles.radioTile, isSelected && styles.radioTileSelected]}
        onPress={() => setPreferredGender(label)}
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
              { width: (4 / 6) * SCREEN_WIDTH, transform: [{ scaleX: fadeAnim }] } 
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
              <Text style={styles.mainHeading}>Step 4 : Flatmate</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SearchingInScreen')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Section 1: Preferred Living Partner */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[0], transform: [{ translateY: sectionAnims[0].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>Who would you prefer to live with?</Text>
            <View style={styles.radioGroupVertical}>
              {renderRadioOption('Male')}
              {renderRadioOption('Female')}
              {renderRadioOption('I don\'t mind')}
            </View>
          </Animated.View>

          {/* Section 2: Age Group */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[1], transform: [{ translateY: sectionAnims[1].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>What's your preferred age group?</Text>
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={ageFrom}
                  onChangeText={setAgeFrom}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={ageTo}
                  onChangeText={setAgeTo}
                />
              </View>
            </View>
          </Animated.View>

          {/* Section 3: Compatible With */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[2], transform: [{ translateY: sectionAnims[2].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
            <Text style={styles.sectionTitle}>Compatible with</Text>
            <View style={styles.pillsContainer}>
              {COMPATIBILITY_OPTIONS.map((option) => {
                const isSelected = compatibleWith.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => toggleCompatibility(option)}
                    activeOpacity={0.7}
                  >
                    <Icon 
                      name={isSelected ? "check" : "plus"} 
                      size={14} 
                      color={isSelected ? "#FFF" : "#038C98"} 
                      style={styles.pillIcon} 
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('SearchingInScreen')}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icon name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
    fontSize: 28,
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
  radioGroupVertical: {
    gap: 12,
  },
  radioTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  radioTileSelected: {
    backgroundColor: '#038C98',
    borderColor: '#038C98',
  },
  radioText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  radioTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
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
  textInput: {
    fontSize: 18,
    color: '#18181B',
    fontWeight: '700',
    padding: 0,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#038C98',
  },
  pillSelected: {
    backgroundColor: '#038C98',
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    fontSize: 15,
    color: '#038C98',
    fontWeight: '700',
  },
  pillTextSelected: {
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

export default FlatmateScreen;
