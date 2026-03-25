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
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SelectionChip = ({ 
  label, 
  isSelected, 
  onPress 
}: { 
  label: string; 
  isSelected: boolean; 
  onPress: () => void 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isSelected]);

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Icon
        name={isSelected ? "circle-check" : "circle"}
        size={18}
        color={isSelected ? "#038C98" : "#9CA3AF"}
      />
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const MUIButton = ({ 
  label, 
  onPress, 
  icon, 
  variant = 'contained' 
}: { 
  label: string; 
  onPress: () => void; 
  icon?: string;
  variant?: 'contained' | 'outlined'
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={[
        styles.muiBtn,
        variant === 'contained' ? styles.muiBtnContained : styles.muiBtnOutlined,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Text style={[
        styles.muiBtnText,
        variant === 'contained' ? styles.muiBtnTextContained : styles.muiBtnTextOutlined
      ]}>
        {label}
      </Text>
      {icon && <Icon name={icon} size={16} color={variant === 'contained' ? "#FFF" : "#038C98"} style={{ marginLeft: 8 }} />}
    </AnimatedPressable>
  );
};

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
  const slideAnim = useRef(new Animated.Value(30)).current;
  const questionAnims = useRef([
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

    const staggeredAnims = questionAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 300 + index * 120,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, staggeredAnims).start();
  }, []);

  const handleSelect = (key: string, value: boolean) => {
    setAnswers({ ...answers, [key]: value });
  };

  const questions = [
    { key: 'smoke', text: 'Do you smoke?' },
    { key: 'drink', text: 'Do you drink?' },
    { key: 'vegan', text: 'Are you vegan?' },
    { key: 'pets', text: 'Do you have any pets?' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFB" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: (1 / 6) * SCREEN_WIDTH, opacity: fadeAnim }
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <Animated.View style={[styles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-left" size={20} color="#18181B" />
            </TouchableOpacity>
            <Text style={styles.mainHeading}>About me</Text>
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
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.questionText}>{q.text}</Text>
                <View style={styles.radioGroup}>
                  <SelectionChip 
                    label="Yes" 
                    isSelected={answers[q.key] === true} 
                    onPress={() => handleSelect(q.key, true)} 
                  />
                  <SelectionChip 
                    label="No" 
                    isSelected={answers[q.key] === false} 
                    onPress={() => handleSelect(q.key, false)} 
                  />
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim, paddingBottom: 20 }}>
            <MUIButton 
              label="Continue" 
              icon="arrow-right"
              onPress={() => navigation.navigate('InterestsScreen')} 
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  container: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#038C98',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  skipText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  questionsContainer: {
    marginTop: 10,
    gap: 28,
  },
  questionBlock: {
    gap: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    opacity: 0.9,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 14,
  },
  // Chip Styles
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  chipSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#038C98',
  },
  chipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#038C98',
  },
  spacer: {
    flex: 1,
    minHeight: 80,
  },
  // MUI Style Button
  muiBtn: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  muiBtnContained: {
    backgroundColor: '#038C98',
    elevation: 6,
    shadowColor: '#038C98',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  muiBtnOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#038C98',
  },
  muiBtnText: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  muiBtnTextContained: {
    color: '#FFFFFF',
  },
  muiBtnTextOutlined: {
    color: '#038C98',
  },
});

export default AboutMeScreen;
