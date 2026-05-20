import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
  avatarName?: string;
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
  setAvatarName: (name: string) => void;
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

async function updateFirestoreUser(userId: string, data: Partial<User>) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating firestore user:', error);
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user, coins: user ? user.coins : 0 }),
      routines: [],
      setRoutines: (routines) => set({ routines }),
      coins: 0,
      addCoins: (amount) => set((state) => {
        if (!state.user) return {};
        const newCoins = state.coins + amount;
        const updatedUser = { ...state.user, coins: newCoins };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);
        
        updateFirestoreUser(state.user.uid, { coins: newCoins });
        
        return {
          coins: newCoins,
          user: updatedUser,
          users: updatedUsers
        };
      }),
      unlockItem: (itemId, cost) => set((state) => {
        if (!state.user || state.coins < cost) return {};
        const newCoins = state.coins - cost;
        const newUnlocked = [...(state.user.unlockedItems || []), itemId];
        const updatedUser = {
          ...state.user,
          unlockedItems: newUnlocked,
          coins: newCoins
        };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);

        updateFirestoreUser(state.user.uid, {
          unlockedItems: newUnlocked,
          coins: newCoins
        });

        return {
          coins: newCoins,
          user: updatedUser,
          users: updatedUsers
        };
      }),
      setAvatar: (avatar) => set((state) => {
        if (!state.user) return {};
        const updatedUser = { ...state.user, avatar };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);

        updateFirestoreUser(state.user.uid, { avatar });

        return {
          user: updatedUser,
          users: updatedUsers
        };
      }),
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
      setMood: (mood) => set((state) => {
        if (!state.user) return {};
        const updatedUser = { ...state.user, mood };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);

        updateFirestoreUser(state.user.uid, { mood });

        return {
          user: updatedUser,
          users: updatedUsers
        };
      }),
      completeActivity: (activityId) => set((state) => {
        if (!state.user) return {};
        const newCompleted = [...(state.user.completedActivities || []), activityId];
        const updatedUser = {
          ...state.user,
          completedActivities: newCompleted
        };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);

        updateFirestoreUser(state.user.uid, {
          completedActivities: newCompleted
        });

        return {
          user: updatedUser,
          users: updatedUsers
        };
      }),
      setAvatarName: (avatarName) => set((state) => {
        if (!state.user) return {};
        const updatedUser = { ...state.user, avatarName };
        const updatedUsers = state.users.map(u => u.uid === state.user?.uid ? updatedUser : u);

        updateFirestoreUser(state.user.uid, { avatarName });

        return {
          user: updatedUser,
          users: updatedUsers
        };
      }),
    }),
    {
      name: 'aprendaplus-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
