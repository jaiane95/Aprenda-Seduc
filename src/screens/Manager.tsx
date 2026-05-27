import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Users, Plus, Trash2, Building, BookOpen, ShieldCheck, Check, X 
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';

export default function Manager() {
  const { users, turmas, setUser, setUsers } = useAppStore();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [turmaId, setTurmaId] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter lists
  const professors = users.filter(u => u.role === 'professor');
  const students = users.filter(u => u.role === 'student');

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome do professor é obrigatório!');
      return;
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setErrorMsg('O PIN deve conter exatamente 4 números!');
      return;
    }

    // Verify if pin is already in use
    const pinExists = users.some(u => u.pin === pin);
    if (pinExists) {
      setErrorMsg('Este PIN já está em uso por outro usuário!');
      return;
    }

    try {
      const generatedId = `prof-${Date.now()}`;
      const newProf = {
        uid: generatedId,
        name: name.trim(),
        role: 'professor' as const,
        pin,
        turmaId: turmaId === 'all' ? undefined : turmaId,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`,
        coins: 0,
        unlockedItems: [],
        completedActivities: []
      };

      // Save to Firestore
      const userRef = doc(db, 'users', generatedId);
      await setDoc(userRef, newProf);

      // Update local state
      setUsers([...users, newProf]);

      // Reset form
      setName('');
      setPin('');
      setTurmaId('all');
      setShowAddForm(false);
      setSuccessMsg('Professor cadastrado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      setErrorMsg('Erro ao cadastrar no banco de dados. Tente novamente.');
    }
  };

  const handleDeleteProfessor = async (uid: string, profName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o(a) ${profName}?`)) return;

    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);

      // Update local state
      setUsers(users.filter(u => u.uid !== uid));
      setSuccessMsg('Professor removido com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users');
      setErrorMsg('Erro ao excluir do banco de dados.');
    }
  };

  // Helper selectors
  const getDisciplines = (prof: any) => {
    if (!prof.turmaId) {
      const allSubjects = new Set<string>();
      turmas.forEach(t => {
        if (t.activities) {
          Object.keys(t.activities).forEach(subj => allSubjects.add(subj));
        }
      });
      return Array.from(allSubjects);
    } else {
      const turmaObj = turmas.find(t => t.id === prof.turmaId);
      return turmaObj && turmaObj.activities ? Object.keys(turmaObj.activities) : [];
    }
  };

  const getStudentsForProf = (prof: any) => {
    if (!prof.turmaId) {
      return students;
    }
    return students.filter(s => s.turmaId === prof.turmaId);
  };

  return (
    <div className="flex-1 flex flex-col bg-art-bg relative overflow-hidden">
      {/* Header */}
      <header className="p-6 bg-art-navy text-white flex items-center justify-between shadow-lg z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setUser(null); navigate('/'); }} 
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-1 text-xs font-black uppercase tracking-wider"
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> Sair
          </button>
          <div className="flex items-center space-x-2">
            <Building size={22} className="text-art-yellow" />
            <h1 className="text-xl font-black tracking-tight">Painel do Gestor</h1>
          </div>
        </div>
        <span className="text-[10px] font-black bg-art-yellow/20 text-art-yellow-dark px-3 py-1 rounded-full border border-art-yellow/30 uppercase tracking-widest">
          Escola Aprender Mais
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl w-full mx-auto space-y-6">
        {/* Success and Error Alerts */}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-art-lime/10 text-art-lime-dark border border-art-lime/30 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center"
          >
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-art-peach/10 text-art-peach-dark border border-art-peach/30 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Section Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-art-navy uppercase">Professores Cadastrados</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Gerencie a equipe docente e suas turmas</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 py-3 px-5 bg-art-teal border-b-4 border-art-sage-dark text-art-navy font-black rounded-full uppercase tracking-wider text-[11px] shadow-sm art-btn-press"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Fechar' : 'Novo Professor'}
          </button>
        </div>

        {/* Add Professor Form */}
        {showAddForm && (
          <motion.form 
            onSubmit={handleCreateProfessor}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-art-border shadow-sm space-y-4"
          >
            <h3 className="font-black text-art-navy text-sm uppercase tracking-wider">Adicionar Novo Professor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Prof. Roberto Carlos"
                  className="bg-slate-50 border-2 border-slate-100 hover:border-art-teal focus:border-art-teal rounded-2xl px-4 py-3 font-bold text-art-navy text-sm outline-none transition-all"
                />
              </div>

              {/* PIN */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN de Acesso (4 dígitos)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 5566"
                  className="bg-slate-50 border-2 border-slate-100 hover:border-art-teal focus:border-art-teal rounded-2xl px-4 py-3 font-bold text-art-navy text-sm outline-none transition-all text-center tracking-widest"
                />
              </div>

              {/* Turma Assignment */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma Vinculada</label>
                <select 
                  value={turmaId}
                  onChange={e => setTurmaId(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-100 hover:border-art-teal focus:border-art-teal rounded-2xl px-4 py-3 font-bold text-art-navy text-sm outline-none transition-all"
                >
                  <option value="all">Todas as Turmas (Gestor/Geral)</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-5 bg-slate-100 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-wider hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="py-2.5 px-6 bg-art-teal border-b-4 border-art-sage-dark text-art-navy font-black rounded-full uppercase tracking-wider text-[10px] shadow-sm art-btn-press"
              >
                Salvar Cadastro
              </button>
            </div>
          </motion.form>
        )}

        {/* Professors list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {professors.map(prof => {
            const profDisciplines = getDisciplines(prof);
            const profStudents = getStudentsForProf(prof);
            const assignedTurmaName = prof.turmaId 
              ? turmas.find(t => t.id === prof.turmaId)?.name || 'Sem turma'
              : 'Todas as Turmas';

            return (
              <motion.div 
                key={prof.uid}
                layout
                className="bg-white rounded-[32px] border border-art-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
              >
                <div>
                  {/* Top Bar info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl p-1 overflow-hidden">
                        <img src={prof.avatar} alt={prof.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-black text-art-navy text-base">{prof.name}</h3>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="bg-art-yellow/20 text-art-yellow-dark px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-art-yellow/30">
                            PIN: {prof.pin}
                          </span>
                          <span className="bg-art-teal/20 text-art-navy px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-art-teal/30">
                            {assignedTurmaName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProfessor(prof.uid, prof.name)}
                      className="p-2 text-slate-300 hover:text-art-coral hover:bg-slate-50 rounded-xl transition"
                      title="Excluir Professor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Body disciplines & classes */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    {/* Disciplines list */}
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disciplinas Associadas</span>
                      {profDisciplines.length === 0 ? (
                        <p className="text-xs text-slate-300 italic mt-1 font-bold">Nenhuma disciplina cadastrada</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {profDisciplines.map(disc => (
                            <span key={disc} className="bg-slate-50 text-slate-500 border border-slate-200/60 px-2.5 py-1 rounded-full text-[10px] font-bold">
                              {disc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Students list info */}
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos sob Supervisão</span>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-art-navy">
                          {profStudents.length} {profStudents.length === 1 ? 'aluno' : 'alunos'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {professors.length === 0 && (
            <div className="col-span-2 bg-white rounded-[32px] border border-art-border p-12 text-center text-slate-400 font-bold italic">
              Nenhum professor cadastrado. Clique em "Novo Professor" acima para começar!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
