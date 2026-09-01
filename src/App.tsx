import { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Download, Linkedin, Github, ExternalLink, Cpu, Zap, Instagram, Facebook, Menu, X, 
  Terminal, Code2, Sparkles, Bot, Globe, Database, Wrench, Layers, CheckCircle2, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import About from './About';
import Contact from './Contact';
import NetworkBackground from './NetworkBackground';
import { projectsData, profileData } from './data';
import { deriveTechnicalSkills } from './utils/skillEngine';

function Home() {
  // Motion variants for smooth orchestrated entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const coreDevStack = [
    { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'Vue 3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
    { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    { name: 'C++', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
    { name: 'AI / LLMs', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg' },
    { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  ];

  return (
    <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-8 lg:pt-14 pb-20 flex flex-col gap-12 w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
        {/* Left: Content with orchestrated staggered entry */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[56%] flex flex-col items-start text-left order-2 lg:order-1"
        >
          {/* Developer Code Terminal Pill Badge */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#00abf0]/25 text-xs font-mono mb-5 shadow-[0_0_15px_rgba(0,171,240,0.1)] backdrop-blur-sm"
          >
            <Terminal size={13} className="text-[#00abf0]" />
            <span className="text-gray-400">const</span>
            <span className="text-[#00abf0] font-semibold">engineer</span>
            <span className="text-gray-400">=</span>
            <span className="text-emerald-400 font-medium">"AI & Software Developer"</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </motion.div>

          {/* Category tags */}
          <motion.p 
            variants={itemVariants}
            className="text-[11px] md:text-xs font-bold tracking-[0.25em] uppercase mb-4 text-[#00abf0] font-mono flex items-center gap-2"
          >
            <Code2 size={13} className="text-[#00abf0]" />
            AI &nbsp;&middot;&nbsp; AI Agents &nbsp;&middot;&nbsp; Software &nbsp;&middot;&nbsp; Robotics
          </motion.p>

          {/* Main heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-[3.3rem] xl:text-[3.75rem] font-bold mb-6 tracking-tight leading-[1.15]"
          >
            <span className="text-white">Building intelligent systems,</span>
            <br />
            <span className="text-[#00abf0]">
              one project at a time.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-sm md:text-base leading-relaxed mb-8 max-w-lg text-gray-400"
          >
            I'm Rathishan Mahendran — a Computer Engineering student
            at the University of Ruhuna who builds real software: AI
            agents, full-stack products and autonomous hardware.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center flex-wrap gap-4 mb-8"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/projects"
                className="px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold bg-[#00abf0] text-[#081b29] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,171,240,0.6)] flex items-center gap-2 text-sm"
              >
                View my work <ExternalLink size={16} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/contact"
                className="border-2 border-white/30 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold transition-all duration-300 hover:border-[#00abf0] hover:text-[#00abf0] text-sm"
              >
                Let's connect
              </Link>
            </motion.div>

            <motion.a
              whileHover={{ scale: 1.04, x: 2 }}
              href="/Resume/Rathishan_Resume_Template.pdf"
              download="Rathishan_Resume_Template.pdf"
              className="text-gray-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5 text-sm"
            >
              Download CV
            </motion.a>
          </motion.div>

          {/* Social Icons */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center space-x-4"
          >
            {[
              { icon: <Github size={18} className="fill-current" />, href: 'https://github.com/skr2rathishan-oss' },
              { icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/in/rathishan-mahendran-39812b316' },
              { icon: <Facebook size={18} />, href: 'https://www.facebook.com/Rathishan21' },
              { icon: <Instagram size={18} />, href: 'https://www.instagram.com/rathishan21/' },
            ].map((social, i) => (
              <motion.a
                key={i}
                variants={socialVariants}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.92 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_18px_#00abf0] hover:bg-[#00abf0] hover:text-[#081b29]"
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Clean, High-Clarity Profile Image with Floating Programmer Badges */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full lg:w-[44%] flex justify-center relative order-1 lg:order-2 mt-4 lg:mt-0"
        >
          {/* Glowing background */}
          <div className="absolute inset-0 bg-[#00abf0] blur-[100px] rounded-full w-[250px] h-[250px] md:w-[360px] md:h-[360px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"></div>

          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex flex-col items-center justify-center">
             {/* Floating Dev Badge: Top Left */}
             <motion.div 
               initial={{ opacity: 0, y: -15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5, duration: 0.6 }}
               className="absolute -top-4 -left-6 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#081b29]/90 border border-[#00abf0]/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
             >
               <div className="w-6 h-6 rounded-lg bg-[#00abf0]/15 flex items-center justify-center text-[#00abf0]">
                 <Terminal size={14} />
               </div>
               <div className="text-left">
                 <p className="text-[10px] text-gray-400 font-mono">Specialization</p>
                 <p className="text-xs font-bold text-white font-mono">AI Agents & Web</p>
               </div>
             </motion.div>

             {/* Floating Dev Badge: Bottom Right */}
             <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.65, duration: 0.6 }}
               className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#081b29]/90 border border-emerald-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
             >
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
               <div className="text-left">
                 <p className="text-[10px] text-gray-400 font-mono">Status</p>
                 <p className="text-xs font-bold text-white font-mono">Open for Projects</p>
               </div>
             </motion.div>

             {/* Solid Blob */}
             <div
               className="absolute inset-0 bg-[#00abf0] shadow-[0_0_35px_rgba(0,171,240,0.5)]"
               style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
             />

             {/* Outline Blob */}
             <div
               className="absolute inset-[-15px] md:inset-[-20px] border-2 border-white opacity-50"
               style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'rotate(-15deg)' }}
             />

             {/* High-Clarity Scaled & Positioned Image */}
             <img
               src={profileData.homeImage}
               alt="Rathishan Mahendran"
               loading="eager"
               decoding="async"
               className="relative z-10 w-full h-full object-cover object-[center_18%] shadow-2xl transition-transform duration-500"
               style={{ 
                 borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
               }}
             />
          </div>
        </motion.div>
      </div>

      {/* Programmer Tech Stack Strip */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="w-full pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Sparkles size={14} className="text-[#00abf0]" />
          <span>Core Stack & Technologies:</span>
        </div>
        <div className="flex items-center flex-wrap justify-center gap-2">
          {coreDevStack.map((tech) => (
            <div 
              key={tech.name}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00abf0]/40 transition-colors text-xs font-medium text-gray-300"
            >
              <img src={tech.icon} alt={tech.name} className="w-3.5 h-3.5 object-contain" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

interface ToolDetail {
  name: string;
  icon: string;
  status: 'WORKING WITH' | 'HANDS-ON' | 'COMFORTABLE' | 'EXPLORING';
  tagline: string;
  howIUseIt: string[];
  flow: string[];
}

interface CategoryData {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  tools: ToolDetail[];
}

const toolkitCategories: CategoryData[] = [
  {
    id: 'software-dev',
    title: 'Software Development',
    subtitle: 'Core programming languages, algorithms, and modular architecture.',
    icon: Code2,
    tools: [
      {
        name: 'Python',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        status: 'WORKING WITH',
        tagline: 'Primary language for AI agents, algorithms, scripting, and backend microservices.',
        howIUseIt: ['Agent Architecture', 'Data Pipelines', 'Scripting & Automation', 'FastAPI Services'],
        flow: ['Problem', 'Data Structure', 'Algorithm', 'Unit Tests', 'Production']
      },
      {
        name: 'C++',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
        status: 'HANDS-ON',
        tagline: 'High-performance computing, robotics control systems, and embedded firmware.',
        howIUseIt: ['Low-level Drivers', 'Memory Optimization', 'Microcontroller Logic', 'Real-Time Control'],
        flow: ['Hardware Specs', 'C++ Core', 'Memory Profiling', 'Flashing', 'Execution']
      },
      {
        name: 'TypeScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        status: 'WORKING WITH',
        tagline: 'Strictly-typed scalable web applications, robust interfaces, and full-stack contracts.',
        howIUseIt: ['Type-safe Interfaces', 'Full-Stack SPAs', 'API Contracts', 'State Management'],
        flow: ['Schema', 'Types', 'Components', 'Build Verification', 'Deploy']
      },
      {
        name: 'JavaScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Dynamic client-side interactions, asynchronous flows, and DOM manipulation.',
        howIUseIt: ['Event Handling', 'Interactive UI Logic', 'REST Integrations', 'Async Workflows'],
        flow: ['Design', 'Logic', 'DOM Bind', 'Event Loop', 'Live User']
      },
      {
        name: 'OOP & Architecture',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Clean architecture, SOLID principles, and reusable design patterns.',
        howIUseIt: ['Factory & Singleton', 'Modular Codebase', 'Encapsulation', 'Refactoring'],
        flow: ['Requirements', 'System UML', 'Clean Code', 'Refactor', 'Maintain']
      }
    ]
  },
  {
    id: 'ai-ml',
    title: 'AI & ML',
    subtitle: 'Model training, evaluation, computer vision, and deployment.',
    icon: Cpu,
    tools: [
      {
        name: 'PyTorch',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
        status: 'WORKING WITH',
        tagline: 'Used to build, train, and fine-tune deep learning neural networks.',
        howIUseIt: ['Model training', 'Fine-tuning', 'Experiment loops', 'Loss Optimization'],
        flow: ['Data', 'Model', 'Evaluation', 'Inference', 'Application']
      },
      {
        name: 'TensorFlow',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
        status: 'HANDS-ON',
        tagline: 'End-to-end machine learning workflows, CNN architectures, and edge deployment.',
        howIUseIt: ['Keras Models', 'Transfer Learning', 'Classification', 'TF Lite Export'],
        flow: ['Preprocess', 'Architecture', 'Train', 'Validate', 'Export']
      },
      {
        name: 'scikit-learn',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Classical machine learning algorithms, regression, clustering, and feature preprocessing.',
        howIUseIt: ['Feature Scaling', 'Random Forests', 'SVM Classifiers', 'Cross-Validation'],
        flow: ['Raw Data', 'Feature Eng', 'Model Fit', 'Metrics', 'Predict']
      },
      {
        name: 'OpenCV',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
        status: 'WORKING WITH',
        tagline: 'Computer vision, real-time camera streams, edge detection, and visual processing.',
        howIUseIt: ['Real-time Video', 'Object Tracking', 'Color Segmentation', 'Contour Filtering'],
        flow: ['Camera Stream', 'Preprocessing', 'Detection', 'Bounding Box', 'Trigger']
      },
      {
        name: 'Hugging Face',
        icon: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
        status: 'EXPLORING',
        tagline: 'Open-source transformer models, tokenizers, quantized LLMs, and dataset hubs.',
        howIUseIt: ['HF Transformers', 'Pipeline API', 'Sentence Embeddings', 'Model Hub Exploration'],
        flow: ['Base Model', 'Tokenizer', 'Fine-Tuning', 'GGUF/ONNX', 'Local Deploy']
      }
    ]
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    subtitle: 'Autonomous agents, tool calling, memory systems, and RAG pipelines.',
    icon: Bot,
    tools: [
      {
        name: 'LangChain',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        status: 'WORKING WITH',
        tagline: 'Composing LLM chains, agent memory buffers, and tool calling integrations.',
        howIUseIt: ['Agent Tool Calling', 'Prompt Templates', 'Document Loaders', 'Conversation Memory'],
        flow: ['User Query', 'Prompt Engine', 'LLM Reasoning', 'Tool Call', 'Final Output']
      },
      {
        name: 'Multi-Agent Systems',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/networkx/networkx-original.svg',
        status: 'WORKING WITH',
        tagline: 'Collaborative autonomous multi-agent orchestration for complex multi-step workflows.',
        howIUseIt: ['Role Delegation', 'Consensus Verification', 'Task Automation', 'Self-Correction'],
        flow: ['Goal', 'Planning Agent', 'Execution Agents', 'Critic/Reviewer', 'Result']
      },
      {
        name: 'RAG Architecture',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
        status: 'HANDS-ON',
        tagline: 'Retrieval-Augmented Generation for grounded answers on custom knowledge bases.',
        howIUseIt: ['Vector Embeddings', 'Chunking Strategy', 'Semantic Retrieval', 'Context Injection'],
        flow: ['Documents', 'Embeddings', 'Vector DB', 'Top-K Retrieval', 'Synthesized Answer']
      },
      {
        name: 'LLM APIs & Prompting',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
        status: 'WORKING WITH',
        tagline: 'Integration with frontier LLMs (Gemini, GPT-4, Claude) with structured JSON schemas.',
        howIUseIt: ['Structured Outputs', 'Function Calling', 'Few-Shot Prompting', 'Chain-of-Thought'],
        flow: ['User Prompt', 'System Guardrails', 'Reasoning Steps', 'JSON Validation', 'UI Action']
      },
      {
        name: 'Vector DB / Chroma',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
        status: 'HANDS-ON',
        tagline: 'Embedding storage, collection indexing, and cosine similarity query engines.',
        howIUseIt: ['Vector Indexing', 'Metadata Filtering', 'Local Persistence', 'Similarity Search'],
        flow: ['Text Chunks', 'Vector Math', 'Index Store', 'Similarity Query', 'Context Result']
      }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    subtitle: 'Modern reactive frontend applications, component architecture, and styling.',
    icon: Globe,
    tools: [
      {
        name: 'React',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        status: 'WORKING WITH',
        tagline: 'Component-driven interactive web applications with custom hooks and modern state.',
        howIUseIt: ['Custom Hooks', 'Dynamic State', 'Framer Motion Animations', 'SPA Architecture'],
        flow: ['Wireframe', 'Component Tree', 'State & Props', 'Virtual DOM', 'Smooth UI']
      },
      {
        name: 'Vue.js',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
        status: 'WORKING WITH',
        tagline: 'Reactive SPAs built with Composition API, Pinia state, and Vue Router.',
        howIUseIt: ['Composition API', 'Pinia Store', 'Reactive Directives', 'Single-File Components'],
        flow: ['Setup Script', 'Reactive State', 'Directives', 'Router/Pinia', 'Production SPA']
      },
      {
        name: 'Tailwind CSS',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        status: 'WORKING WITH',
        tagline: 'Utility-first modern responsive UI design, glassmorphic themes, and sleek layouts.',
        howIUseIt: ['Responsive Design', 'Custom Themes', 'Glassmorphism', 'Micro-interactions'],
        flow: ['Layout Concept', 'Utility Classes', 'Breakpoints', 'JIT Engine', 'Polished UI']
      },
      {
        name: 'Vite',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
        status: 'WORKING WITH',
        tagline: 'Ultra-fast frontend build tooling, hot module replacement, and asset bundling.',
        howIUseIt: ['Lightning HMR', 'Rollup Bundling', 'Environment Config', 'Tree-shaking'],
        flow: ['Source Code', 'ES Modules', 'Dev Server', 'Rollup Build', 'Optimized Dist']
      },
      {
        name: 'REST APIs & Fetch',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Designing, consuming, and handling asynchronous RESTful HTTP endpoints.',
        howIUseIt: ['Async Fetch', 'Error Boundaries', 'JWT Authentication', 'Pagination & Filter'],
        flow: ['API Spec', 'HTTP Query', 'Response Parse', 'State Cache', 'Render']
      }
    ]
  },
  {
    id: 'databases',
    title: 'Databases & Cloud',
    subtitle: 'Relational schemas, SQL queries, local storage, and cloud deployment.',
    icon: Database,
    tools: [
      {
        name: 'PostgreSQL',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
        status: 'HANDS-ON',
        tagline: 'Relational database schema design, indexing, constraints, and complex queries.',
        howIUseIt: ['Relational Schemas', 'Foreign Keys & Joins', 'Index Optimization', 'ACID Transactions'],
        flow: ['Data Model', 'SQL Migrations', 'Indexing', 'Query Tuning', 'Secure Read/Write']
      },
      {
        name: 'SQLite',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Embedded, zero-configuration local database for desktop, edge devices, and testing.',
        howIUseIt: ['Local Persistence', 'Edge Storage', 'Lightweight DB', 'Testing Environments'],
        flow: ['App Init', 'Local Schema', 'CRUD Queries', 'Local Disk Sync', 'Data Ready']
      },
      {
        name: 'Firebase / Supabase',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
        status: 'COMFORTABLE',
        tagline: 'Realtime database sync, user authentication, and cloud storage buckets.',
        howIUseIt: ['OAuth & Auth', 'Realtime Sync', 'File Storage', 'Row Level Security'],
        flow: ['User Action', 'Auth Validation', 'Realtime Stream', 'Storage Write', 'State Update']
      },
      {
        name: 'Netlify & Vercel',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg',
        status: 'WORKING WITH',
        tagline: 'Continuous deployment, global edge delivery, and SPA route rewrites.',
        howIUseIt: ['Git CI/CD Trigger', 'Custom Domains', 'SPA Redirects', 'SSL Enforcement'],
        flow: ['Git Push', 'Auto Build', 'CDN Cache', 'Global Edge', 'Live Site']
      },
      {
        name: 'RESTful Backends',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
        status: 'HANDS-ON',
        tagline: 'FastAPI / Node endpoints for real-time model inference and client data routing.',
        howIUseIt: ['Route Handlers', 'Pydantic Models', 'CORS Config', 'Async Workers'],
        flow: ['Client Call', 'Endpoint Route', 'Validation', 'Service Logic', 'JSON Payload']
      }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Tools',
    subtitle: 'Version control, Linux terminal environments, scripting, and debugging.',
    icon: Wrench,
    tools: [
      {
        name: 'Git & GitHub',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        status: 'WORKING WITH',
        tagline: 'Version control, atomic commits, branching workflows, and open-source collaboration.',
        howIUseIt: ['Feature Branches', 'Pull Requests', 'Git Rebase & Merge', 'Release Tags'],
        flow: ['Local Branch', 'Atomic Commits', 'PR Review', 'Merge Main', 'Release Tag']
      },
      {
        name: 'Linux & Bash',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
        status: 'WORKING WITH',
        tagline: 'Command-line scripting, server management, package builds, and system administration.',
        howIUseIt: ['Shell Scripting', 'Process Management', 'SSH & Cron Jobs', 'File Permissions'],
        flow: ['CLI Terminal', 'Script Run', 'Service Daemon', 'Log Monitor', 'Healthy Sys']
      },
      {
        name: 'Docker',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        status: 'HANDS-ON',
        tagline: 'Containerizing applications for consistent, isolated, and reproducible execution.',
        howIUseIt: ['Dockerfile Builds', 'Container Isolation', 'Port Forwarding', 'Multi-stage Builds'],
        flow: ['Code + Deps', 'Build Image', 'Run Container', 'Port Bind', 'Isolated Env']
      },
      {
        name: 'Postman',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
        status: 'COMFORTABLE',
        tagline: 'API endpoint testing, request debugging, automated checks, and payload validation.',
        howIUseIt: ['Payload Testing', 'Environment Variables', 'Header Verification', 'Response Inspection'],
        flow: ['Endpoint URL', 'Set Headers', 'Send Request', 'Verify Status 200', 'Validate Body']
      },
      {
        name: 'VS Code & Dev Tools',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
        status: 'WORKING WITH',
        tagline: 'Advanced developer IDE workflow, breakpoints, linters, and productivity extensions.',
        howIUseIt: ['Integrated Debugger', 'ESLint & TypeScript', 'Git Graph', 'Productivity Shortcuts'],
        flow: ['Code Base', 'Lint Check', 'Debugger Step', 'Inspect State', 'Clean Code']
      }
    ]
  },
  {
    id: 'robotics',
    title: 'Robotics & Hardware',
    subtitle: 'Embedded controllers, microcontrollers, ROS communication, and sensor fusion.',
    icon: Zap,
    tools: [
      {
        name: 'Espressif (ESP32)',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/embeddedc/embeddedc-original.svg',
        status: 'WORKING WITH',
        tagline: 'Dual-core microcontroller programming, WiFi/BLE IoT telemetry, and hardware interrupts.',
        howIUseIt: ['FreeRTOS Tasks', 'WiFi/BLE Stacks', 'ADC Sensor Reading', 'PWM Actuator Control'],
        flow: ['Sensor Circuit', 'ESP32 Firmware', 'ADC/I2C Read', 'WiFi Packet', 'Telemetry']
      },
      {
        name: 'Raspberry Pi',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg',
        status: 'WORKING WITH',
        tagline: 'Single-board edge computing, camera capture, Linux daemons, and GPIO interfacing.',
        howIUseIt: ['Edge AI Inference', 'Linux Daemons', 'Camera Capture', 'UART/GPIO Interfaces'],
        flow: ['Boot Linux', 'Camera Stream', 'Edge Model', 'GPIO Output', 'Motor Control']
      },
      {
        name: 'ROS / ROS 2',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ros/ros-original.svg',
        status: 'HANDS-ON',
        tagline: 'Robot Operating System nodes, publishers/subscribers, message queues, and TF trees.',
        howIUseIt: ['Pub/Sub Nodes', 'Message Queues', 'TF Transforms', 'Sensor Pipelines'],
        flow: ['Sensor Node', 'Topic Publish', 'Core Pipeline', 'Subscriber', 'Actuator Node']
      },
      {
        name: 'Arduino & Microcontrollers',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Microcontroller logic, sensor interfacing, servo control, and serial debugging.',
        howIUseIt: ['Interrupt Timers', 'Serial Communication', 'Motor Drivers', 'Sensor Calibration'],
        flow: ['Power On', 'Setup Routine', 'Loop Execution', 'Sensor Read', 'Driver Output']
      },
      {
        name: 'Circuit & Prototyping',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
        status: 'HANDS-ON',
        tagline: 'Breadboard circuit design, voltage regulation, signal filtering, and sensor integration.',
        howIUseIt: ['Voltage Regulation', 'I2C/SPI Busses', 'Relay Switching', 'Breadboard Prototyping'],
        flow: ['Schematic', 'Breadboard Test', 'Voltage Check', 'Firmware Test', 'Enclosure']
      }
    ]
  }
];

const quickPills = [
  { name: 'Linux', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', catId: 'devops', toolName: 'Linux & Bash' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', catId: 'software-dev', toolName: 'Python' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', catId: 'software-dev', toolName: 'TypeScript' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', catId: 'software-dev', toolName: 'JavaScript' },
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', catId: 'web-dev', toolName: 'React' },
  { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', catId: 'web-dev', toolName: 'Vue.js' },
  { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', catId: 'web-dev', toolName: 'Vite' },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', catId: 'web-dev', toolName: 'Tailwind CSS' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', catId: 'web-dev', toolName: 'REST APIs & Fetch' },
  { name: 'Espressif', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/embeddedc/embeddedc-original.svg', catId: 'robotics', toolName: 'Espressif (ESP32)' },
  { name: 'Raspberry Pi', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg', catId: 'robotics', toolName: 'Raspberry Pi' },
  { name: 'ROS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ros/ros-original.svg', catId: 'robotics', toolName: 'ROS / ROS 2' },
  { name: 'PyTorch', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg', catId: 'ai-ml', toolName: 'PyTorch' },
  { name: 'TensorFlow', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', catId: 'ai-ml', toolName: 'TensorFlow' },
  { name: 'Hugging Face', icon: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg', catId: 'ai-ml', toolName: 'Hugging Face' },
  { name: 'LangChain', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', catId: 'ai-agents', toolName: 'LangChain' },
  { name: 'OpenCV', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg', catId: 'ai-ml', toolName: 'OpenCV' },
];

function Skills() {
  const [selectedCatId, setSelectedCatId] = useState<string>('ai-ml');
  const [selectedToolName, setSelectedToolName] = useState<string>('PyTorch');

  const currentCategory = useMemo(() => {
    return toolkitCategories.find(c => c.id === selectedCatId) || toolkitCategories[1];
  }, [selectedCatId]);

  const currentTool = useMemo(() => {
    return currentCategory.tools.find(t => t.name === selectedToolName) || currentCategory.tools[0];
  }, [currentCategory, selectedToolName]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const cat = toolkitCategories.find(c => c.id === catId);
    if (cat && cat.tools.length > 0) {
      setSelectedToolName(cat.tools[0].name);
    }
  };

  const handleSelectQuickPill = (catId: string, toolName: string) => {
    setSelectedCatId(catId);
    setSelectedToolName(toolName);
  };

  const getStatusBadgeStyle = (status: ToolDetail['status']) => {
    switch (status) {
      case 'WORKING WITH':
        return 'text-[#00abf0] border-[#00abf0]/40 bg-[#00abf0]/10 shadow-[0_0_10px_rgba(0,171,240,0.2)]';
      case 'HANDS-ON':
        return 'text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'COMFORTABLE':
        return 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'EXPLORING':
        return 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    }
  };

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 lg:px-12 pt-4 lg:pt-8 pb-24 text-white">
      {/* ─── 1. Header ─── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-[#00abf0] uppercase">
            04 &nbsp;TOOLKIT
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Skills & Technologies
        </h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl">
          Tools I use to turn ideas into working, intelligent, and scalable systems.
        </p>
      </div>

      {/* ─── 2. Top Interactive Tech Cloud / Quick Pills ─── */}
      <div className="flex flex-wrap items-center gap-2.5 mb-10 pb-2">
        {quickPills.map((pill) => {
          const isSelected = selectedToolName === pill.toolName;
          return (
            <button
              key={pill.name}
              onClick={() => handleSelectQuickPill(pill.catId, pill.toolName)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                isSelected
                  ? 'bg-[#00abf0]/20 border-[#00abf0] text-white shadow-[0_0_15px_rgba(0,171,240,0.4)] scale-105'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-300 hover:border-[#00abf0]/40 hover:text-white hover:bg-white/[0.06]'
              } border backdrop-blur-sm cursor-pointer`}
            >
              <img src={pill.icon} alt={pill.name} className="w-4 h-4 object-contain" />
              <span>{pill.name}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. Main Interactive Workspace Frame ─── */}
      <div className="rounded-2xl border border-white/10 bg-[#071726]/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Workspace Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#05111d]/70 text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-300 uppercase tracking-widest font-bold">
            <Layers size={13} className="text-[#00abf0]" />
            <span>HOW I WORK WITH THEM</span>
          </div>
          <div className="text-gray-400">
            <span className="text-[#00abf0] font-bold">{toolkitCategories.length} areas</span> &middot; 35+ tools
          </div>
        </div>

        {/* 3-Column Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          {/* ── Column 1: Areas / Categories (md:col-span-3) ── */}
          <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-1.5 bg-black/20">
            {toolkitCategories.map((cat) => {
              const isActive = cat.id === selectedCatId;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00abf0]/15 text-white border border-[#00abf0]/40 shadow-[0_0_15px_rgba(0,171,240,0.15)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-[#00abf0]' : 'text-gray-500'} />
                    <span className="truncate font-semibold">{cat.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#00abf0]/20 text-[#00abf0]' : 'text-gray-600 bg-white/[0.02]'
                  }`}>
                    0{cat.tools.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Column 2: Tool List in Selected Category (md:col-span-4) ── */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between bg-black/10">
            <div>
              {/* Category Subheader */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white mb-1">{currentCategory.title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{currentCategory.subtitle}</p>
              </div>

              {/* Tools List */}
              <div className="space-y-2">
                {currentCategory.tools.map((tool) => {
                  const isSelected = selectedToolName === tool.name;
                  return (
                    <div
                      key={tool.name}
                      onClick={() => setSelectedToolName(tool.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00abf0]/15 border-[#00abf0]/60 shadow-[0_0_16px_rgba(0,171,240,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center p-1.5 border border-white/10">
                          <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-bold text-white">{tool.name}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(tool.status)}`}>
                        {tool.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Micro Helper */}
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-gray-500 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#00abf0]" />
              <span>Click any tool to inspect deep-dive workflow</span>
            </div>
          </div>

          {/* ── Column 3: Tool Deep-Dive Inspector (md:col-span-5) ── */}
          <div className="md:col-span-5 p-6 lg:p-7 flex flex-col justify-between bg-[#040f1a]/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTool.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Tool Header: Big glowing icon + Title + Status */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-[#00abf0]/40 flex items-center justify-center p-3 shadow-[0_0_25px_rgba(0,171,240,0.2)]">
                    <img src={currentTool.icon} alt={currentTool.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-xl font-bold text-white">{currentTool.name}</h3>
                      <span className={`text-[9px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(currentTool.status)}`}>
                        {currentTool.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                      {currentTool.tagline}
                    </p>
                  </div>
                </div>

                {/* HOW I USE IT */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#00abf0] mb-3 flex items-center gap-1.5">
                    <Activity size={12} /> HOW I USE IT
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentTool.howIUseIt.map((usage, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00abf0]" />
                        {usage}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TYPICAL FLOW */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#00abf0] mb-3 flex items-center gap-1.5">
                    <Terminal size={12} /> TYPICAL FLOW
                  </h4>
                  <div className="flex items-center flex-wrap gap-1.5 p-3 rounded-xl bg-black/30 border border-white/5">
                    {currentTool.flow.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#00abf0]/10 text-white border border-[#00abf0]/20">
                          {step}
                        </span>
                        {idx < currentTool.flow.length - 1 && (
                          <span className="text-gray-500 text-xs font-mono px-0.5">&rarr;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Status Footnote */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Production-proven on live projects
              </span>
              <span className="font-mono text-[10px] text-[#00abf0]">Rathishan's Toolkit</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Bottom "CURRENTLY EXPLORING" Bar ─── */}
      <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
          <Sparkles size={14} className="text-[#00abf0]" />
          <span>CURRENTLY EXPLORING:</span>
        </div>

        <div className="flex items-center flex-wrap justify-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-amber-500/30 text-amber-300">
            <span>🤗</span>
            <span>Hugging Face Fine-Tuning</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-red-500/30 text-red-300">
            <span>⚡</span>
            <span>Redis Vector Search</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#00abf0]/30 text-[#00abf0]">
            <span>🔄</span>
            <span>Sensor Fusion with ROS 2</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const card = 'bg-white/[0.03] border border-white/[0.07] hover:border-[#00abf0]/30';
  const ts = 'text-gray-400';
  const tp = 'text-white';

  // Tag level → badge style
  const tagStyle = (level: 'core' | 'supporting' | 'exposure') => {
    if (level === 'core')       return 'bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/20';
    if (level === 'supporting') return 'bg-white/[0.05] text-gray-300 border border-white/10';
    return 'bg-white/[0.02] text-gray-500 border border-white/5';
  };

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-2 lg:pt-8 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-2 text-[#00abf0]">Portfolio</p>
        <h2 className={`text-2xl md:text-3xl font-bold ${tp}`}>Featured Projects</h2>
      </div>

      {/* Refined layout: Featured project spans full row horizontally, others take 1 column each */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projectsData.map((project, i) => (
          <div
            key={project.title}
            className={`group relative rounded-2xl overflow-hidden flex transition-all duration-400 hover:-translate-y-1.5 ${card} ${
              i === 0 ? 'flex-col lg:flex-row lg:col-span-3' : 'flex-col'
            }`}
          >
            {/* Project image */}
            <div className={`${i === 0 ? 'w-full lg:w-3/5 h-60 lg:h-auto min-h-[280px]' : 'w-full h-40'} overflow-hidden relative border-b lg:border-b-0 lg:border-r border-white/[0.08]`}>
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>

            <div className={`p-5 flex flex-col flex-1 ${i === 0 ? 'lg:p-8 lg:w-2/5 justify-center' : ''}`}>
              {/* Featured badge for first project */}
              {i === 0 && (
                <span className="self-start mb-3 text-[10px] px-3 py-1 rounded-full font-bold bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/25">
                  ★ Featured Project
                </span>
              )}
              <h3 className={`font-bold ${i === 0 ? 'text-2xl' : 'text-base'} mb-2 ${tp}`}>{project.title}</h3>
              <p className={`text-sm leading-relaxed flex-1 mb-5 lg:mr-2 ${ts}`}>{project.description}</p>

              {/* Tags — styled by level */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag.name}
                    title={`Role: ${tag.level}`}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${tagStyle(tag.level)}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Buttons — conditionally render demo only when demoLink exists */}
              <div className="flex gap-3 mt-auto">
                <a
                  href={project.codeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    project.demoLink ? 'flex-1' : 'w-full'
                  } bg-white/[0.05] hover:bg-white/[0.1] text-white`}
                >
                  <Github size={13} /> Code
                </a>
                {project.demoLink && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-[#00abf0] hover:bg-[#00abf0]/80 text-white transition-colors"
                  >
                    <ExternalLink size={13} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // Auto-close sidebar whenever the route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/',        label: 'Home'     },
    { to: '/about',   label: 'About Me' },
    { to: '/skills',  label: 'Skills'   },
    { to: '/projects',label: 'Projects' },
    { to: '/contact', label: 'Connect'  },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#081524] text-white selection:bg-[#00abf0] selection:text-white">
      {/* First 3D Constellation & Atmospheric Network Background */}
      <NetworkBackground />

      {/* ─── Navbar ─── */}
      <nav className="relative z-20 flex items-center justify-between px-5 lg:px-12 py-3 lg:py-5 max-w-7xl mx-auto w-full border-b border-white/5">
        {/* Logo / Brand Name */}
        <Link to="/" className="text-2xl font-bold tracking-tight cursor-pointer flex items-center group">
          <span className="text-white group-hover:text-gray-100 transition-colors">Rathishan</span>
          <span className="text-[#00abf0]">.</span>
          <span className="text-gray-300 group-hover:text-white font-medium ml-1.5 transition-colors">M</span>
        </Link>

        {/* Desktop nav links with active state highlighting */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold tracking-wide">
          {navLinks.map(l => {
            const isActive = location.pathname === l.to;
            return (
              <Link 
                key={l.to} 
                to={l.to} 
                className={`relative py-1 transition-colors duration-200 ${
                  isActive ? 'text-[#00abf0] font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span 
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#00abf0] rounded-full shadow-[0_0_8px_#00abf0]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop right controls */}
        <div className="hidden lg:flex items-center space-x-6">
          <a href="/Resume/Rathishan_Resume_Template.pdf" download="Rathishan_Resume_Template.pdf" className="border-2 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white shadow-[0_0_15px_rgba(255,0,79,0.2)]">
            Download CV <Download size={16} />
          </a>
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/[0.05] hover:bg-white/[0.1] text-white ${isMobileMenuOpen ? 'ring-2 ring-[#00abf0]/50' : ''}`}
          >
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
              }`}
            >
              <X size={20} style={{ color: '#00abf0' }} />
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
              }`}
            >
              <Menu size={20} />
            </span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {/* Backdrop */}
      <div
        onClick={closeMobileMenu}
        className={`lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Drawer panel — slides in from the right */}
      <aside
        className={`lg:hidden fixed top-0 right-0 z-40 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-[#081b29]/95 border-l border-white/10 backdrop-blur-xl`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <Link to="/" onClick={closeMobileMenu} className="text-lg font-bold flex items-center">
            <span className="text-white">Rathishan</span>
            <span className="text-[#00abf0]">.</span>
            <span className="text-gray-300 ml-1">M</span>
          </Link>
          <button
            onClick={closeMobileMenu}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-4 pt-4 gap-1 flex-1">
          {navLinks.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={closeMobileMenu}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                location.pathname === l.to
                  ? 'bg-[#00abf0]/10 text-[#00abf0] border-l-2 border-[#00abf0]'
                  : 'text-gray-300 hover:bg-white/[0.05] hover:text-white border-l-2 border-transparent'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? `${i * 40}ms` : '0ms' }}
            >
              <span
                className={`transition-all duration-300 ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 50 + 100}ms` : '0ms' }}
              >
                {l.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 pb-6 pt-4 border-t flex flex-col gap-4 border-white/10">
          <a href="/Resume/Rathishan_Resume_Template.pdf" download="Rathishan_Resume_Template.pdf" className="w-full border-2 px-5 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white">
            Download CV <Download size={16} />
          </a>
          <p className="text-[11px] text-center mt-3 text-gray-600">
            © {new Date().getFullYear()} Rathishan Mahendran
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 mt-auto border-t border-white/5 bg-[#081b29]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-500">
            &copy; {new Date().getFullYear()} Rathishan Mahendran.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <a href="#" className="hover:text-[#00abf0] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#00abf0] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
