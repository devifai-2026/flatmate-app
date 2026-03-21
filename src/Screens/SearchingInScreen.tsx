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

const SearchingInScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const inputAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

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

    // Staggered input entrance
    const staggeredAnims = inputAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: 400 + index * 200,
        useNativeDriver: true,
      })
    );
    Animated.stagger(200, staggeredAnims).start();
  }, []);

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
              { width: (6 / 6) * SCREEN_WIDTH, transform: [{ scaleX: fadeAnim }] } 
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
              <Text style={styles.mainHeading}>Step 6 : Searching in</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfilePreviewScreen')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Inputs */}
          <View style={styles.inputsContainer}>
            <Animated.View 
              style={[
                styles.inputBlock, 
                { 
                  opacity: inputAnims[0], 
                  transform: [{ translateY: inputAnims[0].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] 
                }
              ]}
            >
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.underlineInput}
                placeholder="Type a city"
                placeholderTextColor="#9CA3AF"
                value={city}
                onChangeText={setCity}
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputBlock, 
                { 
                  opacity: inputAnims[1], 
                  transform: [{ translateY: inputAnims[1].interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] 
                }
              ]}
            >
              <Text style={styles.inputLabel}>Street address</Text>
              <TextInput
                style={styles.underlineInput}
                placeholder="House or building name, Street name"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
              />
            </Animated.View>
          </View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('ProfilePreviewScreen')}
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
  inputsContainer: {
    marginTop: 20,
    gap: 40,
  },
  inputBlock: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
  },
  underlineInput: {
    borderBottomWidth: 1.8,
    borderBottomColor: '#D1D5DB',
    fontSize: 18,
    color: '#18181B',
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
    minHeight: 120,
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

export default SearchingInScreen;
