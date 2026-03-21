import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  [key: string]: any;
};

type ProfilePreviewProp = NativeStackNavigationProp<RootStackParamList, 'ProfilePreviewScreen'>;

const ProfilePreviewScreen = () => {
  const navigation = useNavigation<ProfilePreviewProp>();

  const handleEdit = () => {
    navigation.goBack(); // Example: Go back to edit
  };

  const handleGoLive = () => {
    // Navigate to the main home stack
    navigation.navigate('MainTabs'); 
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
          <Text style={styles.mainHeading}>Your profile is ready!</Text>
          <Text style={styles.subtitle}>Here's how others will see you</Text>
        </View>

        {/* Profile Card Preview */}
        <View style={styles.card}>
          {/* Profile Photo */}
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }}
            style={styles.profileImage}
          />
          
          <View style={styles.cardContent}>
            {/* Name and Age */}
            <Text style={styles.nameAgeText}>Priya, 24</Text>
            
            {/* Location Tag */}
            <View style={styles.locationRow}>
              <Icon name="location-dot" size={14} color="#038C98" style={styles.locationIcon} />
              <Text style={styles.locationText}>Mumbai</Text>
            </View>
            
            {/* Budget Badge */}
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetText}>₹10,000 - ₹20,000</Text>
            </View>

            {/* Looking For */}
            <Text style={styles.lookingForLabel}>Looking for: Rooms</Text>
            
            {/* Lifestyle Tags */}
            <View style={styles.lifestyleTagsRow}>
              <View style={styles.smallPill}>
                <Text style={styles.smallPillText}>☕ Coffee</Text>
              </View>
              <View style={styles.smallPill}>
                <Text style={styles.smallPillText}>🐾 Pet friendly</Text>
              </View>
              <View style={styles.smallPill}>
                <Text style={styles.smallPillText}>🌙 Night owl</Text>
              </View>
            </View>
            
          </View>
        </View>

        {/* Flex spacer pushes buttons to bottom */}
        <View style={styles.flexSpacer} />

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goLiveButton}
            onPress={handleGoLive}
          >
            <Text style={styles.goLiveButtonText}>Go Live 🚀</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
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
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  
  // Titles
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#038C98', // Teal Bold
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Gray
    textAlign: 'center',
  },
  
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardContent: {
    padding: 20,
  },
  nameAgeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18181B', // Dark
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  budgetBadge: {
    backgroundColor: 'rgba(3, 140, 152, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  budgetText: {
    color: '#038C98',
    fontWeight: '700',
    fontSize: 13,
  },
  lookingForLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600',
  },
  lifestyleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallPill: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  smallPillText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Footer
  flexSpacer: {
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
  editButton: {
    borderWidth: 2,
    borderColor: '#038C98', // Teal outlined
    borderRadius: 14,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#038C98',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  goLiveButton: {
    backgroundColor: '#038C98', // Teal filled
    borderRadius: 14,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    // Shadows
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ProfilePreviewScreen;
