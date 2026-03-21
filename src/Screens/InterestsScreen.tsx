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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTERESTS = [
  'Music', 'Alcohol', 'Smoking', 'Wine', 'New in town', 'Dancing', 'Travel', 'Pet lover', 'Vegan',
  'Hiking', 'Party lover', 'Night owl', 'Dance', 'Political', 'Art', 'Netflix',
  'Instagram', 'Tea', 'Football', 'Photography', 'Cooking', 'Fashion',
  'Gardening', 'Reading', 'Workout'
];

const InterestsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pillAnims = useRef(INTERESTS.map(() => new Animated.Value(0))).current;

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

    // Staggered pill entrance
    const staggeredAnims = pillAnims.map((anim, index) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200 + index * 30,
        useNativeDriver: true,
      })
    );
    Animated.parallel(staggeredAnims).start();
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
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
              { width: (2 / 6) * SCREEN_WIDTH, transform: [{ scaleX: fadeAnim }] } 
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
              <Text style={styles.mainHeading}>Step 2 : My interests</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AvailabilityScreen')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
            Let your mate know what you are passionate about by adding it to your profile.
          </Animated.Text>

          {/* Interests Pills */}
          <View style={styles.pillsContainer}>
            {INTERESTS.map((interest, index) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <Animated.View
                  key={interest}
                  style={{
                    opacity: pillAnims[index],
                    transform: [
                      { scale: pillAnims[index] },
                    ],
                  }}
                >
                  <TouchableOpacity
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => toggleInterest(interest)}
                    activeOpacity={0.7}
                  >
                    <Icon 
                      name={isSelected ? "check" : "plus"} 
                      size={14} 
                      color={isSelected ? "#FFF" : "#6B7280"} 
                      style={styles.pillIcon} 
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('AvailabilityScreen')}
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 32,
    paddingLeft: 40,
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
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  pillSelected: {
    backgroundColor: '#038C98',
    borderColor: '#038C98',
    shadowColor: '#038C98',
    shadowOpacity: 0.2,
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default InterestsScreen;
