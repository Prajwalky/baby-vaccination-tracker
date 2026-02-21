import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays, isPast, isFuture } from 'date-fns';
import { useRouter } from 'expo-router';
import { getBaby, getVaccinations, updateVaccination } from '../services/api';
import { Baby, Vaccination } from '../utils/vaccinationSchedule';
import {
  scheduleAllVaccinationNotifications,
  getScheduledNotificationsCount,
} from '../services/notificationService';

export default function Vaccinations() {
  const router = useRouter();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vaccinations.length > 0) {
      setupNotifications();
    }
  }, [vaccinations]);

  const loadData = async () => {
    try {
      setLoading(true);
      const babyData = await getBaby();
      
      if (!babyData) {
        Alert.alert('No Baby Profile', 'Please create a baby profile first');
        router.back();
        return;
      }

      setBaby(babyData);
      const vaccinationsData = await getVaccinations(babyData.id);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load vaccination data');
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    await scheduleAllVaccinationNotifications(vaccinations);
    const count = await getScheduledNotificationsCount();
    setNotificationCount(count);
  };

  const handleVaccinationPress = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setNotes(vaccination.notes || '');
    setModalVisible(true);
  };

  const handleToggleComplete = async (completed: boolean) => {
    if (!selectedVaccination) return;

    try {
      const update = {
        completed,
        completed_date: completed ? new Date().toISOString() : undefined,
        notes,
      };

      await updateVaccination(selectedVaccination.id, update);
      await loadData();
      setModalVisible(false);
      
      Alert.alert(
        'Success',
        completed ? 'Vaccination marked as completed!' : 'Vaccination marked as incomplete'
      );
    } catch (error) {
      console.error('Error updating vaccination:', error);
      Alert.alert('Error', 'Failed to update vaccination');
    }
  };

  const getFilteredVaccinations = () => {
    switch (filter) {
      case 'upcoming':
        return vaccinations.filter(v => !v.completed);
      case 'completed':
        return vaccinations.filter(v => v.completed);
      default:
        return vaccinations;
    }
  };

  const getStatusColor = (vaccination: Vaccination) => {
    if (vaccination.completed) {
      return '#4CAF50';
    }
    
    const dueDate = parseISO(vaccination.due_date);
    const daysUntil = differenceInDays(dueDate, new Date());
    
    if (daysUntil < 0) {
      return '#F44336'; // Overdue
    } else if (daysUntil <= 7) {
      return '#FF9800'; // Due soon
    } else {
      return '#2196F3'; // Upcoming
    }
  };

  const getStatusText = (vaccination: Vaccination) => {
    if (vaccination.completed) {
      return 'Completed';
    }
    
    const dueDate = parseISO(vaccination.due_date);
    const daysUntil = differenceInDays(dueDate, new Date());
    
    if (daysUntil < 0) {
      return `Overdue by ${Math.abs(daysUntil)} days`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil <= 7) {
      return `Due in ${daysUntil} days`;
    } else {
      return `Due in ${daysUntil} days`;
    }
  };

  const getAgeText = (ageWeeks: number) => {
    if (ageWeeks === 0) {
      return 'At Birth';
    } else if (ageWeeks < 4) {
      return `${ageWeeks} weeks`;
    } else {
      const months = Math.floor(ageWeeks / 4.33);
      return `${months} months`;
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

  const filteredVaccinations = getFilteredVaccinations();
  const upcomingCount = vaccinations.filter(v => !v.completed).length;
  const completedCount = vaccinations.filter(v => v.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccinations</Text>
        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={24} color="#6C63FF" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vaccinations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredVaccinations.map((vaccination) => (
          <TouchableOpacity
            key={vaccination.id}
            style={styles.vaccinationCard}
            onPress={() => handleVaccinationPress(vaccination)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(vaccination) },
                  ]}
                />
                <Text style={styles.vaccineName}>{vaccination.name}</Text>
              </View>
              {vaccination.completed && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </View>

            <Text style={styles.vaccineDescription}>{vaccination.description}</Text>
            
            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {vaccination.completed && vaccination.completed_date
                    ? `Completed: ${format(parseISO(vaccination.completed_date), 'MMM d, yyyy')}`
                    : `Due: ${format(parseISO(vaccination.due_date), 'MMM d, yyyy')}`}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{getAgeText(vaccination.age_weeks)}</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(vaccination) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(vaccination) },
                ]}
              >
                {getStatusText(vaccination)}
              </Text>
            </View>

            {vaccination.notes && (
              <View style={styles.notesContainer}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <Text style={styles.notesText}>{vaccination.notes}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {filteredVaccinations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              {filter === 'completed'
                ? 'No completed vaccinations yet'
                : 'No upcoming vaccinations'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVaccination && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedVaccination.name}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  {selectedVaccination.description}
                </Text>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Due Date:</Text>
                  <Text style={styles.modalDetailValue}>
                    {format(parseISO(selectedVaccination.due_date), 'MMMM d, yyyy')}
                  </Text>
                </View>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Age:</Text>
                  <Text style={styles.modalDetailValue}>
                    {getAgeText(selectedVaccination.age_weeks)}
                  </Text>
                </View>

                {selectedVaccination.completed && selectedVaccination.completed_date && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Completed On:</Text>
                    <Text style={styles.modalDetailValue}>
                      {format(parseISO(selectedVaccination.completed_date), 'MMMM d, yyyy')}
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Notes (optional):</Text>
                  <TextInput
                    style={styles.textArea}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes about this vaccination..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalActions}>
                  {selectedVaccination.completed ? (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.incompleteButton]}
                      onPress={() => handleToggleComplete(false)}
                    >
                      <Text style={styles.modalButtonText}>Mark as Incomplete</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.completeButton]}
                      onPress={() => handleToggleComplete(true)}
                    >
                      <Text style={styles.modalButtonText}>Mark as Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  vaccinationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  vaccineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
  },
  modalActions: {
    marginTop: 24,
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  incompleteButton: {
    backgroundColor: '#FF9800',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
