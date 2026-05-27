import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Simple connection test
async function testConnection() {
  try {
    // Attempting to read a non-existent document to trigger a server roundtrip
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();

// Auto-bootstrap data to Firestore database if it's currently empty
export async function bootstrapFirebaseIfNeeded() {
  const usersPath = 'users';
  try {
    // 1. Seed users if empty
    const usersSnap = await getDocs(collection(db, usersPath));
    if (usersSnap.empty) {
      console.log('Seeding initial data to Firestore database...');
      const batch = writeBatch(db);

      // Seed mock students
      const students = [
        { uid: 'leo123', name: 'Leo', role: 'student', coins: 12, unlockedItems: [], turmaId: 'turma-1', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo', completedActivities: [], pin: '1234' },
        { uid: 'bia456', name: 'Bia', role: 'student', coins: 5, unlockedItems: [], turmaId: 'turma-1', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bia', completedActivities: [], pin: '5678' }
      ];

      for (const s of students) {
        batch.set(doc(db, 'users', s.uid), s);

        // Seed default routines for student
        const routines = [
          { time: '08:00', activity: 'Café da Manhã', completed: false, date: new Date().toISOString().split('T')[0], userId: s.uid },
          { time: '09:00', activity: 'Estudar Matemática', completed: false, date: new Date().toISOString().split('T')[0], userId: s.uid },
          { time: '10:00', activity: 'Brincar no Quintal', completed: false, date: new Date().toISOString().split('T')[0], userId: s.uid },
          { time: '11:00', activity: 'Hora do Almoço', completed: false, date: new Date().toISOString().split('T')[0], userId: s.uid },
        ];

        let rCount = 1;
        for (const r of routines) {
          batch.set(doc(db, `users/${s.uid}/routines`, `r-${s.uid}-${rCount++}`), r);
        }
      }

      // Seed teacher
      const teacher = {
        uid: 'teacher456',
        name: 'Prof. Luísa',
        role: 'professor',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luisa',
        coins: 0,
        unlockedItems: [],
        completedActivities: [],
        pin: '9999'
      };
      batch.set(doc(db, 'users', teacher.uid), teacher);

      // Seed default activities
      const today = new Date().toISOString().split('T')[0];
      const defaultActivities = [
        { id: 'p1', type: 'portuguese', question: 'Qual letra começa a palavra BOLA?', options: ['B', 'D', 'P'], correctAnswer: 'B', date: today },
        { id: 'p2', type: 'portuguese', question: 'Qual dessas figuras começa com a letra A?', options: ['🍎', '⚽', '🚗'], correctAnswer: '🍎', date: today },
        { id: 'm1', type: 'math', question: 'Quanto é 2 + 1?', options: ['2', '3', '4'], correctAnswer: '3', date: today },
        { id: 'm2', type: 'math', question: 'Quanto é 5 + 0?', options: ['0', '5', '10'], correctAnswer: '5', date: today },
      ];

      for (const a of defaultActivities) {
        batch.set(doc(db, 'activities', a.id), a);
      }

      await batch.commit();
      console.log('Successfully bootstrapped Firestore database users!');
    }

    // 2. Seed turmas if empty
    const turmasSnap = await getDocs(collection(db, 'turmas'));
    if (turmasSnap.empty) {
      console.log('Seeding initial turmas to Firestore database...');
      const today = new Date().toISOString().split('T')[0];
      const defaultTurma = {
        id: 'turma-1',
        name: '1º Ano A',
        activities: {
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
        }
      };
      await setDoc(doc(db, 'turmas', 'turma-1'), defaultTurma);
      console.log('Successfully bootstrapped turmas in Firestore!');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, usersPath);
  }
}
