// @/utils/medicalMock.ts

export type TmseDomain = 'Orientation' | 'Registration' | 'Attention' | 'Calculation' | 'Language' | 'Recall';

export interface DailyStatLog {
  date: string;
  accuracyRate: number;
  timeSpentSec: number;
  cognitiveDomain: TmseDomain | string; // อนุญาตให้ใช้ string เพื่อรองรับ 'Daily Average'
  completionStatus: 'Passed' | 'Needs Review';
}

export interface MedicalProfile {
  patientId: string;
  doctorNotes: string;
  clinicalDiagnosis: string;
  rehabilitationGoal: string;
  weeklyProgressData: DailyStatLog[];
}

export const MOCK_SOMCHAI_MEDICAL: MedicalProfile = {
  patientId: 'PT-123',
  clinicalDiagnosis: 'Mild Cognitive Impairment (MCI) secondary to Early-stage Alzheimer\'s disease',
  doctorNotes: 'คนไข้มีภาวะหลงลืมระยะสั้น (Short-term memory deficit) และทักษะการคำนวณลดลง แนะนำให้เน้นย้ำแบบฝึกหัดหมวด Recall และ Calculation เพื่อรักษาระดับการทำงานของสมอง',
  rehabilitationGoal: 'เพิ่มคะแนนความแม่นยำในหมวด Recall ให้มากกว่า 70% และลดเวลาในการประมวลผลหมวด Calculation',
  weeklyProgressData: [
    // ---------------- DAY 1 (2026-07-01) ----------------
    { date: '2026-07-01', accuracyRate: 60, timeSpentSec: 120, cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-01', accuracyRate: 80, timeSpentSec: 60,  cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-01', accuracyRate: 40, timeSpentSec: 150, cognitiveDomain: 'Attention', completionStatus: 'Needs Review' },
    { date: '2026-07-01', accuracyRate: 30, timeSpentSec: 180, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-01', accuracyRate: 80, timeSpentSec: 70,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-01', accuracyRate: 20, timeSpentSec: 200, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 2 (2026-07-02) ----------------
    { date: '2026-07-02', accuracyRate: 65, timeSpentSec: 110, cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-02', accuracyRate: 80, timeSpentSec: 55,  cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-02', accuracyRate: 45, timeSpentSec: 140, cognitiveDomain: 'Attention', completionStatus: 'Needs Review' },
    { date: '2026-07-02', accuracyRate: 35, timeSpentSec: 175, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-02', accuracyRate: 85, timeSpentSec: 65,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-02', accuracyRate: 30, timeSpentSec: 190, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 3 (2026-07-03) ----------------
    { date: '2026-07-03', accuracyRate: 70, timeSpentSec: 100, cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-03', accuracyRate: 85, timeSpentSec: 50,  cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-03', accuracyRate: 50, timeSpentSec: 130, cognitiveDomain: 'Attention', completionStatus: 'Needs Review' },
    { date: '2026-07-03', accuracyRate: 40, timeSpentSec: 160, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-03', accuracyRate: 85, timeSpentSec: 60,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-03', accuracyRate: 35, timeSpentSec: 180, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 4 (2026-07-04) ----------------
    { date: '2026-07-04', accuracyRate: 70, timeSpentSec: 90,  cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-04', accuracyRate: 90, timeSpentSec: 45,  cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-04', accuracyRate: 60, timeSpentSec: 120, cognitiveDomain: 'Attention', completionStatus: 'Passed' },
    { date: '2026-07-04', accuracyRate: 40, timeSpentSec: 155, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-04', accuracyRate: 90, timeSpentSec: 55,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-04', accuracyRate: 45, timeSpentSec: 170, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 5 (2026-07-05) ----------------
    { date: '2026-07-05', accuracyRate: 80, timeSpentSec: 85,  cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-05', accuracyRate: 95, timeSpentSec: 40,  cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-05', accuracyRate: 60, timeSpentSec: 110, cognitiveDomain: 'Attention', completionStatus: 'Passed' },
    { date: '2026-07-05', accuracyRate: 50, timeSpentSec: 145, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-05', accuracyRate: 95, timeSpentSec: 50,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-05', accuracyRate: 50, timeSpentSec: 160, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 6 (2026-07-06) ----------------
    { date: '2026-07-06', accuracyRate: 85, timeSpentSec: 80,  cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-06', accuracyRate: 100, timeSpentSec: 35, cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-06', accuracyRate: 70, timeSpentSec: 100, cognitiveDomain: 'Attention', completionStatus: 'Passed' },
    { date: '2026-07-06', accuracyRate: 55, timeSpentSec: 135, cognitiveDomain: 'Calculation', completionStatus: 'Needs Review' },
    { date: '2026-07-06', accuracyRate: 95, timeSpentSec: 45,  cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-06', accuracyRate: 55, timeSpentSec: 150, cognitiveDomain: 'Recall', completionStatus: 'Needs Review' },

    // ---------------- DAY 7 (2026-07-07) ----------------
    { date: '2026-07-07', accuracyRate: 90, timeSpentSec: 75,  cognitiveDomain: 'Orientation', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 100, timeSpentSec: 30, cognitiveDomain: 'Registration', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 75, timeSpentSec: 90,  cognitiveDomain: 'Attention', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 60, timeSpentSec: 125, cognitiveDomain: 'Calculation', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 100, timeSpentSec: 40, cognitiveDomain: 'Language', completionStatus: 'Passed' },
    { date: '2026-07-07', accuracyRate: 65, timeSpentSec: 140, cognitiveDomain: 'Recall', completionStatus: 'Passed' },
  ]
};
