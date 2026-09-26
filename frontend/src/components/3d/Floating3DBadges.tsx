import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, ShieldCheck, Languages, Megaphone } from 'lucide-react';

export const Floating3DBadges: React.FC = () => {
  const badges = [
    {
      icon: Sparkles,
      label: '3D AI Assistant',
      desc: 'Speech-to-Campaign',
      gradient: 'from-sky-500 to-blue-600',
      delay: 0,
    },
    {
      icon: Tag,
      label: 'Offer Preservation',
      desc: '100% Numeric Accuracy',
      gradient: 'from-emerald-500 to-teal-600',
      delay: 0.2,
    },
    {
      icon: ShieldCheck,
      label: '8-Point QC Studio',
      desc: 'Synthetic Data Validation',
      gradient: 'from-cyan-500 to-sky-600',
      delay: 0.4,
    },
    {
      icon: Languages,
      label: 'Native Telugu & English',
      desc: 'Regional Dialect Support',
      gradient: 'from-teal-500 to-emerald-600',
      delay: 0.6,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4 my-12">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: badge.delay }}
            whileHover={{ y: -8, scale: 1.03 }}
            className="relative p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all group overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${badge.gradient} opacity-10 group-hover:opacity-25 blur-2xl transition-opacity`} />

            <div className="flex items-center space-x-3.5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.gradient} p-0.5 shadow-md group-hover:shadow-lg transition-transform group-hover:rotate-6`}>
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {badge.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {badge.desc}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
