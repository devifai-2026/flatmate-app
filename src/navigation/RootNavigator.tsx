import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootState } from '../Redux/store';
import { RootStackParamList } from './types';

import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';

const Root = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const onboardingComplete = isAuthenticated && user?.onboardingComplete;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          // Not logged in — show auth screens
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : !onboardingComplete ? (
          // Logged in but not onboarded — show onboarding
          <Root.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Fully authenticated — show main app
          <Root.Screen name="Main" component={MainTabNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
