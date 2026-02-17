'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AISparkleIcon, DiagramIcon, LearningPathIcon } from '@/components/icons/CustomIcons'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen flex flex-col items-center p-6 md:p-12 overflow-hidden selection:bg-primary/30 text-foreground">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen" />

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] scanline" />

      {/* Hero Section */}
      <motion.div
        className="z-10 w-full max-w-[1400px] mx-auto flex flex-col items-center text-center mt-12 md:mt-20 mb-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md mb-8"
          variants={itemVariants}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_theme('colors.primary.DEFAULT')]"></span>
          </span>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">System Online v2.6 // Ready</span>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 relative z-10"
          variants={itemVariants}
        >
          <span className="neon-text text-white mix-blend-overlay">CODE</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-pulse-slow">COMPASS</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-light tracking-wide"
          variants={itemVariants}
        >
          <span className="text-primary font-mono">&lt;Nav&gt;</span> unknown codebases with <span className="text-white font-medium">holographic clarity</span>. 
          Instant analysis, interactive maps, and personalized paths.
          <span className="text-primary font-mono"> &lt;/Nav&gt;</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          variants={itemVariants}
        >
          <a
            href="/setup"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-none px-10 font-medium text-black transition-all duration-300 bg-primary hover:bg-primary/90 clip-path-polygon"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <span className="relative flex items-center gap-2 font-bold tracking-wider uppercase">
              Initialize
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
          
          <button
            className="px-10 h-14 rounded-none border border-white/20 text-white font-medium transition-all duration-300 hover:bg-white/5 hover:border-primary/50 tracking-wider uppercase"
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
          >
            System Data
          </button>
        </motion.div>
      </motion.div>

      {/* Cyber Bento Grid */}
      <motion.div
        className="z-10 w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(320px,auto)]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Card 1: AI Chat (Large) */}
        <motion.div
          className="md:col-span-8 group relative rounded-xl overflow-hidden glass-panel p-8 flex flex-col justify-between"
          variants={itemVariants}
        >
          <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground/50">ID: AI_CORE_01</div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
          
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />

          <div className="relative z-10 mt-4">
             <h3 className="mb-2 flex items-center gap-2">
               <AISparkleIcon className="text-primary w-5 h-5 animate-spin-slow" />
               Neural Interface
             </h3>
             <h4 className="text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-tight">Contextual Intelligence</h4>
             <p className="text-muted-foreground max-w-md font-mono text-sm">
               &gt; Analyzing repository structure...<br/>
               &gt; 98.4% accuracy in context retrieval.<br/>
               &gt; Ready for queries.
             </p>
          </div>
          
          {/* Mock Terminal UI */}
          <div className="relative mt-auto pt-8">
             <div className="w-full bg-black/60 border border-white/5 p-4 font-mono text-sm leading-relaxed rounded-sm">
                <div className="text-gray-500 mb-2">$ query --target=auth_flow</div>
                <div className="text-primary typing-effect">The `UserProvider` in `layout.tsx` handles session persistence via secure cookies...<span className="animate-pulse">_</span></div>
             </div>
          </div>
        </motion.div>

        {/* Card 2: Diagrams (Tall) */}
        <motion.div
          className="md:col-span-4 group relative rounded-xl overflow-hidden glass-panel p-8"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-cyber-grid opacity-10" />
          <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground/50">ID: MAP_SYS_02</div>
          
          <div className="relative z-20 h-full flex flex-col">
            <h3 className="mb-2 flex items-center gap-2">
               <DiagramIcon className="text-secondary w-5 h-5" />
               Topography
            </h3>
            <h4 className="text-2xl font-bold mb-2 text-white uppercase tracking-tight">Live Dependencies</h4>
            
            {/* Holographic Visual */}
            <div className="flex-1 relative mt-8 flex items-center justify-center perspective-1000">
               <motion.div 
                 className="w-24 h-24 border border-secondary/50 rounded-lg flex items-center justify-center relative shadow-[0_0_20px_rgba(188,19,254,0.2)]"
                 animate={{ rotateX: [0, 10, 0], rotateY: [0, 10, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               >
                  <div className="absolute inset-0 border border-secondary/20 rounded-lg scale-110" />
                  <div className="w-12 h-12 bg-secondary/20 blur-md rounded-full" />
               </motion.div>

               {/* Connecting Lines */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                 <circle cx="20%" cy="20%" r="2" fill="currentColor" className="text-secondary" />
                 <circle cx="80%" cy="80%" r="2" fill="currentColor" className="text-secondary" />
               </svg>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Learning Paths (Wide) */}
        <motion.div
          className="md:col-span-12 group relative rounded-xl overflow-hidden glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center gap-12"
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-accent/10 to-transparent opacity-50" />
          <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground/50">ID: PROTOCOL_03</div>
          
          <div className="flex-1 relative z-10">
            <h3 className="mb-2 flex items-center gap-2">
               <LearningPathIcon className="text-accent w-5 h-5" />
               Upload Protocols
            </h3>
            <h4 className="text-3xl font-bold mb-4 text-white uppercase tracking-tight">Adaptive Curriculum</h4>
            <div className="flex flex-wrap gap-2 mt-4">
               {['Frontend_Module', 'Backend_Core', 'DevOps_Pipe'].map((tag) => (
                 <span key={tag} className="px-3 py-1 text-xs font-mono border border-white/10 bg-white/5 text-gray-300 uppercase tracking-wider hover:bg-accent/20 hover:border-accent/50 transition-colors cursor-default">
                   [{tag}]
                 </span>
               ))}
            </div>
          </div>
          
          {/* Data Viz */}
          <div className="flex-1 w-full max-w-lg bg-black/40 p-1 border-l border-white/10">
             {[
               { label: 'Assimilation Rate', val: 92, color: 'bg-primary' },
               { label: 'Knowledge Base', val: 64, color: 'bg-secondary' },
               { label: 'System Errors', val: 12, color: 'bg-accent' }
             ].map((stat, i) => (
               <div key={stat.label} className="flex items-center gap-4 mb-2 p-2 hover:bg-white/5 transition-colors">
                  <div className="w-32 text-xs font-mono text-gray-400 uppercase">{stat.label}</div>
                  <div className="flex-1 h-1 bg-white/10 overflow-hidden relative">
                    <motion.div 
                      className={`h-full ${stat.color} shadow-[0_0_10px_currentColor]`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.val}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    />
                  </div>
                  <div className="w-8 text-xs font-mono text-right text-white">{stat.val}%</div>
               </div>
             ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Footer / Status */}
      <motion.footer
        className="mt-24 mb-12 w-full max-w-[1400px] border-t border-white/5 pt-8 flex justify-between items-center text-xs font-mono text-muted-foreground uppercase tracking-widest"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div>
           System Status: <span className="text-green-500">OPERATIONAL</span>
        </div>
        <div className="flex gap-8">
           <span className="hover:text-primary cursor-pointer transition-colors">Privacy_Protocol</span>
           <span className="hover:text-primary cursor-pointer transition-colors">Terms_Config</span>
        </div>
      </motion.footer>

    </main>
  )
}
