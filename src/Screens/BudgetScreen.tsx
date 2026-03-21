import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';

type RootStackParamList = {
  LifestyleScreen: undefined;
  [key: string]: any;
};

type BudgetScreenProp = NativeStackNavigationProp<RootStackParamList, 'BudgetScreen'>;

const presets = ['Under ₹5K', '₹5K–10K', '₹10K–20K', '₹20K+'];

const BudgetScreen = () => {
  const navigation = useNavigation<BudgetScreenProp>();
  // We use a single handle slider simulating max selected budget
  const [maxBudget, setMaxBudget] = useState(10000);
  const [selectedPreset, setSelectedPreset] = useState('₹5K–10K');

  const handleContinue = () => {
    navigation.navigate('LifestyleScreen');
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    // Auto adjust slider purely for visual effect when clicking preset
    if (preset === 'Under ₹5K') setMaxBudget(5000);
    else if (preset === '₹5K–10K') setMaxBudget(10000);
    else if (preset === '₹10K–20K') setMaxBudget(20000);
    else setMaxBudget(40000);
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // derived min budget roughly based on max for typical range feeling
  const derivedMin = Math.max(2000, maxBudget - 10000);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={20} color="#038C98" />
          </TouchableOpacity>
        </View>

        {/* Heading */}
        <View style={styles.headerContainer}>
          <Text style={styles.mainHeading}>What's your monthly budget?</Text>
          <Text style={styles.subtitle}>For rent including all expenses</Text>
        </View>

        {/* Slider Value Display */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>
            {formatCurrency(derivedMin)} — {maxBudget >= 40000 ? '₹40,000+' : formatCurrency(maxBudget)}
          </Text>
        </View>

        {/* Single Slider (as multi is complex natively) */}
        <Slider
          style={styles.slider}
          minimumValue={5000}
          maximumValue={40000}
          step={1000}
          value={maxBudget}
          onValueChange={(val) => {
            setMaxBudget(val);
            if (val <= 5000) setSelectedPreset('Under ₹5K');
            else if (val <= 10000) setSelectedPreset('₹5K–10K');
            else if (val <= 20000) setSelectedPreset('₹10K–20K');
            else setSelectedPreset('₹20K+');
          }}
          minimumTrackTintColor="#038C98"
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor="#038C98"
        />

        {/* Presets */}
        <View style={styles.presetsContainer}>
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetPill,
                  isSelected && styles.presetPillSelected
                ]}
                onPress={() => handlePresetSelect(preset)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.presetText,
                  isSelected && styles.presetTextSelected
                ]}>
                  {preset}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Flex spacer pushes button to bottom */}
        <View style={styles.flexSpacer} />

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F5', // Light gray background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  
  // Header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  
  // Titles
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B', // Strong dark title
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Gray
    textAlign: 'center',
  },
  
  // Slider
  valueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#038C98', // Teal Bold
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 40,
  },
  
  // Presets
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  presetPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB', // Gray outline
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  presetPillSelected: {
    backgroundColor: '#038C98', // Teal filled
    borderColor: '#038C98',
  },
  presetText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: '#FFFFFF',
  },
  
  // Footer
  flexSpacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#038C98', // Rounded Teal
    borderRadius: 14,
    height: 56, // Tall premium button
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default BudgetScreen;
