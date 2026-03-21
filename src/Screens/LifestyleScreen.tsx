import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProfilePreviewScreen: undefined;
  [key: string]: any;
};

type LifestyleScreenProp = NativeStackNavigationProp<RootStackParamList, 'LifestyleScreen'>;

const lifestyleOptions = [
  { id: '1', label: 'Non-smoker', emoji: '🚭' },
  { id: '2', label: 'Social drinker', emoji: '🍺' },
  { id: '3', label: 'Night owl', emoji: '🌙' },
  { id: '4', label: 'Early riser', emoji: '☀️' },
  { id: '5', label: 'Pet friendly', emoji: '🐾' },
  { id: '6', label: 'Very clean', emoji: '🧹' },
  { id: '7', label: 'Gamer', emoji: '🎮' },
  { id: '8', label: 'Introvert', emoji: '🧘' },
  { id: '9', label: 'Work from home', emoji: '💼' },
  { id: '10', label: 'Music lover', emoji: '🎵' },
  { id: '11', label: 'Fitness freak', emoji: '🏋️' },
  { id: '12', label: 'Home cook', emoji: '🍳' },
];

const LifestyleScreen = () => {
  const navigation = useNavigation<LifestyleScreenProp>();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedStyles((prev) => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigation.navigate('ProfilePreviewScreen');
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
          <Text style={styles.mainHeading}>What's your lifestyle like?</Text>
          <Text style={styles.subtitle}>Select all that apply — helps find your best match</Text>
        </View>

        {/* Scrollable Wrap Grid for Options */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {lifestyleOptions.map((option) => {
              const isSelected = selectedStyles.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.pillButton,
                    isSelected && styles.pillButtonSelected
                  ]}
                  onPress={() => handleToggle(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.emojiText]}>{option.emoji}</Text>
                  <Text style={[
                    styles.pillText,
                    isSelected && styles.pillTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, selectedStyles.length === 0 && styles.disabledButton]}
            disabled={selectedStyles.length === 0}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        
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
    paddingTop: 16,
  },
  
  // Header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  
  // Titles
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 24,
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
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  
  // Grid
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB', // Default gray border
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillButtonSelected: {
    backgroundColor: '#038C98', // Teal filled
    borderColor: '#038C98',
  },
  emojiText: {
    fontSize: 16,
    marginRight: 8,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280', // Default gray text
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
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

export default LifestyleScreen;
