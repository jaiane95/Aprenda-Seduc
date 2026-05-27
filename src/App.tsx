import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { db, bootstrapFirebaseIfNeeded } from './services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Screens (to be implemented)
import Login from './screens/Login';
import Home from './screens/Home';
import Routine from './screens/Routine';
import Learn from './screens/Learn';
import Activity from './screens/Activity';
import Help from './screens/Help';
import AvatarScreen from './screens/AvatarScreen';
import Professor from './screens/Professor';
import Manager from './screens/Manager';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'student' | 'professor' | 'manager' }) => {
  const user = useAppStore((state) => state.user);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) {
    if (user.role === 'manager') return <Navigate to="/manager" />;
    if (user.role === 'professor') return <Navigate to="/professor" />;
    return <Navigate to="/home" />;
  }
  return <>{children}</>;
};

export default function App() {
  const { user, setUser, setUsers, setTurmas } = useAppStore();

  useEffect(() => {
    async function initFirebaseData() {
      // 1. Run bootstrap/seeding
      try {
        await bootstrapFirebaseIfNeeded();
      } catch (error) {
        console.warn('Firebase bootstrap skipped or failed:', error);
      }
      
      // 2. Load users
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const loadedUsers = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any));
        if (loadedUsers.length > 0) {
          setUsers(loadedUsers);
          
          // Sync current logged-in user if exists
          if (user) {
            const freshUser = loadedUsers.find(u => u.uid === user.uid);
            if (freshUser) {
              setUser(freshUser);
            }
          }
        }
      } catch (error) {
        console.error('Error loading users from Firestore:', error);
      }

      // 3. Load turmas
      try {
        const turmasSnap = await getDocs(collection(db, 'turmas'));
        const loadedTurmas = turmasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        if (loadedTurmas.length > 0) {
          setTurmas(loadedTurmas);
        }
      } catch (error) {
        console.error('Error loading turmas from Firestore:', error);
      }
    }
    initFirebaseData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-art-bg shadow-2xl relative overflow-hidden flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/routine" 
            element={
              <ProtectedRoute role="student">
                <Routine />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute role="student">
                <Learn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/:category" 
            element={
              <ProtectedRoute role="student">
                <Activity />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help" 
            element={
              <ProtectedRoute role="student">
                <Help />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/avatar" 
            element={
              <ProtectedRoute role="student">
                <AvatarScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/professor" 
            element={
              <ProtectedRoute role="professor">
                <Professor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute role="manager">
                <Manager />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}
