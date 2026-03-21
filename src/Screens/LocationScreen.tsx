import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  BudgetScreen: undefined;
  [key: string]: any;
};

type LocationScreenProp = NativeStackNavigationProp<RootStackParamList, 'LocationScreen'>;

const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad'];

const LocationScreen = () => {
  const navigation = useNavigation<LocationScreenProp>();
  const [location, setLocation] = useState('');

  const handleContinue = () => {
    navigation.navigate('BudgetScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-left" size={20} color="#038C98" />
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainHeading}>Where are you looking?</Text>
            <Text style={styles.subtitle}>We'll show you people nearby</Text>
          </View>

          {/* Search Input */}
          <View style={styles.inputContainer}>
            <View style={styles.searchBox}>
              <Icon name="location-dot" size={18} color="#038C98" style={styles.searchIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Search your city or area"
                placeholderTextColor="#A3A3A3"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Popular Cities */}
          <View style={styles.citiesContainer}>
            {popularCities.map((city) => {
              const isSelected = location.toLowerCase() === city.toLowerCase();
              return (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityPill,
                    isSelected && styles.cityPillSelected
                  ]}
                  onPress={() => setLocation(city)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cityText,
                    isSelected && styles.cityTextSelected
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Flex spacer pushes button to bottom */}
          <View style={styles.flexSpacer} />

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, !location.trim() && styles.disabledButton]}
            disabled={!location.trim()}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F5', // Light gray background
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 30,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B', // Strong dark title
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Gray
    textAlign: 'center',
  },
  
  // Input
  inputContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android Shadow
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 16,
    color: '#18181B',
  },
  
  // Cities
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cityPill: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#038C98', // Teal outline
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cityPillSelected: {
    backgroundColor: '#038C98', // Teal fill
  },
  cityText: {
    color: '#038C98',
    fontSize: 14,
    fontWeight: '600',
  },
  cityTextSelected: {
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default LocationScreen;
