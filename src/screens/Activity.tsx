import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Activity() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user, turmas, addCoins, coins, completeActivity } = useAppStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState<null | 'correct' | 'wrong'>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const userTurma = turmas.find(t => t.id === user?.turmaId) || turmas[0];
  
  // Memoize the session activities so the list doesn't change when we mark them as complete
  const categoryActivities = useMemo(() => {
    const raw = userTurma?.activities[category as string] || [];
    return raw.filter(a => a.date === today && !user?.completedActivities?.includes(a.id));
  }, [category, userTurma, today]); // Note: We only want this to run when the category or turma data changes, NOT when user.completedActivities changes during the session if we want to keep index stability. Or better, just when the component mounts.

  const current = categoryActivities[currentIndex];

  if (!current && categoryActivities.length > 0) {
     navigate('/learn');
     return null;
  }

  if (categoryActivities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-art-bg">
        <h2 className="text-2xl font-black text-art-navy mb-4">Tudo pronto!</h2>
        <p className="text-slate-500 mb-8">Você já completou todas as atividades de hoje.</p>
        <button onClick={() => navigate('/learn')} className="px-8 py-4 bg-art-teal rounded-[24px] font-black text-art-navy shadow-lg">Voltar</button>
      </div>
    );
  }

  const handleAnswer = (option: string) => {
    if (showFeedback) return;
    
    if (option === current.correct) {
      setShowFeedback('correct');
      addCoins(5);
      
      setTimeout(() => {
        // Complete activity and move on after the feedback delay
        completeActivity(current.id);
        
        if (currentIndex < categoryActivities.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setShowFeedback(null);
        } else {
          navigate('/learn');
        }
      }, 2000);
    } else {
      setShowFeedback('wrong');
      setTimeout(() => setShowFeedback(null), 1000);
    }
  };

  if (!current) return <div>Atividade não encontrada</div>;

  return (
    <div className="flex-1 flex flex-col bg-art-bg overflow-hidden">
      <header className="p-6 bg-white flex items-center justify-between shadow-sm">
        <button onClick={() => navigate('/learn')} className="p-3 bg-slate-50 rounded-2xl art-btn-press border-b-2 border-slate-200">
          <ArrowLeft size={24} />
        </button>
        <div className="flex bg-art-yellow px-4 py-2 rounded-full font-black text-art-purple-dark shadow-inner text-sm items-center">
          <Star size={16} className="mr-2 fill-current" />
          {coins}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-8 items-center justify-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-3xl font-black text-center mb-12 text-art-navy leading-tight tracking-tight">
              {current.question}
            </h2>

            {current.type === 'count' && (
              <div className="flex gap-4 mb-12">
                {[...Array(current.stars)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                  >
                    <Star size={64} className="text-art-yellow fill-art-yellow drop-shadow-md" />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 w-full gap-6">
              {current.options.map((opt, i) => {
                const colors = [
                  'bg-art-lime border-art-lime-border text-art-lime-dark',
                  'bg-art-sage border-art-sage-border text-art-sage-dark',
                  'bg-art-peach border-art-peach-border text-art-peach-dark',
                   'bg-art-rose border-art-rose-border text-art-rose-dark',
                ];
                const baseColor = colors[i % colors.length];
                
                return (
                  <button
                    key={i}
                    disabled={!!showFeedback}
                    onClick={() => handleAnswer(opt)}
                    className={`py-8 px-6 rounded-[32px] text-3xl font-black shadow-lg shadow-black/5 border-b-8 art-btn-press transition-all
                      ${showFeedback === 'correct' && opt === current.correct ? 'bg-art-teal border-art-sage-dark text-art-navy' : baseColor}
                      ${showFeedback === 'wrong' && opt !== current.correct ? 'bg-art-peach-dark border-art-peach-dark text-white' : ''}
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20"
          >
            <motion.div 
               initial={{ scale: 0, rotate: -45 }}
               animate={{ scale: 1.2, rotate: 0 }}
               className="w-48 h-48 bg-art-teal rounded-[48px] flex items-center justify-center shadow-2xl mb-8 border-b-8 border-art-sage-border"
            >
              <Star size={100} className="text-white fill-current animate-pulse" />
            </motion.div>
            <h3 className="text-4xl font-black text-art-navy tracking-tight">MUITO BEM!</h3>
            <p className="text-2xl font-black text-art-coral">+5 moedas</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
