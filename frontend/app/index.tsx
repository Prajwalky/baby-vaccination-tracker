import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import { useRouter } from 'expo-router';
import { getBaby, createBaby, updateBaby } from '../services/api';
import { Baby } from '../utils/vaccinationSchedule';
import { requestNotificationPermissions } from '../services/notificationService';

export default function Index() {
  const router = useRouter();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

  useEffect(() => {
    loadBaby();
    requestNotificationPermissions();
  }, []);

  const loadBaby = async () => {
    try {
      setLoading(true);
      const babyData = await getBaby();
      if (babyData) {
        setBaby(babyData);
        setName(babyData.name);
        setDob(babyData.dob);
        setGender(babyData.gender || '');
        setBloodGroup(babyData.blood_group || '');
        setPhoto(babyData.photo);
      } else {
        setEditing(true);
      }
    } catch (error) {
      console.error('Error loading baby:', error);
      Alert.alert('Error', 'Failed to load baby profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Choose Photo',
      'Select a photo from gallery or take a new one',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name || !dob) {
      Alert.alert('Error', 'Please fill in name and date of birth');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    try {
      const babyData = {
        name,
        dob,
        photo,
        gender,
        blood_group: bloodGroup,
      };

      if (baby) {
        await updateBaby(baby.id, babyData);
        Alert.alert('Success', 'Baby profile updated successfully!');
      } else {
        await createBaby(babyData);
        Alert.alert('Success', 'Baby profile created successfully!');
      }

      await loadBaby();
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving baby:', error);
      Alert.alert('Error', error.message || 'Failed to save baby profile');
    }
  };

  const calculateAge = (dobString: string) => {
    const birthDate = new Date(dobString);
    const now = new Date();
    
    const months = differenceInMonths(now, birthDate);
    const weeks = differenceInWeeks(now, birthDate);
    const days = differenceInDays(now, birthDate);

    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </SafeAreaView>
    );
  }

  if (editing || !baby) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {baby ? 'Edit Baby Profile' : 'Create Baby Profile'}
              </Text>
              {baby && (
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formContainer}>
              <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={40} color="#999" />
                    <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Baby's Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter baby's name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="2024-01-15"
                  placeholderTextColor="#999"
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'Male' && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender('Male')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === 'Male' && styles.genderButtonTextActive,
                      ]}
                    >
                      Boy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      gender === 'Female' && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender('Female')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === 'Female' && styles.genderButtonTextActive,
                      ]}
                    >
                      Girl
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Group</Text>
                <TextInput
                  style={styles.input}
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  placeholder="A+, B+, O+, etc."
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Baby Tracker</Text>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          {baby.photo && (
            <Image source={{ uri: baby.photo }} style={styles.profilePhoto} />
          )}
          
          <View style={styles.profileInfo}>
            <Text style={styles.babyName}>{baby.name}</Text>
            <Text style={styles.babyAge}>{calculateAge(baby.dob)}</Text>
            <Text style={styles.babyDob}>
              Born on {format(new Date(baby.dob), 'MMMM d, yyyy')}
            </Text>
            {baby.gender && (
              <Text style={styles.babyDetail}>
                <Ionicons name="person-outline" size={16} /> {baby.gender}
              </Text>
            )}
            {baby.blood_group && (
              <Text style={styles.babyDetail}>
                <Ionicons name="water-outline" size={16} /> {baby.blood_group}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.vaccinationsButton}
          onPress={() => router.push('/vaccinations')}
        >
          <View style={styles.vaccinationsButtonContent}>
            <Ionicons name="medical" size={32} color="#fff" />
            <View style={styles.vaccinationsButtonText}>
              <Text style={styles.vaccinationsButtonTitle}>Vaccination Schedule</Text>
              <Text style={styles.vaccinationsButtonSubtitle}>
                View and track vaccinations
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#6C63FF" />
          <Text style={styles.infoText}>
            You'll receive notifications 1 week and 1 day before each vaccination is due.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#F0EFFF',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#6C63FF',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  babyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  babyAge: {
    fontSize: 18,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  babyDob: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  babyDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  vaccinationsButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  vaccinationsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaccinationsButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  vaccinationsButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  vaccinationsButtonSubtitle: {
    fontSize: 14,
    color: '#E0DFFF',
  },
  infoCard: {
    backgroundColor: '#F0EFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
