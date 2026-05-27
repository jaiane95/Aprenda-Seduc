import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { ShieldCheck, User } from 'lucide-react';

export default function Login() {
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'student' | 'professor'>('student');
  
  // App store states
  const { turmas, users, setUser, setUsers, setTurmas } = useAppStore();
  
  // Student progression states
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pin.length === 4) {
      if (role === 'student' && selectedStudent) {
        const studentRecord = users.find(u => u.uid === selectedStudent.uid);
        // Fallback default pin is '1234' if none assigned
        const expectedPin = studentRecord?.pin || '1234';
        
        if (studentRecord && expectedPin === pin) {
          setUser(studentRecord);
          navigate('/home');
        } else {
          setErrorMsg('PIN incorreto! Tente novamente ou peça ajuda.');
          setPin('');
        }
      } else if (role === 'professor') {
        // Teacher login with 9999 master pin
        if (pin === '9999') {
          const mockUser = {
            uid: 'teacher456',
            name: 'Prof. Luísa',
            role: 'professor' as const,
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luisa',
            coins: 0,
            unlockedItems: [],
            completedActivities: []
          };
          setUser(mockUser);
          navigate('/professor');
        } else {
          setErrorMsg('PIN Professor inválido! (Dica: tente 9999)');
          setPin('');
        }
      }
    }
  };

  const addDigit = (digit: string) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  };

  // Reset progress when changing role
  const handleRoleChange = (newRole: 'student' | 'professor') => {
    setRole(newRole);
    setPin('');
    setSelectedTurmaId(null);
    setSelectedStudent(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-art-bg overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div className={`w-28 h-28 rounded-[40px] flex items-center justify-center mb-4 shadow-xl shadow-slate-200/50 mx-auto border-4 border-white ${role === 'student' ? 'bg-art-rose/90' : 'bg-art-teal/90'}`}>
          {role === 'student' && selectedStudent ? (
             <img src={selectedStudent.avatar} alt="Avatar" className="w-20 h-20 object-contain" />
          ) : role === 'student' ? (
             <User className="w-14 h-14 text-art-rose-dark opacity-80" />
          ) : (
            <ShieldCheck className="w-14 h-14 text-art-navy" />
          )}
        </div>
        <h1 className="text-4xl font-black text-art-purple-dark tracking-tight">APRENDA<span className="text-art-coral">+</span></h1>
        <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">
          {role === 'student' ? 'Bem-vindo, pequeno!' : 'Acesso do Educador'}
        </p>
      </motion.div>

      {/* Role Selection Switch */}
      <div className="flex bg-slate-100 p-1.5 rounded-full mb-8 w-full max-w-[240px] shrink-0 border border-slate-200">
        <button 
          onClick={() => handleRoleChange('student')}
          className={`flex-1 py-2.5 rounded-full transition-all text-xs font-black ${role === 'student' ? 'bg-white shadow-md text-art-navy font-black' : 'text-slate-400 font-bold'}`}
        >
          ALUNO
        </button>
        <button 
          onClick={() => handleRoleChange('professor')}
          className={`flex-1 py-2.5 rounded-full transition-all text-xs font-black ${role === 'professor' ? 'bg-white shadow-md text-art-navy font-black' : 'text-slate-400 font-bold'}`}
        >
          PROFESSOR
        </button>
      </div>

      {/* STEP 1: Select Turma */}
      {role === 'student' && !selectedTurmaId && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-6 rounded-[36px] shadow-md border-2 border-art-teal text-center space-y-4"
        >
          <h2 className="text-xl font-black text-art-navy uppercase tracking-wide">Escolha sua Turma:</h2>
          <div className="grid grid-cols-1 gap-3">
            {turmas.map(t => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTurmaId(t.id)}
                className="w-full p-4 bg-slate-50 hover:bg-art-teal/10 border-2 border-slate-100 hover:border-art-teal rounded-[24px] font-black text-lg text-art-navy flex items-center justify-between transition-colors shadow-sm art-btn-press"
              >
                <span>{t.name}</span>
                <span className="text-xs bg-art-teal/20 text-art-navy px-3 py-1 rounded-full font-black">
                  {users.filter(u => u.role === 'student' && u.turmaId === t.id).length} alunos
                </span>
              </motion.button>
            ))}
            {turmas.length === 0 && (
              <p className="text-slate-400 font-bold py-4">Nenhuma turma adicionada.</p>
            )}
          </div>
        </motion.div>
      )}

      {/* STEP 2: Choose Student */}
      {role === 'student' && selectedTurmaId && !selectedStudent && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-6 rounded-[36px] shadow-md border-2 border-art-peach text-center space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => setSelectedTurmaId(null)}
              className="text-[10px] font-black text-art-coral uppercase hover:underline"
            >
              ← Voltar
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
              {turmas.find(t => t.id === selectedTurmaId)?.name}
            </span>
          </div>
          
          <h2 className="text-xl font-black text-art-navy uppercase tracking-wide">Quem é você??</h2>
          
          <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-1 scrollbar-hide">
            {users.filter(u => u.role === 'student' && u.turmaId === selectedTurmaId).map(student => (
              <motion.button
                key={student.uid}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedStudent(student);
                  setErrorMsg(null);
                  setPin('');
                }}
                className="p-3 bg-slate-50 hover:bg-art-peach/10 border-2 border-slate-100 hover:border-art-peach rounded-[24px] text-center flex flex-col items-center justify-center space-y-1.5 transition-all shadow-sm"
              >
                <div className="w-12 h-12 bg-white rounded-xl p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                  <img src={student.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.name}`} alt={student.name} className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-art-navy text-xs block truncate w-full">{student.name}</span>
              </motion.button>
            ))}
            {users.filter(u => u.role === 'student' && u.turmaId === selectedTurmaId).length === 0 && (
              <div className="col-span-2 text-slate-400 font-bold py-6 text-sm">
                Nenhum aluno cadastrado nesta turma.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* STEP 3: Enter PIN (Available for Selected Student OR Professor) */}
      {((role === 'student' && selectedStudent) || role === 'professor') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center w-full max-w-xs"
        >
          {role === 'student' && selectedStudent && (
            <div className="text-center mb-4 w-full">
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => {
                    setSelectedStudent(null);
                    setPin('');
                    setErrorMsg(null);
                  }}
                  className="text-[10px] font-black text-art-coral uppercase hover:underline"
                >
                  ← Não sou eu
                </button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full truncate max-w-[120px]">
                  {selectedStudent.name}
                </span>
              </div>
              
              <div className="w-16 h-16 bg-white rounded-[20px] border-2 border-art-peach p-0.5 mx-auto shadow-md overflow-hidden flex items-center justify-center mb-2">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-black text-art-navy">Olá, {selectedStudent.name}!</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Digite seu PIN para entrar:</p>
            </div>
          )}

          {role === 'professor' && (
            <div className="text-center mb-4 w-full">
              <p className="text-xs text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Educador, digite seu PIN master:</p>
              <div className="inline-block bg-art-teal/10 text-art-teal border border-art-teal/20 px-3 py-1 rounded-full text-xs font-black">
                PIN: 9999
              </div>
            </div>
          )}

          {errorMsg && (
            <motion.div 
              key={errorMsg}
              initial={{ x: -10 }} 
              animate={{ x: [0, -10, 10, -10, 10, 0] }}
              className="bg-art-peach/10 text-art-peach-dark px-3 py-2 rounded-2xl text-xs font-black border border-art-peach/30 w-full text-center mb-3"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Dots Indicator */}
          <div className="flex gap-4 mb-4 justify-center">
            {[0, 1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                animate={pin.length > i ? { scale: [1, 1.25, 1] } : {}}
                className={`w-3.5 h-3.5 rounded-full transition-colors duration-200 ${pin.length > i ? 'bg-art-coral' : 'bg-slate-200'}`} 
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map(btn => (
                <motion.button
                  key={btn}
                  aria-label={btn === 'C' ? 'Limpar Pin' : btn === '✓' ? 'Confirmar Login' : `Número ${btn}`}
                  onClick={() => {
                    if (btn === 'C') {
                      setPin('');
                      setErrorMsg(null);
                    }
                    else if (btn === '✓') handleLogin();
                    else addDigit(btn);
                  }}
                  className={`h-14 rounded-[20px] text-xl font-black shadow-sm art-btn-press border-b-4 
                    ${btn === '✓' ? 'bg-art-teal border-art-sage-dark text-art-navy' : 'bg-white border-slate-100 text-art-navy'}
                    ${btn === 'C' ? 'text-art-peach-dark font-black' : ''}
                  `}
                >
                  {btn}
                </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
