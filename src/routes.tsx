import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// import OnboardingScreen from './screens/OnboardingScreen';
import Login from './Screens/Login';
import Welcome from './Screens/Welcome';
import OTPVerificationScreen from './Screens/OTPVerificationScreen';
import NameScreen from './Screens/NameScreen';
import DOBScreen from './Screens/DOBScreen';
import GenderScreen from './Screens/GenderScreen';
import LookingForScreen from './Screens/LookingForScreen';
import LocationScreen from './Screens/LocationScreen';
import BudgetScreen from './Screens/BudgetScreen';
import LifestyleScreen from './Screens/LifestyleScreen';
import ProfilePreviewScreen from './Screens/ProfilePreviewScreen';
import AboutMeScreen from './Screens/AboutMeScreen';
import InterestsScreen from './Screens/InterestsScreen';
import AvailabilityScreen from './Screens/AvailabilityScreen';
import FlatmateScreen from './Screens/FlatmateScreen';
import SearchingInScreen from './Screens/SearchingInScreen';
import ListingsScreen from './Screens/ListingsScreen';
import RoomDetailScreen from './Screens/RoomDetailScreen';
import FlatmateProfileScreen from './Screens/FlatmateProfileScreen';
import ChatDetailScreen from './Screens/ChatDetailScreen';
// import ForgotPassword from './screens/FrogetPassword';
// import OtpVerification from './screens/OtpVerfication';
// import CreateNewPassword from './screens/CreateNewPassword';
// import DoneScreen from './screens/DoneScreen';
// import Onboarding from './screens/Onboarding';
// import MainTabs from './components/MainTabs';
// import BuyNow from './screens/Buynow';
// import Payment from './screens/Payment';
// import SlotBook from './screens/SlotBook';
// import Booking from './screens/Booking';
// import PaymentSuccess from './screens/PaymentSuccess';
import { useSelector } from 'react-redux';
import { RootState } from './Redux/store';
import MainTabs from './Components/MainTabs';
// import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();


const Routes = () => {
      const {isAuthenticated} = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="Splash" component={SplashScreen} /> */}
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="PhoneLoginScreen" component={Login} />
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="DOBScreen" component={DOBScreen} />
        <Stack.Screen name="GenderScreen" component={GenderScreen} />
        <Stack.Screen name="LookingForScreen" component={LookingForScreen} />
        <Stack.Screen name="LocationScreen" component={LocationScreen} />
        <Stack.Screen name="BudgetScreen" component={BudgetScreen} />
        <Stack.Screen name="LifestyleScreen" component={LifestyleScreen} />
        <Stack.Screen name="AboutMeScreen" component={AboutMeScreen} />
        <Stack.Screen name="InterestsScreen" component={InterestsScreen} />
        <Stack.Screen name="AvailabilityScreen" component={AvailabilityScreen} />
        <Stack.Screen name="FlatmateScreen" component={FlatmateScreen} />
        <Stack.Screen name="SearchingInScreen" component={SearchingInScreen} />
        <Stack.Screen name="ProfilePreviewScreen" component={ProfilePreviewScreen} />
        <Stack.Screen name="ListingsScreen" component={ListingsScreen} />
        <Stack.Screen name="RoomDetailScreen" component={RoomDetailScreen} />
        <Stack.Screen name="FlatmateProfileScreen" component={FlatmateProfileScreen} />
        <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
        {/* <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} /> */ }
         {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
         <Stack.Screen name="OtpVerify" component={OtpVerification} />
         <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} /> */}

        <Stack.Screen name="MainTabs" component={MainTabs} />
{/* <Stack.Screen name="Done" component={isAuthenticated ? DoneScreen : Login} />
<Stack.Screen name="Onboarding" component={isAuthenticated ? Onboarding : Login} />
<Stack.Screen name="Buynow" component={isAuthenticated ? BuyNow : Login} />
<Stack.Screen name="Payment" component={isAuthenticated ? Payment : Login} />
<Stack.Screen name="SlotBook" component={isAuthenticated ? SlotBook : Login} />
<Stack.Screen name="Booking" component={isAuthenticated ? Booking : Login} />
<Stack.Screen name="PaymentSuccess" component={isAuthenticated ? PaymentSuccess : Login} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;