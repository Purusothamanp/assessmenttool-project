export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'educator' | 'student';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface AssessmentReport {
  id: string;
  title: string;
  date: string;
  participants: number;
  averageScore: number;
  passingRate: number;
  topScore: number;
}

export const mockUsers: UserRecord[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2024-03-20 10:30' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'educator', status: 'active', lastLogin: '2024-03-19 14:15' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'student', status: 'active', lastLogin: '2024-03-20 09:00' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'student', status: 'inactive', lastLogin: '2024-02-15 11:20' },
  { id: '5', name: 'Sarah Parker', email: 'sarah@example.com', role: 'educator', status: 'active', lastLogin: '2024-03-18 16:45' },
];

export const mockReports: AssessmentReport[] = [
  { id: 'R1', title: 'Mid-term Mathematics', date: '2024-03-10', participants: 45, averageScore: 78, passingRate: 85, topScore: 98 },
  { id: 'R2', title: 'English Literature Quiz', date: '2024-03-12', participants: 30, averageScore: 82, passingRate: 92, topScore: 100 },
  { id: 'R3', title: 'Science Lab Assessment', date: '2024-03-15', participants: 28, averageScore: 65, passingRate: 70, topScore: 92 },
  { id: 'R4', title: 'History Final Exam', date: '2024-03-18', participants: 50, averageScore: 74, passingRate: 80, topScore: 95 },
];
