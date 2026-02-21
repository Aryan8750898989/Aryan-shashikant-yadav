import React from 'react';
import { motion } from 'motion/react';

export const RobotAvatar: React.FC<{ isThinking?: boolean; isSpeaking?: boolean; isGreeting?: boolean }> = ({ isThinking, isSpeaking, isGreeting }) => {
  return (
    <div className="relative w-48 h-56 flex items-center justify-center">
      {/* Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: isThinking ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-violet-400/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          y: isThinking ? [-4, 4, -4] : [0, -12, 0],
          rotate: isSpeaking ? [-1, 1, -1] : (isGreeting ? [-3, 3, -3] : 0),
        }}
        transition={{ duration: isThinking ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Head Section */}
        <div className="relative mb-[-10px] z-20">
          {/* Ears/Side Sensors */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-10 bg-violet-400 rounded-full border-2 border-white shadow-lg z-0" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-10 bg-violet-400 rounded-full border-2 border-white shadow-lg z-0" />
          
          {/* Main Head Shell */}
          <div className="relative w-32 h-24 bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-xl overflow-hidden flex items-center justify-center z-10">
            {/* Metallic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
            
            {/* Face Screen */}
            <div className="w-28 h-20 bg-zinc-900 rounded-[2rem] flex flex-col items-center justify-center p-2 border-2 border-zinc-800 relative overflow-hidden">
              {/* Screen Corners (Glowing) */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-violet-400/60" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-violet-400/60" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-violet-400/60" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-violet-400/60" />

              {/* Eyes Container */}
              <div className="flex gap-6 mb-1">
                {/* Left Eye */}
                <div className="relative">
                  {isGreeting ? (
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      className="w-6 h-6"
                    >
                      <svg viewBox="0 0 24 24" className="w-full h-full stroke-violet-400 fill-none stroke-[3]">
                        <path d="M4 14c2-4 6-4 8 0" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        scaleY: isThinking ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1],
                        boxShadow: isThinking ? "0 0 15px #a78bfa" : "0 0 8px #a78bfa"
                      }}
                      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: isThinking ? 0.5 : 4 }}
                      className="w-5 h-5 bg-violet-400 rounded-full"
                    />
                  )}
                </div>
                {/* Right Eye */}
                <div className="relative">
                  {isGreeting ? (
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      className="w-6 h-6"
                    >
                      <svg viewBox="0 0 24 24" className="w-full h-full stroke-violet-400 fill-none stroke-[3]">
                        <path d="M4 14c2-4 6-4 8 0" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        scaleY: isThinking ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1],
                        boxShadow: isThinking ? "0 0 15px #a78bfa" : "0 0 8px #a78bfa"
                      }}
                      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: isThinking ? 0.5 : 4.2 }}
                      className="w-5 h-5 bg-violet-400 rounded-full"
                    />
                  )}
                </div>
              </div>

              {/* Mouth (Subtle) */}
              <motion.div
                animate={{
                  width: isSpeaking ? [12, 20, 12] : 12,
                  height: isSpeaking ? [4, 6, 4] : 2,
                  opacity: isSpeaking ? 1 : 0.3,
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="bg-violet-400/60 rounded-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="relative w-28 h-28 z-10">
          {/* Main Body Shell (Egg shape) */}
          <div className="absolute inset-0 bg-white rounded-t-[3rem] rounded-b-[4rem] border-2 border-zinc-100 shadow-xl overflow-hidden">
             {/* Blue Chest Piece */}
             <div className="absolute top-0 left-0 right-0 h-14 bg-violet-400 rounded-b-[2rem] border-b-2 border-white/20" />
             
             {/* Glowing Core */}
             <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center shadow-inner">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                    boxShadow: ["0 0 10px #a78bfa", "0 0 20px #a78bfa", "0 0 10px #a78bfa"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-7 h-7 rounded-full bg-violet-400"
                />
             </div>
          </div>

          {/* Arms */}
          {/* Left Arm */}
          <motion.div
            animate={{ 
              rotate: isGreeting ? [-10, -20, -10] : (isSpeaking ? [0, 10, 0] : 0),
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute -left-6 top-4 w-8 h-14 origin-top-right"
          >
             <div className="w-full h-full bg-violet-400 rounded-full border-2 border-white shadow-md relative">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white rounded-b-full" />
             </div>
          </motion.div>

          {/* Right Arm (Waving Arm) */}
          <motion.div
            animate={isGreeting ? { 
              rotate: [140, 180, 140],
              x: [5, 10, 5],
              y: [-10, -15, -10]
            } : { 
              rotate: isSpeaking ? [0, -10, 0] : 0,
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="absolute -right-6 top-4 w-8 h-14 origin-top-left"
          >
             <div className="w-full h-full bg-violet-400 rounded-full border-2 border-white shadow-md relative">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white rounded-b-full" />
             </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
