// India Vaccination Schedule
export const INDIA_VACCINATION_SCHEDULE = [
  { name: 'BCG', ageWeeks: 0, description: 'BCG (Tuberculosis)' },
  { name: 'OPV-0', ageWeeks: 0, description: 'Oral Polio Vaccine - Birth Dose' },
  { name: 'Hepatitis B-1', ageWeeks: 0, description: 'Hepatitis B - First Dose' },
  
  { name: 'DTP-1', ageWeeks: 6, description: 'Diphtheria, Tetanus, Pertussis - First Dose' },
  { name: 'IPV-1', ageWeeks: 6, description: 'Inactivated Polio Vaccine - First Dose' },
  { name: 'Hib-1', ageWeeks: 6, description: 'Haemophilus Influenzae Type B - First Dose' },
  { name: 'Hepatitis B-2', ageWeeks: 6, description: 'Hepatitis B - Second Dose' },
  { name: 'Rotavirus-1', ageWeeks: 6, description: 'Rotavirus Vaccine - First Dose' },
  { name: 'PCV-1', ageWeeks: 6, description: 'Pneumococcal Conjugate Vaccine - First Dose' },
  
  { name: 'DTP-2', ageWeeks: 10, description: 'Diphtheria, Tetanus, Pertussis - Second Dose' },
  { name: 'IPV-2', ageWeeks: 10, description: 'Inactivated Polio Vaccine - Second Dose' },
  { name: 'Hib-2', ageWeeks: 10, description: 'Haemophilus Influenzae Type B - Second Dose' },
  { name: 'Rotavirus-2', ageWeeks: 10, description: 'Rotavirus Vaccine - Second Dose' },
  { name: 'PCV-2', ageWeeks: 10, description: 'Pneumococcal Conjugate Vaccine - Second Dose' },
  
  { name: 'DTP-3', ageWeeks: 14, description: 'Diphtheria, Tetanus, Pertussis - Third Dose' },
  { name: 'IPV-3', ageWeeks: 14, description: 'Inactivated Polio Vaccine - Third Dose' },
  { name: 'Hib-3', ageWeeks: 14, description: 'Haemophilus Influenzae Type B - Third Dose' },
  { name: 'Rotavirus-3', ageWeeks: 14, description: 'Rotavirus Vaccine - Third Dose' },
  { name: 'PCV-3', ageWeeks: 14, description: 'Pneumococcal Conjugate Vaccine - Third Dose' },
  
  { name: 'OPV-1', ageWeeks: 26, description: 'Oral Polio Vaccine - First Dose (6 months)' },
  { name: 'Hepatitis B-3', ageWeeks: 26, description: 'Hepatitis B - Third Dose' },
  
  { name: 'MMR-1', ageWeeks: 39, description: 'Measles, Mumps, Rubella - First Dose (9 months)' },
  
  { name: 'Hepatitis A-1', ageWeeks: 52, description: 'Hepatitis A - First Dose (12 months)' },
  
  { name: 'MMR-2', ageWeeks: 65, description: 'Measles, Mumps, Rubella - Second Dose (15 months)' },
  { name: 'Varicella-1', ageWeeks: 65, description: 'Chickenpox Vaccine - First Dose (15 months)' },
  { name: 'PCV Booster', ageWeeks: 65, description: 'Pneumococcal Conjugate Vaccine - Booster (15 months)' },
  
  { name: 'DTP Booster-1', ageWeeks: 72, description: 'Diphtheria, Tetanus, Pertussis - First Booster (16-18 months)' },
  { name: 'IPV Booster', ageWeeks: 72, description: 'Inactivated Polio Vaccine - Booster (16-18 months)' },
  { name: 'Hib Booster', ageWeeks: 72, description: 'Haemophilus Influenzae Type B - Booster (16-18 months)' },
  
  { name: 'Hepatitis A-2', ageWeeks: 78, description: 'Hepatitis A - Second Dose (18 months)' },
  
  { name: 'Typhoid', ageWeeks: 104, description: 'Typhoid Vaccine (2 years)' },
];

export interface Vaccination {
  id: string;
  baby_id: string;
  name: string;
  description: string;
  due_date: string;
  age_weeks: number;
  completed: boolean;
  completed_date?: string;
  notes?: string;
  created_at: string;
}

export interface Baby {
  id: string;
  name: string;
  dob: string;
  photo?: string;
  gender?: string;
  blood_group?: string;
  created_at: string;
}
