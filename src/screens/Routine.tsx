import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function Routine() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = [
    { color: 'bg-art-rose', border: 'border-art-rose-border', dark: 'text-art-rose-dark' },
    { color: 'bg-art-sage', border: 'border-art-sage-border', dark: 'text-art-sage-dark' },
    { color: 'bg-art-lime', border: 'border-art-lime-border', dark: 'text-art-lime-dark' },
    { color: 'bg-art-peach', border: 'border-art-peach-border', dark: 'text-art-peach-dark' },
  ];

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/routines`;
    
    async function fetchRoutines() {
      try {
        const querySnap = await getDocs(collection(db, path));
        const fetched = querySnap.docs.map((doc, index) => {
          const data = doc.data();
          const colorStyle = colors[index % colors.length];
          return {
            id: doc.id,
            time: data.time || '12:00',
            activity: data.activity || '',
            completed: !!data.completed,
            ...colorStyle
          };
        });
        
        // Sort routines chronologically
        fetched.sort((a, b) => a.time.localeCompare(b.time));
        setItems(fetched);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
    
    fetchRoutines();
  }, [user]);

  const toggleItem = async (id: string) => {
    if (!user) return;
    const itemToToggle = items.find(item => item.id === id);
    if (!itemToToggle) return;
    
    const newCompleted = !itemToToggle.completed;
    
    // Optimistic local state update
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: newCompleted } : item
    ));
    
    const docPath = `users/${user.uid}/routines/${id}`;
    try {
      await updateDoc(doc(db, `users/${user.uid}/routines`, id), {
        completed: newCompleted
      });
    } catch (error) {
      // Revert optimistic update on failure
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, completed: !newCompleted } : item
      ));
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-art-bg">
       <header className="p-6 bg-white flex items-center shadow-sm">
        <button onClick={() => navigate('/home')} className="p-3 bg-slate-50 rounded-2xl art-btn-press border-b-2 border-slate-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-art-navy flex-1 text-center pr-12 tracking-tight">Minha Rotina</h1>
      </header>

      <div className="flex-1 p-8 space-y-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-[32px] mb-6 border-l-8 border-art-coral shadow-sm">
          <p className="text-art-purple-dark italic font-bold">"Seguir a rotina nos ajuda a saber o que vem depois!"</p>
        </div>

        {items.map((item, index) => (
          <motion.div
            key={item.id}
            role="checkbox"
            aria-checked={item.completed}
            aria-label={`${item.activity} às ${item.time}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleItem(item.id)}
            className={`p-6 rounded-[32px] flex items-center justify-between cursor-pointer transition shadow-lg shadow-black/5 border-b-8 art-btn-press ${item.completed ? 'opacity-40 grayscale pointer-events-none' : 'bg-white border-slate-100'}`}
          >
            <div className="flex items-center space-x-5">
              <div className={`w-16 h-16 rounded-2xl ${item.color} ${item.border} flex flex-col items-center justify-center font-black ${item.dark} border-b-4 shadow-sm`}>
                <span className="text-[10px] leading-tight">HORA</span>
                <span className="text-sm">{item.time}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black text-art-purple-dark ${item.completed ? 'line-through' : ''}`}>{item.activity}</span>
              </div>
            </div>
            {item.completed ? (
              <CheckCircle2 size={36} className="text-art-teal" />
            ) : (
              <Circle size={36} className="text-slate-200" />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="p-8 bg-white border-t border-art-border">
         <button 
          onClick={() => navigate('/home')}
          className="w-full py-6 bg-art-teal border-art-sage-dark border-b-8 text-art-navy rounded-[32px] text-2xl font-black shadow-lg art-btn-press"
         >
           Tudo Pronto!
         </button>
      </div>
    </div>
  );
}
