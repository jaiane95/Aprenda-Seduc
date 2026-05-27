import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Users, Bell, ThumbsUp, Clock, AlertTriangle, 
  Plus, BookOpen, Settings, Layout, Save, Trash2, Edit2, Check, ChevronLeft, ChevronRight, BarChart2, X 
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAppStore, ActivityItem } from '../store/useAppStore';

interface Alert {
  id: string;
  userName: string;
  type: string;
  timestamp: any;
}

export default function Professor() {
  const navigate = useNavigate();
  const { turmas, users, addStudent, deleteStudent, setUsers, updateTurmaActivities, renameSubject, addSubject, deleteSubject, addTurma, deleteTurma } = useAppStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'students' | 'turmas' | 'activities'>('alerts');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isAddingTurma, setIsAddingTurma] = useState(false);
  const [newTurmaName, setNewTurmaName] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', turmaId: 'turma-1', pin: '' });
  const [editingTurmaId, setEditingTurmaId] = useState('turma-1');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({ question: '', option1: '', option2: '', option3: '', correct: '' });
  const [filterTurmaId, setFilterTurmaId] = useState<string>('all');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentEditForm, setStudentEditForm] = useState({ name: '', pin: '', turmaId: '' });

  useEffect(() => {
    const fieldPath = 'alerts';
    const q = query(collection(db, fieldPath), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, fieldPath);
    });
    return () => unsubscribe();
  }, []);

  const handleClearAllAlerts = async () => {
    if (alerts.length === 0) return;
    if (!window.confirm(`Deseja apagar todos os ${alerts.length} alerta(s)? Esta ação não pode ser desfeita.`)) return;
    try {
      const batch = writeBatch(db);
      alerts.forEach(alert => {
        batch.delete(doc(db, 'alerts', alert.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'alerts');
    }
  };

  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [reportTab, setReportTab] = useState<'summary' | 'mood' | 'activities'>('summary');

  useEffect(() => {
    if (!selectedStudent) {
      setMoodLogs([]);
      setActivityLogs([]);
      setPurchaseLogs([]);
      return;
    }

    async function loadStudentLogs() {
      setIsLoadingLogs(true);
      try {
        const moodSnap = await getDocs(
          query(collection(db, `users/${selectedStudent.uid}/mood_logs`), orderBy('timestamp', 'desc'))
        );
        const activitySnap = await getDocs(
          query(collection(db, `users/${selectedStudent.uid}/activity_logs`), orderBy('timestamp', 'desc'))
        );
        const purchaseSnap = await getDocs(
          query(collection(db, `users/${selectedStudent.uid}/purchase_logs`), orderBy('timestamp', 'desc'))
        );

        let moods = moodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let activities = activitySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let purchases = purchaseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Seeding mock historical data on-demand if the database logs are entirely empty
        if (moodSnap.empty && activitySnap.empty && purchaseSnap.empty) {
          const batch = writeBatch(db);
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          
          const moodsToSeed = [
            { mood: '😊 Feliz', date: today, timestamp: new Date().toISOString() },
            { mood: '😴 Cansado', date: yesterday, timestamp: new Date(Date.now() - 86400000).toISOString() }
          ];
          for (const m of moodsToSeed) {
            batch.set(doc(collection(db, `users/${selectedStudent.uid}/mood_logs`)), m);
          }

          const activitiesToSeed = [
            { activityId: 'p1', category: 'Português', question: 'Qual letra começa a palavra BOLA?', answer: 'B', isCorrect: true, date: today, timestamp: new Date().toISOString() },
            { activityId: 'm1', category: 'Matemática', question: 'Quanto é 2 + 1?', answer: '2', isCorrect: false, date: today, timestamp: new Date(Date.now() - 5000).toISOString() },
            { activityId: 'm1', category: 'Matemática', question: 'Quanto é 2 + 1?', answer: '3', isCorrect: true, date: today, timestamp: new Date().toISOString() },
            { activityId: 'c1', category: 'Ciências', question: 'Onde vive o PEIXE?', answer: 'Água', isCorrect: true, date: yesterday, timestamp: new Date(Date.now() - 86400000).toISOString() }
          ];
          for (const a of activitiesToSeed) {
            batch.set(doc(collection(db, `users/${selectedStudent.uid}/activity_logs`)), a);
          }

          const purchasesToSeed = [
            { itemId: 'boneco-1', cost: 10, date: today, timestamp: new Date().toISOString() }
          ];
          for (const p of purchasesToSeed) {
            batch.set(doc(collection(db, `users/${selectedStudent.uid}/purchase_logs`)), p);
          }

          await batch.commit();
          
          // Refetch
          const refetchedMood = await getDocs(query(collection(db, `users/${selectedStudent.uid}/mood_logs`), orderBy('timestamp', 'desc')));
          const refetchedActivity = await getDocs(query(collection(db, `users/${selectedStudent.uid}/activity_logs`), orderBy('timestamp', 'desc')));
          const refetchedPurchase = await getDocs(query(collection(db, `users/${selectedStudent.uid}/purchase_logs`), orderBy('timestamp', 'desc')));
          
          moods = refetchedMood.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          activities = refetchedActivity.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          purchases = refetchedPurchase.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setMoodLogs(moods);
        setActivityLogs(activities);
        setPurchaseLogs(purchases);
      } catch (error) {
        console.error('Error loading student logs:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    }

    loadStudentLogs();
  }, [selectedStudent]);

  const handleDeleteStudent = async (uid: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) {
      const fieldPath = `users/${uid}`;
      try {
        await deleteDoc(doc(db, 'users', uid));
        deleteStudent(uid);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, fieldPath);
      }
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    
    // Generate a 4-digit PIN if not provided or invalid
    let pin = newStudent.pin || '';
    if (pin.length !== 4 || isNaN(Number(pin))) {
      pin = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const student: any = {
      uid: `stu-${Date.now()}`,
      name: newStudent.name,
      role: 'student',
      coins: 0,
      unlockedItems: [],
      turmaId: newStudent.turmaId,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newStudent.name}`,
      pin: pin,
      completedActivities: []
    };

    const fieldPath = `users/${student.uid}`;
    try {
      await setDoc(doc(db, 'users', student.uid), student);
      
      // Seed default routines dynamically in Firestore for this new student!
      const routines = [
        { time: '08:00', activity: 'Café da Manhã', completed: false, date: new Date().toISOString().split('T')[0], userId: student.uid },
        { time: '09:00', activity: 'Estudar Matemática', completed: false, date: new Date().toISOString().split('T')[0], userId: student.uid },
        { time: '10:00', activity: 'Brincar no Quintal', completed: false, date: new Date().toISOString().split('T')[0], userId: student.uid },
        { time: '11:00', activity: 'Hora do Almoço', completed: false, date: new Date().toISOString().split('T')[0], userId: student.uid },
      ];
      
      const batch = writeBatch(db);
      let rCount = 1;
      for (const r of routines) {
        batch.set(doc(db, `users/${student.uid}/routines`, `r-${student.uid}-${rCount++}`), r);
      }
      await batch.commit();

      addStudent(student);
      setNewStudent({ name: '', turmaId: 'turma-1', pin: '' });
      setIsAddingStudent(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, fieldPath);
    }
  };

  const handleStartEditStudent = (student: any) => {
    setEditingStudentId(student.uid);
    setStudentEditForm({
      name: student.name,
      pin: student.pin || '1234',
      turmaId: student.turmaId || 'turma-1'
    });
  };

  const handleSaveStudent = async (uid: string) => {
    if (!studentEditForm.name.trim()) return;
    if (studentEditForm.pin.length !== 4 || isNaN(Number(studentEditForm.pin))) {
      alert("O PIN deve ter exatamente 4 números!");
      return;
    }

    const currentStudent = users.find(u => u.uid === uid);
    const newAvatar = currentStudent?.avatar?.includes('seed=') ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${studentEditForm.name}` : currentStudent?.avatar;

    const fieldPath = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), {
        name: studentEditForm.name,
        pin: studentEditForm.pin,
        turmaId: studentEditForm.turmaId,
        avatar: newAvatar
      });

      const updatedUsers = users.map(u => {
        if (u.uid === uid) {
          return {
            ...u,
            name: studentEditForm.name,
            pin: studentEditForm.pin,
            turmaId: studentEditForm.turmaId,
            avatar: newAvatar
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      setEditingStudentId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, fieldPath);
    }
  };

  const handleRename = (oldName: string) => {
    if (!newSubjectName || newSubjectName === oldName) {
      setEditingSubject(null);
      return;
    }
    renameSubject(editingTurmaId, oldName, newSubjectName);
    setEditingSubject(null);
  };

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleUpdateActivityDate = (subject: string, activityId: string, newDate: string) => {
    const currentTurma = turmas.find(t => t.id === editingTurmaId);
    if (!currentTurma) return;
    
    const acts = currentTurma.activities[subject].map(a => 
      a.id === activityId ? { ...a, date: newDate } : a
    );
    updateTurmaActivities(editingTurmaId, subject, acts);
  };

  const handleAddActivity = (subject: string) => {
    const currentTurma = turmas.find(t => t.id === editingTurmaId);
    if (!currentTurma) return;
    
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'ident',
      question: 'Nova Questão',
      options: ['Opção 1', 'Opção 2', 'Opção 3'],
      correct: 'Opção 1',
      date: selectedDate
    };
    
    const updatedActs = [...(currentTurma.activities[subject] || []), newAct];
    updateTurmaActivities(editingTurmaId, subject, updatedActs);
  };

  const handleDeleteActivity = (subject: string, activityId: string) => {
    const currentTurma = turmas.find(t => t.id === editingTurmaId);
    if (!currentTurma) return;
    const updatedActs = currentTurma.activities[subject].filter(a => a.id !== activityId);
    updateTurmaActivities(editingTurmaId, subject, updatedActs);
  };

  const handleEditActivity = (subject: string, act: any) => {
    setEditingActivityId(act.id);
    setActivityForm({
      question: act.question,
      option1: act.options[0],
      option2: act.options[1],
      option3: act.options[2],
      correct: act.correct
    });
  };

  const handleSaveActivity = (subject: string) => {
    const currentTurma = turmas.find(t => t.id === editingTurmaId);
    if (!currentTurma) return;
    
    const updatedActs = currentTurma.activities[subject].map(a => {
      if (a.id === editingActivityId) {
        return {
          ...a,
          question: activityForm.question,
          options: [activityForm.option1, activityForm.option2, activityForm.option3],
          correct: activityForm.correct
        };
      }
      return a;
    });
    
    updateTurmaActivities(editingTurmaId, subject, updatedActs);
    setEditingActivityId(null);
  };

  const handleDeleteSubject = (name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a disciplina ${name}?`)) {
      deleteSubject(editingTurmaId, name);
    }
  };
  
  const handleAddTurma = () => {
    if (!newTurmaName) return;
    addTurma(newTurmaName);
    setNewTurmaName('');
    setIsAddingTurma(false);
  };

  const handleDeleteTurma = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a turma ${name}? Todos os alunos e atividades serão perdidos.`)) {
      deleteTurma(id);
    }
  };

  const studentsInTurma = users.filter(u => u.role === 'student');
  const filteredStudents = studentsInTurma.filter(u => filterTurmaId === 'all' || u.turmaId === filterTurmaId);

  // Computed metrics for Student Report Dashboard
  const totalAttempts = activityLogs.length;
  const totalCorrect = activityLogs.filter(log => log.isCorrect).length;
  const totalErrors = activityLogs.filter(log => !log.isCorrect).length;
  const successRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const subjectsList = ['Português', 'Matemática', 'Ciências'];
  const subjectStats = subjectsList.map(sub => {
    const logs = activityLogs.filter(log => log.category === sub);
    const correct = logs.filter(log => log.isCorrect).length;
    const attempts = logs.length;
    const rate = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    return { name: sub, attempts, correct, rate };
  });

  return (
    <div className="flex-1 flex flex-col bg-art-bg relative overflow-hidden">
      <header className="p-6 bg-art-navy text-white flex items-center justify-between shadow-lg z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-black tracking-tight">Painel Professor</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell size={24} strokeWidth={2.5} className={alerts.length > 0 ? "animate-bounce text-art-coral" : "text-white/60"} />
            {alerts.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-art-coral rounded-full border-2 border-art-navy" />}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white px-4 pt-4 shadow-sm border-b border-art-border z-10 overflow-x-auto scrollbar-hide shrink-0">
        <button 
          onClick={() => { setActiveTab('alerts'); setSelectedStudent(null); }}
          className={`px-4 py-4 font-black flex items-center space-x-2 shrink-0 transition-all ${activeTab === 'alerts' ? 'text-art-navy border-b-4 border-art-teal' : 'text-slate-300'}`}
        >
          <AlertTriangle size={18} />
          <span className="uppercase tracking-widest text-[10px]">Alertas</span>
        </button>
        <button 
          onClick={() => { setActiveTab('students'); setSelectedStudent(null); }}
          className={`px-4 py-4 font-black flex items-center space-x-2 shrink-0 transition-all ${activeTab === 'students' ? 'text-art-navy border-b-4 border-art-teal' : 'text-slate-300'}`}
        >
          <Users size={18} />
          <span className="uppercase tracking-widest text-[10px]">Alunos</span>
        </button>
        <button 
          onClick={() => { setActiveTab('turmas'); setSelectedStudent(null); }}
          className={`px-4 py-4 font-black flex items-center space-x-2 shrink-0 transition-all ${activeTab === 'turmas' ? 'text-art-navy border-b-4 border-art-teal' : 'text-slate-300'}`}
        >
          <Layout size={18} />
          <span className="uppercase tracking-widest text-[10px]">Turmas</span>
        </button>
        <button 
          onClick={() => { setActiveTab('activities'); setSelectedStudent(null); }}
          className={`px-4 py-4 font-black flex items-center space-x-2 shrink-0 transition-all ${activeTab === 'activities' ? 'text-art-navy border-b-4 border-art-teal' : 'text-slate-300'}`}
        >
          <BookOpen size={18} />
          <span className="uppercase tracking-widest text-[10px]">Atividades</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Header com botão de limpar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-art-navy">Central de Alertas</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} recebido{alerts.length !== 1 ? 's' : ''}
                </p>
              </div>
              {alerts.length > 0 && (
                <button
                  onClick={handleClearAllAlerts}
                  className="flex items-center gap-2 px-4 py-2.5 bg-art-peach/10 hover:bg-art-peach/20 border-2 border-art-peach-border text-art-peach-dark rounded-2xl font-black text-xs uppercase tracking-widest transition-all art-btn-press"
                  title="Limpar todos os alertas"
                >
                  <Trash2 size={14} />
                  Limpar Todos
                </button>
              )}
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-24 text-slate-300">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-art-border">
                  <ThumbsUp size={48} className="opacity-20" />
                </div>
                <p className="font-bold text-slate-400">Nenhum alerta agora.<br/>Tudo tranquilo na sala!</p>
              </div>
            )}
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border-l-8 border-art-peach-border flex items-start space-x-5"
              >
                <div className="bg-art-peach p-3 rounded-2xl">
                  <AlertTriangle size={24} className="text-art-peach-dark" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-black text-art-navy tracking-tight">{alert.userName}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <Clock size={12} className="mr-1" />
                        {alert.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await deleteDoc(doc(db, 'alerts', alert.id));
                          } catch (error) {
                            handleFirestoreError(error, OperationType.DELETE, `alerts/${alert.id}`);
                          }
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-art-coral/10 hover:text-art-coral text-slate-300 rounded-xl transition-all"
                        title="Descartar este alerta"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium leading-tight">Estado: <strong className="text-art-peach-dark uppercase tracking-wide bg-art-peach/30 px-2 py-0.5 rounded-lg">{alert.type}</strong></p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-black text-art-navy">Alunos Cadastrados</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Total: {filteredStudents.length} Aluno{filteredStudents.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={filterTurmaId}
                  onChange={e => setFilterTurmaId(e.target.value)}
                  className="bg-white border-2 border-art-teal rounded-xl px-4 py-2 font-bold text-sm"
                >
                  <option value="all">Todas as Turmas</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button 
                  onClick={() => setIsAddingStudent(!isAddingStudent)}
                  className="bg-art-teal p-3 rounded-2xl text-art-navy art-btn-press border-b-4 border-art-sage-dark shrink-0"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {isAddingStudent && (
              <div className="bg-white p-6 rounded-[32px] shadow-lg border-2 border-art-teal space-y-4">
                <input 
                  type="text" 
                  placeholder="Nome do Aluno"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-art-teal"
                />
                <select 
                   value={newStudent.turmaId}
                   onChange={e => setNewStudent({...newStudent, turmaId: e.target.value})}
                   className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-600"
                >
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="PIN de 4 dígitos (opcional, vazio para auto-gerar)"
                  value={newStudent.pin}
                  onChange={e => setNewStudent({...newStudent, pin: e.target.value.replace(/\D/g, '')})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-art-teal text-sm"
                />
                <button 
                  onClick={handleAddStudent}
                  className="w-full py-4 bg-art-navy text-white rounded-2xl font-black uppercase tracking-widest art-btn-press"
                >
                  Cadastrar Aluno
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 font-sans">
              {filteredStudents.map((student) => {
                const isEditing = editingStudentId === student.uid;
                
                return (
                  <div key={student.uid} className="bg-white p-6 rounded-[32px] shadow-sm border border-art-border transition-all">
                    {isEditing ? (
                      <div className="space-y-4 text-left">
                        <h4 className="font-black text-art-navy text-sm uppercase tracking-wider mb-2">Editar Aluno</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome</label>
                            <input 
                              type="text" 
                              value={studentEditForm.name}
                              onChange={e => setStudentEditForm({...studentEditForm, name: e.target.value})}
                              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">PIN (4 números)</label>
                            <input 
                              type="text" 
                              maxLength={4}
                              value={studentEditForm.pin}
                              onChange={e => setStudentEditForm({...studentEditForm, pin: e.target.value.replace(/\D/g, '')})}
                              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Turma</label>
                            <select 
                              value={studentEditForm.turmaId}
                              onChange={e => setStudentEditForm({...studentEditForm, turmaId: e.target.value})}
                              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-sm"
                            >
                              {turmas.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                          <button 
                            onClick={() => handleSaveStudent(student.uid)} 
                            className="px-6 py-2.5 bg-art-teal text-art-navy rounded-xl font-black text-[10px] uppercase art-btn-press"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingStudentId(null)} 
                            className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-art-teal/20 rounded-2xl p-2 overflow-hidden flex-shrink-0">
                             <img src={student.avatar} alt={student.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-black text-lg text-art-navy truncate">{student.name}</h4>
                              <span className="bg-art-rose/10 text-art-rose border border-art-rose/20 px-2.5 py-0.5 rounded-full text-xs font-black">
                                PIN: {student.pin || '1234'}
                              </span>
                              {student.mood && (
                                <span className="bg-art-yellow/20 text-art-purple-dark px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border border-art-yellow/50">
                                  Mood: {student.mood}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {turmas.find(t => t.id === student.turmaId)?.name || 'Sem turma'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:text-art-teal hover:bg-art-teal/5 transition-all"
                            title="Ver Relatório de Desempenho"
                          >
                            <BarChart2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStartEditStudent(student)}
                            className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:text-art-teal hover:bg-art-teal/5 transition-all"
                            title="Editar Aluno"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.uid, student.name)}
                            className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:text-art-coral hover:bg-art-coral/5 transition-all"
                            title="Excluir Aluno"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-300 font-bold">
                  Nenhum aluno cadastrado nesta turma.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'turmas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-art-navy">Gestão de Turmas</h2>
              <button 
                onClick={() => setIsAddingTurma(!isAddingTurma)}
                className="bg-art-teal p-3 rounded-2xl text-art-navy art-btn-press border-b-4 border-art-sage-dark"
              >
                <Plus size={20} />
              </button>
            </div>

            {isAddingTurma && (
              <div className="bg-white p-6 rounded-[32px] shadow-lg border-2 border-art-teal space-y-4">
                <input 
                  type="text" 
                  placeholder="Nome da Nova Turma (ex: 2º Ano B)"
                  value={newTurmaName}
                  onChange={e => setNewTurmaName(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-art-teal"
                />
                <button 
                  onClick={handleAddTurma}
                  className="w-full py-4 bg-art-navy text-white rounded-2xl font-black uppercase tracking-widest art-btn-press"
                >
                  Criar Nova Turma
                </button>
              </div>
            )}

            {turmas.map(turma => (
              <div key={turma.id} className="bg-white p-8 rounded-[48px] shadow-sm border border-art-border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-art-navy">{turma.name}</h3>
                  <div className="bg-slate-100 px-4 py-2 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest">
                    {users.filter(u => u.turmaId === turma.id).length} Alunos
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditingTurmaId(turma.id); setActiveTab('activities'); }} className="flex-1 py-4 bg-art-teal text-art-navy rounded-2xl font-black uppercase tracking-widest text-[10px] art-btn-press border-b-4 border-art-sage-dark">
                    Configurar Atividades
                  </button>
                  <button 
                    onClick={() => handleDeleteTurma(turma.id, turma.name)}
                    className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:text-art-coral hover:bg-art-coral/5 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <div>
                 <h2 className="text-2xl font-black text-art-navy">Atividades</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                   Editando: {turmas.find(t => t.id === editingTurmaId)?.name}
                 </p>
               </div>
               <select 
                 value={editingTurmaId}
                 onChange={e => setEditingTurmaId(e.target.value)}
                 className="bg-white border-2 border-art-teal rounded-2xl px-4 py-2 font-bold text-sm"
               >
                 {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </div>

            {/* Date Swiper */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[32px] border-2 border-art-teal shadow-md mb-8">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-3 bg-slate-50 rounded-2xl text-art-navy hover:bg-art-teal transition art-btn-press"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">DATA DAS LIÇÕES</span>
                <span className="text-lg font-black text-art-navy capitalize">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }).replace('-feira', '')}
                </span>
              </div>

              <button 
                onClick={() => {
                  const d = new Date(selectedDate + 'T00:00:00');
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-3 bg-slate-50 rounded-2xl text-art-navy hover:bg-art-teal transition art-btn-press"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>

            <button 
              onClick={() => addSubject(editingTurmaId, `Nova Disciplina ${Object.keys(turmas.find(t => t.id === editingTurmaId)?.activities || {}).length + 1}`)}
              className="w-full py-4 bg-white border-4 border-dashed border-slate-200 rounded-[48px] text-slate-300 font-black uppercase tracking-widest text-xs hover:border-art-teal hover:text-art-teal transition-all mb-8 shadow-sm"
            >
              + Criar Nova Disciplina
            </button>

            {Object.entries(turmas.find(t => t.id === editingTurmaId)?.activities || {}).map(([subject, acts]) => {
              const filteredActs = acts.filter(a => a.date === selectedDate);
              return (
                <div key={subject} className="bg-white p-8 rounded-[48px] shadow-sm border border-art-border">
                  <div className="flex justify-between items-center mb-6">
                    {editingSubject === subject ? (
                      <div className="flex items-center space-x-2">
                         <input 
                           type="text"
                           value={newSubjectName}
                           onChange={e => setNewSubjectName(e.target.value)}
                           autoFocus
                           className="bg-slate-50 border-2 border-art-teal rounded-xl px-3 py-1 font-black text-art-navy text-sm"
                         />
                         <button onClick={() => handleRename(subject)} className="p-2 bg-art-teal text-art-navy rounded-xl">
                           <Check size={16} />
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-black text-art-navy capitalize">{subject}</h3>
                        <button 
                          onClick={() => { setEditingSubject(subject); setNewSubjectName(subject); }}
                          className="p-1 text-slate-300 hover:text-art-teal"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject)}
                          className="p-1 text-slate-300 hover:text-art-coral"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {filteredActs.length} de {acts.length} Para {selectedDate.split('-').reverse().slice(0,2).join('/')}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {filteredActs.map((act, i) => (
                      <div key={act.id} className="p-4 bg-slate-50 rounded-2xl space-y-4">
                         {editingActivityId === act.id ? (
                           <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <input 
                               value={activityForm.question} 
                               onChange={e => setActivityForm({...activityForm, question: e.target.value})}
                               className="w-full p-3 rounded-xl bg-white border-2 border-art-teal text-sm font-bold"
                               placeholder="Pergunta"
                             />
                             <div className="grid grid-cols-3 gap-2">
                               <input value={activityForm.option1} onChange={e => setActivityForm({...activityForm, option1: e.target.value})} className="p-2 rounded-lg bg-white text-xs font-bold border" placeholder="Op 1" />
                               <input value={activityForm.option2} onChange={e => setActivityForm({...activityForm, option2: e.target.value})} className="p-2 rounded-lg bg-white text-xs font-bold border" placeholder="Op 2" />
                               <input value={activityForm.option3} onChange={e => setActivityForm({...activityForm, option3: e.target.value})} className="p-2 rounded-lg bg-white text-xs font-bold border" placeholder="Op 3" />
                             </div>
                             <select 
                               value={activityForm.correct} 
                               onChange={e => setActivityForm({...activityForm, correct: e.target.value})}
                               className="w-full p-2 rounded-lg bg-white text-xs font-bold border"
                             >
                               <option value="">Selecione a Resposta Correta</option>
                               {[activityForm.option1, activityForm.option2, activityForm.option3].map(o => (
                                 <option key={o} value={o}>{o}</option>
                               ))}
                             </select>
                             <div className="flex gap-2">
                               <button onClick={() => handleSaveActivity(subject)} className="flex-1 py-2 bg-art-teal text-art-navy rounded-xl font-black text-[10px] uppercase">Salvar</button>
                               <button onClick={() => setEditingActivityId(null)} className="flex-1 py-2 bg-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
                             </div>
                           </div>
                         ) : (
                           <>
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <p className="font-bold text-sm text-art-navy">P: {act.question}</p>
                                 <div className="flex gap-2 mt-2">
                                   {act.options.map((opt, oi) => (
                                     <span key={oi} className={`text-[10px] px-2 py-1 rounded-lg ${opt === act.correct ? 'bg-art-teal text-art-navy font-black' : 'bg-white text-slate-400'}`}>
                                       {opt}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                               <div className="flex flex-col items-end space-y-2">
                                 <input 
                                   type="date" 
                                   value={act.date}
                                   onChange={(e) => handleUpdateActivityDate(subject, act.id, e.target.value)}
                                   className="text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold"
                                 />
                                 <div className="flex space-x-1">
                                   <button onClick={() => handleEditActivity(subject, act)} className="p-2 text-slate-300 hover:text-art-teal bg-white rounded-lg"><Edit2 size={14} /></button>
                                   <button onClick={() => handleDeleteActivity(subject, act.id)} className="p-2 text-slate-300 hover:text-art-coral bg-white rounded-lg"><Trash2 size={14} /></button>
                                 </div>
                               </div>
                             </div>
                           </>
                         )}
                      </div>
                    ))}
                    {filteredActs.length === 0 && (
                      <p className="text-center py-4 text-xs font-bold text-slate-300 italic">Nenhuma questão agendada para hoje.</p>
                    )}
                    <button 
                      onClick={() => handleAddActivity(subject)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 font-black uppercase text-[10px] hover:border-art-teal hover:text-art-teal transition-all"
                    >
                      + Adicionar Questão
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Relatório de Desempenho do Aluno */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-2xl bg-art-bg h-full flex flex-col shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-6 bg-art-navy text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl p-1.5 overflow-hidden flex-shrink-0">
                  <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{selectedStudent.name}</h2>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {turmas.find(t => t.id === selectedStudent.turmaId)?.name || 'Sem turma'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="p-2.5 hover:bg-white/10 rounded-2xl transition"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Inner Tabs */}
            <div className="flex bg-white px-4 border-b border-art-border shrink-0">
              <button 
                onClick={() => setReportTab('summary')}
                className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-center border-b-4 transition-all ${reportTab === 'summary' ? 'text-art-navy border-art-teal' : 'text-slate-300'}`}
              >
                Resumo Geral
              </button>
              <button 
                onClick={() => setReportTab('mood')}
                className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-center border-b-4 transition-all ${reportTab === 'mood' ? 'text-art-navy border-art-teal' : 'text-slate-300'}`}
              >
                Histórico de Humor
              </button>
              <button 
                onClick={() => setReportTab('activities')}
                className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-center border-b-4 transition-all ${reportTab === 'activities' ? 'text-art-navy border-art-teal' : 'text-slate-300'}`}
              >
                Atividades ({activityLogs.length})
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="w-12 h-12 border-4 border-art-teal border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 font-bold animate-pulse text-sm">Carregando relatório do aluno...</p>
                </div>
              ) : (
                <>
                  {reportTab === 'summary' && (
                    <div className="space-y-6">
                      {/* Metric Cards Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-art-border flex flex-col justify-between shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moedas Acumuladas</span>
                          <span className="text-3xl font-black text-art-yellow-dark mt-2">⭐ {selectedStudent.coins || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-art-border flex flex-col justify-between shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Itens Comprados</span>
                          <span className="text-3xl font-black text-art-teal mt-2">🛍️ {selectedStudent.unlockedItems?.length || 0} itens</span>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-art-border flex flex-col justify-between shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tentativas Realizadas</span>
                          <span className="text-3xl font-black text-art-navy mt-2">📝 {totalAttempts}</span>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-art-border flex flex-col justify-between shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Taxa de Acerto</span>
                          <span className="text-3xl font-black text-art-rose mt-2">🎯 {successRate}%</span>
                        </div>
                      </div>

                      {/* Performance by Subject */}
                      <div className="bg-white p-6 rounded-[32px] border border-art-border shadow-sm space-y-4">
                        <h3 className="font-black text-art-navy text-sm uppercase tracking-wide">Desempenho por Disciplina</h3>
                        <div className="space-y-4">
                          {subjectStats.map(stat => (
                            <div key={stat.name} className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-black text-art-navy">
                                <span>{stat.name}</span>
                                <span>{stat.correct}/{stat.attempts} acertos ({stat.rate}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200">
                                <div 
                                  className="bg-art-teal h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${stat.rate}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Purchase log list */}
                      <div className="bg-white p-6 rounded-[32px] border border-art-border shadow-sm space-y-4">
                        <h3 className="font-black text-art-navy text-sm uppercase tracking-wide">Últimas Compras na Loja</h3>
                        {purchaseLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Nenhum item comprado ainda.</p>
                        ) : (
                          <div className="space-y-3">
                            {purchaseLogs.map((p, idx) => (
                              <div key={p.id || idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <div>
                                  <span className="text-sm font-black text-art-navy">ID do Item: {p.itemId}</span>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">{p.date}</p>
                                </div>
                                <span className="text-xs font-black text-art-yellow-dark">⭐ {p.cost} moedas</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {reportTab === 'mood' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-[32px] border border-art-border shadow-sm space-y-4">
                        <h3 className="font-black text-art-navy text-sm uppercase tracking-wide">Linha do Tempo de Sentimentos</h3>
                        {moodLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Nenhum registro de humor ainda.</p>
                        ) : (
                          <div className="relative border-l-4 border-slate-100 ml-4 pl-6 space-y-6 py-2">
                            {moodLogs.map((m, idx) => (
                              <div key={m.id || idx} className="relative">
                                {/* Dot */}
                                <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-art-teal rounded-full border-4 border-white" />
                                <div>
                                  <span className="text-xs font-black text-slate-400 uppercase">{m.date}</span>
                                  <h4 className="text-2xl font-black text-art-navy mt-1">{m.mood}</h4>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {reportTab === 'activities' && (
                    <div className="space-y-4">
                      {activityLogs.length === 0 ? (
                        <div className="bg-white p-8 rounded-[32px] border border-art-border text-center text-slate-400 font-bold">
                          Nenhuma atividade respondida ainda.
                        </div>
                      ) : (
                        activityLogs.map((log, idx) => (
                          <div key={log.id || idx} className="bg-white p-6 rounded-[32px] border border-art-border shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="bg-art-teal/20 text-art-navy border border-art-teal/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                                {log.category}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${log.isCorrect ? 'bg-art-lime/20 text-art-lime-dark border border-art-lime/30' : 'bg-art-peach/20 text-art-peach-dark border border-art-peach/30'}`}>
                                {log.isCorrect ? 'Acertou' : 'Errou'}
                              </span>
                            </div>
                            <h4 className="font-black text-art-navy text-sm">{log.question}</h4>
                            <div className="flex justify-between items-center text-xs">
                              <p className="font-bold text-slate-400">Resposta dada: <strong className="text-art-navy">{log.answer}</strong></p>
                              <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{log.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
