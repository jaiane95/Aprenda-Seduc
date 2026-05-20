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
      // Show success toast instead of browser blocking alert
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
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

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 bg-art-teal border-2 border-art-sage-dark p-4 rounded-[24px] shadow-xl flex items-center space-x-3 z-30"
          >
            <div className="bg-white rounded-full p-1.5 text-art-navy shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="font-black text-sm text-art-navy uppercase">Professor Avisado!</p>
              <p className="text-xs text-art-navy font-bold opacity-85">O professor já recebeu o alerta. Fique tranquilo!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
