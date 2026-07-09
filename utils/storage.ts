const STORAGE_KEY = 'cognitive_prototype_patients';

export interface TmseScores {
  orientation: number;
  registration: number;
  attention: number;
  calculation: number;
  language: number;
  recall: number;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  scores: TmseScores;
  totalScore: number;
  tempUser: string;
  tempPass: string;
  status: 'Pending Activation' | 'Active' | 'Inactive 3+ Days';
  completedMissions: string[];
}

export const getLocalPatients = (): PatientRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // ล็อกข้อมูลจำลองเริ่มต้นลง LocalStorage หากยังไม่มีข้อมูลใดๆ
    const initialData: PatientRecord[] = [
      {
        id: 'PT-942',
        name: 'นายสมศักดิ์ รักดี',
        age: 72,
        scores: { orientation: 5, registration: 3, attention: 4, calculation: 2, language: 8, recall: 2 },
        totalScore: 24,
        tempUser: 'somsak2026',
        tempPass: 'XyZ789!',
        status: 'Active',
        completedMissions: ['2026-07-06']
      },
      {
        id: 'PT-105',
        name: 'นางสมศรี ใจเย็น',
        age: 68,
        scores: { orientation: 6, registration: 2, attention: 3, calculation: 1, language: 9, recall: 1 },
        totalScore: 22,
        tempUser: 'somsri68',
        tempPass: 'AbC123#',
        status: 'Inactive 3+ Days',
        completedMissions: []
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

export const saveLocalPatients = (patients: PatientRecord[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }
};

const SESSION_KEY = 'cognitive_prototype_current_user';

export const getCurrentSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export const setCurrentSession = (username: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, username);
  }
};

export const clearCurrentSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
};