import Constants from 'expo-constants';
import { Baby, Vaccination } from '../utils/vaccinationSchedule';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
const BASE_URL = `${API_URL}/api`;

export interface BabyCreate {
  name: string;
  dob: string;
  photo?: string;
  gender?: string;
  blood_group?: string;
}

export interface VaccinationUpdate {
  completed: boolean;
  completed_date?: string;
  notes?: string;
}

// Baby API
export async function createBaby(baby: BabyCreate): Promise<Baby> {
  const response = await fetch(`${BASE_URL}/baby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(baby),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create baby profile');
  }

  return response.json();
}

export async function getBaby(): Promise<Baby | null> {
  const response = await fetch(`${BASE_URL}/baby`);

  if (!response.ok) {
    throw new Error('Failed to fetch baby profile');
  }

  return response.json();
}

export async function updateBaby(babyId: string, baby: BabyCreate): Promise<Baby> {
  const response = await fetch(`${BASE_URL}/baby/${babyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(baby),
  });

  if (!response.ok) {
    throw new Error('Failed to update baby profile');
  }

  return response.json();
}

// Vaccination API
export async function getVaccinations(babyId: string): Promise<Vaccination[]> {
  const response = await fetch(`${BASE_URL}/vaccinations/${babyId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch vaccinations');
  }

  return response.json();
}

export async function updateVaccination(
  vaccinationId: string,
  update: VaccinationUpdate
): Promise<Vaccination> {
  const response = await fetch(`${BASE_URL}/vaccinations/${vaccinationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    throw new Error('Failed to update vaccination');
  }

  return response.json();
}

export async function getUpcomingVaccinations(babyId: string): Promise<Vaccination[]> {
  const response = await fetch(`${BASE_URL}/vaccinations/${babyId}/upcoming`);

  if (!response.ok) {
    throw new Error('Failed to fetch upcoming vaccinations');
  }

  return response.json();
}

export async function getCompletedVaccinations(babyId: string): Promise<Vaccination[]> {
  const response = await fetch(`${BASE_URL}/vaccinations/${babyId}/completed`);

  if (!response.ok) {
    throw new Error('Failed to fetch completed vaccinations');
  }

  return response.json();
}
