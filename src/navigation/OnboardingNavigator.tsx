import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

import OnboardingWhoScreen from '../Screens/onboarding/OnboardingWhoScreen';
import OnboardingProfileScreen from '../Screens/onboarding/OnboardingProfileScreen';
import OnboardingLifestyleScreen from '../Screens/onboarding/OnboardingLifestyleScreen';
import ProfilePreviewScreen from '../Screens/onboarding/ProfilePreviewScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName="OnboardingWho"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="OnboardingWho" component={OnboardingWhoScreen} />
    <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
    <Stack.Screen name="OnboardingLifestyle" component={OnboardingLifestyleScreen} />
    <Stack.Screen name="ProfilePreview" component={ProfilePreviewScreen} />
  </Stack.Navigator>
);

export default OnboardingNavigator;
