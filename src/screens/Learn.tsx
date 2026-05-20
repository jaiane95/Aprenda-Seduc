import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Book, Calculator, Volume2, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Learn() {
  const navigate = useNavigate();
  const { user, turmas } = useAppStore();

  const userTurma = turmas.find(t => t.id === user?.turmaId) || turmas[0];
  const subjects = Object.keys(userTurma?.activities || {});
  const today = new Date().toISOString().split('T')[0];

  const getUnansweredCount = (subject: string) => {
    const acts = userTurma.activities[subject] || [];
    const todayActs = acts.filter(a => a.date === today);
    const unanswered = todayActs.filter(a => !user?.completedActivities?.includes(a.id));
    return unanswered.length;
  };

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('port')) return Book;
    if (title.toLowerCase().includes('mat')) return Calculator;
    if (title.toLowerCase().includes('cienc')) return Volume2;
    return Sparkles;
  };

  const colors = [
    { color: 'bg-art-lime', border: 'border-art-lime-border', iconColor: 'text-art-lime-dark' },
    { color: 'bg-art-sage', border: 'border-art-sage-border', iconColor: 'text-art-sage-dark' },
    { color: 'bg-art-peach', border: 'border-art-peach-border', iconColor: 'text-art-peach-dark' },
    { color: 'bg-art-rose', border: 'border-art-rose-border', iconColor: 'text-art-rose-dark' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-art-bg">
      <header className="p-6 bg-white flex items-center shadow-sm">
        <button onClick={() => navigate('/home')} className="p-3 bg-slate-50 rounded-2xl art-btn-press border-b-2 border-slate-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-art-navy flex-1 text-center pr-12 tracking-tight">O que vamos aprender?</h1>
      </header>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto pb-20">
        {subjects.map((title, index) => {
          const Icon = getIcon(title);
          const style = colors[index % colors.length];
          const count = getUnansweredCount(title);
          const isDisabled = count === 0;

          return (
            <motion.button
              key={title}
              disabled={isDisabled}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/learn/${title}`)}
              className={`${style.color} ${style.border} w-full p-8 rounded-[48px] flex flex-col items-center text-center shadow-lg shadow-black/5 border-b-8 art-btn-press relative ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed border-b-4' : ''}`}
            >
              <div className={`p-5 rounded-[32px] bg-white ${style.iconColor} mb-4 shadow-sm`}>
                <Icon size={48} strokeWidth={2.5} />
              </div>
              <h2 className={`text-3xl font-black ${style.iconColor}`}>{title}</h2>
              <p className="text-slate-600 font-bold opacity-60 text-sm mt-1">
                {isDisabled ? 'Tudo pronto por hoje!' : `${count} lições para agora`}
              </p>
              
              {count > 0 && (
                <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-art-navy shadow-sm animate-bounce text-xl border-4 border-art-bg">
                  {count}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
