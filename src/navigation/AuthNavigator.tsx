import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Screens (Phase 2 will flesh these out)
import WelcomeScreen from '../Screens/auth/WelcomeScreen';
import LoginScreen from '../Screens/auth/LoginScreen';
import OTPScreen from '../Screens/auth/OTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false, animation: 'fade' }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="OTPVerification"
      component={OTPScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
