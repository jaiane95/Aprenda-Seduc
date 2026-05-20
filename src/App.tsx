import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

// Screens (to be implemented)
import Login from './screens/Login';
import Home from './screens/Home';
import Routine from './screens/Routine';
import Learn from './screens/Learn';
import Activity from './screens/Activity';
import Help from './screens/Help';
import AvatarScreen from './screens/AvatarScreen';
import Professor from './screens/Professor';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'student' | 'professor' }) => {
  const user = useAppStore((state) => state.user);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/home" />;
  return <>{children}</>;
};

export default function App() {
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
        </Routes>
      </div>
    </Router>
  );
}
