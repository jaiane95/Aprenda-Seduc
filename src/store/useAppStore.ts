import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  uid: string;
  name: string;
  role: 'student' | 'professor';
  avatar?: string;
  coins: number;
  unlockedItems: string[];
  turmaId?: string;
  mood?: string;
  completedActivities: string[];
  pin?: string;
}

export interface RoutineItem {
  id: string;
  time: string;
  activity: string;
  completed: boolean;
  date: string;
  userId: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct: string;
  stars?: number;
  date: string; // ISO date string YYYY-MM-DD
}

interface Turma {
  id: string;
  name: string;
  activities: Record<string, ActivityItem[]>;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  routines: RoutineItem[];
  setRoutines: (routines: RoutineItem[]) => void;
  coins: number;
  addCoins: (amount: number) => void;
  unlockItem: (itemId: string, cost: number) => void;
  setAvatar: (avatar: string) => void;
  turmas: Turma[];
  setTurmas: (turmas: Turma[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  addStudent: (student: User) => void;
  deleteStudent: (uid: string) => void;
  updateTurmaActivities: (turmaId: string, subject: string, activities: ActivityItem[]) => void;
  renameSubject: (turmaId: string, oldName: string, newName: string) => void;
  addSubject: (turmaId: string, name: string) => void;
  deleteSubject: (turmaId: string, name: string) => void;
  addTurma: (name: string) => void;
  deleteTurma: (turmaId: string) => void;
  setMood: (mood: string) => void;
  completeActivity: (activityId: string) => void;
}

const today = new Date().toISOString().split('T')[0];

const DEFAULT_ACTIVITIES: Record<string, ActivityItem[]> = {
  'Português': [
    { id: 'p1', date: today, type: 'ident', question: 'Qual letra começa a palavra BOLA?', options: ['B', 'D', 'P'], correct: 'B' },
    { id: 'p2', date: today, type: 'ident', question: 'Qual dessas figuras começa com a letra A?', options: ['🍎', '⚽', '🚗'], correct: '🍎' },
  ],
  'Matemática': [
    { id: 'm1', date: today, type: 'sum', question: 'Quanto é 2 + 1?', options: ['2', '3', '4'], correct: '3' },
    { id: 'm2', date: today, type: 'sum', question: 'Quanto é 5 + 0?', options: ['0', '5', '10'], correct: '5' },
  ],
  'Ciências': [
    { id: 'c1', date: today, type: 'ident', question: 'Onde vive o PEIXE?', options: ['Água', 'Terra', 'Ar'], correct: 'Água' },
    { id: 'c2', date: today, type: 'ident', question: 'O que o SOL nos dá?', options: ['Chuva', 'Luz e Calor', 'Vento'], correct: 'Luz e Calor' },
  ]
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user, coins: user ? user.coins : 0 }),
      routines: [],
      setRoutines: (routines) => set({ routines }),
      coins: 0,
      addCoins: (amount) => set((state) => ({ 
        coins: state.coins + amount,
        user: state.user ? { ...state.user, coins: (state.user.coins || 0) + amount } : null
      })),
      unlockItem: (itemId, cost) => set((state) => {
        if (!state.user || state.coins < cost) return state;
        const newUnlocked = [...(state.user.unlockedItems || []), itemId];
        return {
          coins: state.coins - cost,
          user: {
            ...state.user,
            unlockedItems: newUnlocked,
            coins: state.coins - cost
          }
        };
      }),
      setAvatar: (avatar) => set((state) => ({
        user: state.user ? { ...state.user, avatar } : null
      })),
      turmas: [
        { id: 'turma-1', name: '1º Ano A', activities: DEFAULT_ACTIVITIES }
      ],
      setTurmas: (turmas) => set({ turmas }),
      users: [
        { uid: 'leo123', name: 'Leo', role: 'student', coins: 12, unlockedItems: [], turmaId: 'turma-1', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo', completedActivities: [], pin: '1234' },
        { uid: 'bia456', name: 'Bia', role: 'student', coins: 5, unlockedItems: [], turmaId: 'turma-1', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bia', completedActivities: [], pin: '5678' }
      ],
      setUsers: (users) => set({ users }),
      addStudent: (student) => set((state) => ({ users: [...state.users, student] })),
      deleteStudent: (uid) => set((state) => ({ users: state.users.filter(u => u.uid !== uid) })),
      updateTurmaActivities: (turmaId, subject, activities) => set((state) => ({
        turmas: state.turmas.map(t => t.id === turmaId ? { ...t, activities: { ...t.activities, [subject]: activities } } : t)
      })),
      renameSubject: (turmaId, oldName, newName) => set((state) => ({
        turmas: state.turmas.map(t => {
          if (t.id !== turmaId) return t;
          const newActivities = { ...t.activities };
          newActivities[newName] = newActivities[oldName];
          delete newActivities[oldName];
          return { ...t, activities: newActivities };
        })
      })),
      addSubject: (turmaId, name) => set((state) => ({
        turmas: state.turmas.map(t => {
          if (t.id !== turmaId) return t;
          return { ...t, activities: { ...t.activities, [name]: [] } };
        })
      })),
      deleteSubject: (turmaId, name) => set((state) => ({
        turmas: state.turmas.map(t => {
          if (t.id !== turmaId) return t;
          const newActivities = { ...t.activities };
          delete newActivities[name];
          return { ...t, activities: newActivities };
        })
      })),
      addTurma: (name) => set((state) => ({
        turmas: [...state.turmas, { id: `turma-${Date.now()}`, name, activities: { ...DEFAULT_ACTIVITIES } }]
      })),
      deleteTurma: (turmaId) => set((state) => ({
        turmas: state.turmas.filter(t => t.id !== turmaId)
      })),
      setMood: (mood) => set((state) => ({
        user: state.user ? { ...state.user, mood } : null
      })),
      completeActivity: (activityId) => set((state) => ({
        user: state.user ? { ...state.user, completedActivities: [...(state.user.completedActivities || []), activityId] } : null
      })),
    }),
    {
      name: 'aprendaplus-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
