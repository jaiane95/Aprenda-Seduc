import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { Calendar, BookOpen, HeartHandshake, User as UserIcon, LogOut } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, setUser, turmas, coins, setMood } = useAppStore();

  const userTurma = turmas.find(t => t.id === user?.turmaId);

  const moods = [
    { emoji: '😀', label: 'Feliz' },
    { emoji: '🤩', label: 'Empolgado' },
    { emoji: '😐', label: 'Calmo' },
    { emoji: '😔', label: 'Cansado' },
    { emoji: '😟', label: 'Ansioso' },
  ];

  const cards = [
    { id: 'routine', title: 'Minha Rotina', subtitle: 'Veja o que fazer hoje', icon: Calendar, color: 'bg-art-lime', border: 'border-art-lime-border', iconColor: 'text-art-lime-dark', path: '/routine' },
    { id: 'learn', title: 'Aprender', subtitle: 'Brincadeiras e Lições', icon: BookOpen, color: 'bg-art-sage', border: 'border-art-sage-border', iconColor: 'text-art-sage-dark', path: '/learn' },
    { id: 'help', title: 'Preciso de Ajuda', subtitle: 'Falar com alguém', icon: HeartHandshake, color: 'bg-art-peach', border: 'border-art-peach-border', iconColor: 'text-art-peach-dark', path: '/help' },
    { id: 'avatar', title: 'Meu Boneco', subtitle: 'Ganhe prêmios', icon: UserIcon, color: 'bg-art-rose', border: 'border-art-rose-border', iconColor: 'text-art-rose-dark', path: '/avatar' },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-art-coral rounded-full flex items-center justify-center shadow-sm">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-art-purple-dark leading-none">
              APRENDA<span className="text-art-coral">+</span>
            </h1>
            {userTurma && (
              <span className="text-[10px] font-black text-art-teal uppercase tracking-widest mt-1 block">
                {userTurma.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-art-border">
          <div className="w-10 h-10 bg-art-teal rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
            <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">OLÁ!</span>
            <span className="text-sm font-bold text-art-navy leading-none">{user?.name}</span>
          </div>
          <button
            onClick={() => { setUser(null); navigate('/'); }}
            className="ml-2 text-slate-300 hover:text-art-peach-dark transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mood Selector card */}
      <div className="mb-10 bg-white p-8 rounded-[48px] border-2 border-art-coral shadow-lg">
        <h3 className="text-xl font-black text-art-navy mb-6 text-center uppercase tracking-widest text-xs">Como você está se sentindo agora?</h3>
        <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setMood(m.label)}
              className={`flex flex-col items-center p-3 rounded-3xl min-w-[70px] transition-all art-btn-press ${user?.mood === m.label ? 'bg-art-coral text-white scale-110 shadow-md' : 'bg-slate-50 text-slate-400'}`}
            >
              <span className="text-3xl mb-1">{m.emoji}</span>
              <span className="text-[8px] font-black uppercase tracking-tighter">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            aria-label={`Abrir ${card.title}: ${card.subtitle}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            onClick={() => navigate(card.path)}
            className={`${card.color} ${card.border} rounded-[48px] p-8 flex items-center gap-6 shadow-lg shadow-black/5 border-b-8 art-btn-press`}
          >
            <div className="w-20 h-20 bg-white/50 rounded-[32px] flex items-center justify-center shrink-0">
              <card.icon size={40} strokeWidth={2.5} className={card.iconColor} />
            </div>
            <div className="text-left">
              <h2 className={`text-2xl font-black ${card.iconColor}`}>{card.title}</h2>
              <p className={`text-sm font-medium ${card.iconColor} opacity-70`}>{card.subtitle}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer Status */}
      <footer className="mt-auto pt-8 flex justify-center">
        <div className="bg-white px-8 py-3 rounded-full flex gap-6 items-center border border-art-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-art-yellow rounded-full shadow-inner animate-pulse"></div>
            <span className="font-bold text-art-purple-dark text-sm">{coins} Moedas</span>
          </div>
          <div className="w-px h-5 bg-slate-100"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase">Hoje</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
