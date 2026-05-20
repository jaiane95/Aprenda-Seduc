import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ShoppingBag, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const SHOP_ITEMS = [
  { id: 'hat-1', name: 'Cartola', cost: 10, image: '🎩', type: 'acc' },
  { id: 'cap-1', name: 'Boné Azul', cost: 10, image: '🧢', type: 'acc' },
  { id: 'glasses-1', name: 'Óculos', cost: 20, image: '🕶️', type: 'acc' },
  { id: 'pet-1', name: 'Gatinho', cost: 25, image: '🐱', type: 'pet' },
  { id: 'pet-2', name: 'Cachorrinho', cost: 25, image: '🐶', type: 'pet' },
  { id: 'ball-1', name: 'Bola de Fut', cost: 15, image: '⚽', type: 'decor' },
  { id: 'skate-1', name: 'Skate', cost: 20, image: '🛹', type: 'decor' },
  { id: 'tree-1', name: 'Árvore Mágica', cost: 15, image: '🌳', type: 'decor' },
];

const AVATAR_SEEDS = ['Leo', 'Felix', 'Ben', 'Oliver', 'Max', 'Sam', 'Tico', 'Mila', 'Lulu', 'Bia'];

export default function AvatarScreen() {
  const navigate = useNavigate();
  const { user, coins, unlockItem, setAvatar, setAvatarName } = useAppStore();
  const unlockedItems = user?.unlockedItems || [];

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (coins >= item.cost && !unlockedItems.includes(item.id)) {
      unlockItem(item.id, item.cost);
    }
  };

  const handleSaveBonecoName = () => {
    if (tempName.trim()) {
      setAvatarName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const getAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

  return (
    <div className="flex-1 flex flex-col bg-art-bg">
      <header className="p-6 bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/home')} className="p-3 bg-slate-50 rounded-2xl art-btn-press border-b-2 border-slate-200">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-art-navy tracking-tight">Meu Boneco</h1>
        </div>
        <div className="flex bg-art-yellow/20 px-4 py-2 rounded-full font-black text-art-purple-dark text-sm items-center border-2 border-art-yellow">
          <Star size={16} className="mr-2 fill-art-yellow text-art-yellow-dark" />
          {coins}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Character Preview */}
        <div className="p-10 flex flex-col items-center justify-center bg-white border-b border-art-border relative overflow-hidden">
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
               className="w-56 h-56 rounded-[64px] bg-art-teal flex items-center justify-center shadow-xl shadow-art-teal/20 mb-6 relative border-4 border-white"
            >
               <img src={user?.avatar} alt="Boneco" className="w-full h-full p-4" />
               
               {/* Accessory overlays based on unlocked items */}
               {unlockedItems.includes('hat-1') && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 -right-2 text-6xl drop-shadow-md">🎩</motion.div>
               )}
               {unlockedItems.includes('cap-1') && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 -left-2 text-6xl drop-shadow-md -rotate-12">🧢</motion.div>
               )}
               {unlockedItems.includes('pet-1') && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-4 -left-4 text-6xl drop-shadow-md">🐱</motion.div>
               )}
               {unlockedItems.includes('pet-2') && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-4 -right-4 text-6xl drop-shadow-md">🐶</motion.div>
               )}
               {unlockedItems.includes('glasses-1') && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl ml-1 mt-1">🕶️</motion.div>
               )}
               {unlockedItems.includes('ball-1') && (
                 <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl">⚽</motion.div>
               )}
               {unlockedItems.includes('skate-1') && (
                 <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute -bottom-10 left-0 text-5xl">🛹</motion.div>
               )}
            </motion.div>
            <h2 className="text-3xl font-black text-art-navy tracking-tight">{user?.name}</h2>
            
            {/* Custom Boneco Name */}
            <div className="mt-3 flex flex-col items-center bg-slate-50 border border-slate-100 rounded-[20px] px-4 py-2 shadow-inner">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Nome do meu Boneco 🧸</span>
              <div className="flex items-center space-x-2 mt-1">
                {isEditingName ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={15}
                      className="border-2 border-art-coral bg-white rounded-lg px-2 py-0.5 text-xs font-black text-art-navy focus:outline-none w-28 text-center"
                      placeholder="Ex: Tico"
                      autoFocus
                    />
                    <button onClick={handleSaveBonecoName} className="p-1.5 bg-art-teal border border-art-sage-border text-art-navy rounded-lg font-black text-xs art-btn-press shrink-0">
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-extrabold text-art-purple-dark bg-white px-2.5 py-0.5 rounded-full border border-slate-100 shadow-sm">
                      {user?.avatarName || 'Sem Nome'}
                    </span>
                    <button 
                      onClick={() => { setTempName(user?.avatarName || ''); setIsEditingName(true); }} 
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-400 hover:text-art-navy transition art-btn-press" 
                      title="Editar nome"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">Nível 2 • Pequeno Aventureiro</p>
        </div>

        {/* Change Avatar Pick */}
        <div className="p-8 bg-slate-50/50">
          <h3 className="text-xl font-black text-art-purple-dark tracking-tight mb-6">Escolha seu Boneco</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
            {AVATAR_SEEDS.map((seed) => {
              const url = getAvatarUrl(seed);
              const isSelected = user?.avatar === url;
              return (
                <button
                  key={seed}
                  onClick={() => setAvatar(url)}
                  className={`flex-shrink-0 w-24 h-24 rounded-3xl border-4 transition-all art-btn-press ${isSelected ? 'border-art-teal bg-white scale-110 shadow-md' : 'border-transparent bg-slate-200'}`}
                >
                  <img src={url} alt={seed} className="w-full h-full p-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-art-yellow/20 p-2 rounded-xl">
              <ShoppingBag size={24} className="text-art-yellow" />
            </div>
            <h3 className="text-xl font-black text-art-purple-dark tracking-tight">Loja de Itens</h3>
          </div>

          <div className="grid grid-cols-2 gap-6 pb-12">
            {SHOP_ITEMS.map((item, index) => {
              const isOwned = unlockedItems.includes(item.id);
              const canAfford = coins >= item.cost;
              const cardColors = [
                'bg-art-rose border-art-rose-border text-art-rose-dark',
                'bg-art-sage border-art-sage-border text-art-sage-dark',
                'bg-art-lime border-art-lime-border text-art-lime-dark',
                'bg-art-peach border-art-peach-border text-art-peach-dark',
              ];
              const color = cardColors[index % cardColors.length];

              return (
                <button
                  key={item.id}
                  disabled={isOwned || !canAfford}
                  onClick={() => handleBuy(item)}
                  className={`p-6 rounded-[32px] border-b-8 flex flex-col items-center art-btn-press shadow-lg shadow-black/5 transition-all
                    ${isOwned ? 'bg-slate-100 border-slate-200 opacity-60' : `${color}`}
                    ${!isOwned && !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-6xl mb-4 drop-shadow-sm">{item.image}</div>
                  <span className="font-black text-sm opacity-80 mb-4">{item.name}</span>
                  
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                    ${isOwned ? 'bg-art-teal text-art-navy' : 'bg-white/80 text-art-navy'}
                  `}>
                    {isOwned ? (
                      <span className="flex items-center"><Check size={12} className="mr-1" /> OK</span>
                    ) : (
                      <span>{item.cost} moedas</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
