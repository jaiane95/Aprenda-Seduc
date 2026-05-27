import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Megaphone, Volume2, Info, Moon, Music, Frown, CheckCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from '../store/useAppStore';

export default function Help() {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const [showToast, setShowToast] = useState(false);
  const [activeButton, setActiveButton] = useState<typeof helpButtons[0] | null>(null);

  const helpButtons = [
    { id: 'help', text: 'Preciso de ajuda', voice: 'Preciso de ajuda, por favor.', icon: Info, color: 'bg-art-lime', border: 'border-art-lime-border', iconColor: 'text-art-lime-dark' },
    { id: 'noise', text: 'Muito barulho', voice: 'Está com muito barulho aqui.', icon: Megaphone, color: 'bg-art-peach', border: 'border-art-peach-border', iconColor: 'text-art-peach-dark' },
    { id: 'break', text: 'Quero pausa', voice: 'Eu quero uma pausa, por favor.', icon: Moon, color: 'bg-art-sage', border: 'border-art-sage-border', iconColor: 'text-art-sage-dark' },
    { id: 'sad', text: 'Estou triste', voice: 'Eu estou me sentindo um pouco triste.', icon: Frown, color: 'bg-art-rose', border: 'border-art-rose-border', iconColor: 'text-art-rose-dark' },
  ];

  const handleHelp = async (item: typeof helpButtons[0]) => {
    // 1. Speak
    const utterance = new SpeechSynthesisUtterance(item.voice);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);

    // 2. Save alert in Firestore
    const fieldPath = 'alerts';
    try {
      await addDoc(collection(db, fieldPath), {
        userId: user?.uid,
        userName: user?.name,
        type: item.text,
        timestamp: serverTimestamp(),
      });
      // Show success toast
      setActiveButton(item);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setActiveButton(null);
      }, 4000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, fieldPath);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-art-bg relative">
      <header className="p-6 bg-white flex items-center shadow-sm">
        <button onClick={() => navigate('/home')} className="p-3 bg-slate-50 rounded-2xl art-btn-press border-b-2 border-slate-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-art-navy flex-1 text-center pr-12 tracking-tight">Botão Ajuda</h1>
      </header>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto pb-24">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-art-coral mb-4 text-center">
            <p className="text-xl font-black text-art-purple-dark">Aperte um botão para falar agora!</p>
        </div>

        {helpButtons.map((btn, index) => (
          <motion.button
            key={btn.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleHelp(btn)}
            className={`${btn.color} ${btn.border} p-8 rounded-[40px] flex items-center justify-between shadow-lg shadow-black/5 border-b-8 art-btn-press w-full`}
          >
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-2xl bg-white ${btn.iconColor} shadow-sm`}>
                <btn.icon size={42} strokeWidth={2.5} />
              </div>
              <span className={`text-2xl font-black shrink-0 ${btn.iconColor}`}>{btn.text}</span>
            </div>
            <Volume2 size={32} className={`${btn.iconColor} opacity-50`} />
          </motion.button>
        ))}
      </div>

      {/* Floating Toast Notification — fixed no centro da tela */}
      <AnimatePresence>
        {showToast && (
          <>
            {/* Overlay escurecido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowToast(false); setActiveButton(null); }}
              className="fixed inset-0 bg-black/40 z-40"
            />
            {/* Card de confirmação centralizado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-sm bg-white rounded-[40px] shadow-2xl flex flex-col items-center text-center p-10 z-50 border-b-8 border-art-sage-dark"
            >
              {/* Ícone animado */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 250 }}
                className={`w-24 h-24 ${activeButton?.color || 'bg-art-teal'} rounded-[32px] flex items-center justify-center shadow-lg mb-6 border-b-4 ${activeButton?.border || 'border-art-sage-border'}`}
              >
                <CheckCircle size={52} className="text-white" />
              </motion.div>

              <p className="text-3xl font-black text-art-navy tracking-tight leading-tight mb-2">
                Professor Avisado!
              </p>
              <p className="text-base font-bold text-slate-400 mb-2">
                Sua mensagem foi enviada:
              </p>
              <span className={`text-lg font-black px-5 py-2 rounded-2xl ${activeButton?.color || 'bg-art-teal'} ${activeButton?.iconColor || 'text-art-navy'} mb-8`}>
                {activeButton?.text || 'Pedido de ajuda'}
              </span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Fique tranquilo, ele já sabe! 💚
              </p>

              {/* Barra de progresso */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-2 bg-art-teal rounded-b-[40px]"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
