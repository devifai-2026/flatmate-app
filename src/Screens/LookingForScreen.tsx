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

type RootStackParamList = {
  LookingForScreen: undefined;
  // TODO: Add next screen here
  [key: string]: any;
};

type LookingForScreenProp = NativeStackNavigationProp<RootStackParamList, 'LookingForScreen'>;

const preferences = ['Roommates', 'Rooms'];

const LookingForScreen = () => {
  const navigation = useNavigation<LookingForScreenProp>();
  // Pre-selected as "Rooms" as requested
  const [selectedPreference, setSelectedPreference] = useState('Rooms');

  const handleContinue = () => {
    navigation.navigate('AboutMeScreen');
  };

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
          <Text style={styles.mainHeading}>What are you looking up for?</Text>
          <Text style={styles.subtitle}>You can change your preference whenever you want!</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {preferences.map((preference) => {
            const isSelected = selectedPreference === preference;
            return (
              <TouchableOpacity
                key={preference}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected
                ]}
                onPress={() => setSelectedPreference(preference)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected
                ]}>
                  {preference}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Flex spacer pushes button to bottom */}
        <View style={styles.flexSpacer} />

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
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
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Gray
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  
  // Options
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB', // Default gray border
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#038C98', // Teal border
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280', // Default gray text
  },
  optionTextSelected: {
    color: '#038C98', // Teal text
    fontWeight: '700',
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

export default LookingForScreen;
