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
function SkipLink({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.skipText}>Skip</Text>
    </TouchableOpacity>
  );
}
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AboutMeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    smoke: null,
    drink: null,
    vegan: null,
    pets: null,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const questionAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Basic entrance animation
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

    // Staggered entrance for questions
    const staggeredAnims = questionAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 200 + index * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, staggeredAnims).start();
  }, []);

  const handleSelect = (key: string, value: boolean) => {
    setAnswers({ ...answers, [key]: value });
  };

  const renderRadioOption = (key: string, label: string, value: boolean) => {
    const isSelected = answers[key] === value;
    return (
      <TouchableOpacity
        style={[
          styles.radioTile,
          isSelected && styles.radioTileSelected
        ]}
        onPress={() => handleSelect(key, value)}
        activeOpacity={0.8}
      >
        <Icon 
          name={isSelected ? "circle-check" : "circle"} 
          size={20} 
          color={isSelected ? "#FFFFFF" : "#9CA3AF"} 
        />
        <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const questions = [
    { key: 'smoke', text: 'Do you smoke?' },
    { key: 'drink', text: 'Do you drink?' },
    { key: 'vegan', text: 'Are you vegan?' },
    { key: 'pets', text: 'Do you have any pets?' },
  ];

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
              { width: (1 / 6) * SCREEN_WIDTH, transform: [{ scaleX: fadeAnim }] } 
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
              <Text style={styles.mainHeading}>Step 1 : About me</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('InterestsScreen')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Question Blocks */}
          <View style={styles.questionsContainer}>
            {questions.map((q, index) => (
              <Animated.View 
                key={q.key} 
                style={[
                  styles.questionBlock, 
                  { 
                    opacity: questionAnims[index],
                    transform: [{ 
                      translateY: questionAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      }) 
                    }] 
                  }
                ]}
              >
                <Text style={styles.questionText}>{q.text}</Text>
                <View style={styles.radioGroup}>
                  {renderRadioOption(q.key, 'Yes', true)}
                  {renderRadioOption(q.key, 'No', false)}
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('InterestsScreen')}
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
  questionsContainer: {
    marginTop: 10,
    gap: 32,
  },
  questionBlock: {
    gap: 14,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
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
    // Shadows
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

export default AboutMeScreen;
