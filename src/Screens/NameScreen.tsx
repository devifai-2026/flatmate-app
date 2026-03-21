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
  NameScreen: undefined;
  DOBScreen: undefined;
  [key: string]: any;
};

type NameScreenProp = NativeStackNavigationProp<RootStackParamList, 'NameScreen'>;

const NameScreen = () => {
  const navigation = useNavigation<NameScreenProp>();
  const [name, setName] = useState('');

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
            <Text style={styles.mainHeading}>What's your name?</Text>
          </View>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder=""
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus={true}
            />
            <Text style={styles.hintText}>
              Your name will be shown on your profile
            </Text>
          </View>

          {/* Flex spacer pushes button to bottom */}
          <View style={styles.flexSpacer} />

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, !name.trim() && styles.disabledButton]}
            disabled={!name.trim()}
            onPress={() => navigation.navigate('DOBScreen')}
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
    marginLeft: -8, // Compensate visual width
    marginRight: 8,
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
  },
  
  // Input
  inputContainer: {
    marginBottom: 40,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 18,
    color: '#18181B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android Shadow
    elevation: 2,
    marginBottom: 8,
  },
  hintText: {
    color: '#8A8A8A', // Gray
    fontSize: 13,
    marginLeft: 4,
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

export default NameScreen;
