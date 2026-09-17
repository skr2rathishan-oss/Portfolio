import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Download, Linkedin, Github, ExternalLink, Cpu, Zap, Instagram, Facebook, Menu, X, 
  Terminal, Code2, Sparkles, Bot, Globe, Database, Wrench, Layers, CheckCircle2, Activity, Eye 
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import About from './About';
import Contact from './Contact';
import NetworkBackground from './NetworkBackground';
import { projectsData, profileData, type Project, type Tag } from './data';

function Home() {
  // Motion variants for smooth orchestrated entry
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
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

  const socialVariants: Variants = {
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

  return (
    <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-12 py-4 lg:py-16 flex flex-col justify-center w-full lg:min-h-[calc(100vh-140px)]">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14 w-full my-auto">
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#00abf0]/25 text-xs font-mono mb-5 shadow-[0_0_15px_rgba(0,171,240,0.1)] backdrop-blur-sm"
          >
            <Terminal size={13} className="text-[#00abf0]" />
            <span className="text-gray-400">const</span>
            <span className="text-[#00abf0] font-semibold">engineer</span>
            <span className="text-gray-400">=</span>
            <span className="text-emerald-400 font-medium">"AI &amp; Software Developer"</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </motion.div>

          {/* Category tags */}
          <motion.p 
            variants={itemVariants}
            className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-4 text-[#00abf0] font-mono flex items-center gap-2"
          >
            <Code2 size={14} className="text-[#00abf0]" />
            AI &nbsp;&middot;&nbsp; AI Agents &nbsp;&middot;&nbsp; Software &nbsp;&middot;&nbsp; Robotics
          </motion.p>

          {/* Main heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-bold mb-5 tracking-tight leading-[1.15]"
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
            className="text-sm md:text-base leading-relaxed mb-8 max-w-xl text-gray-400"
          >
            I'm Rathishan Mahendran &mdash; a Computer Engineering student
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
                className="px-8 py-3.5 rounded-full font-bold bg-[#00abf0] text-[#081b29] transition-all duration-300 flex items-center gap-2 text-sm cursor-pointer border-none shadow-[0_0_20px_rgba(0,171,240,0.3)] hover:shadow-[0_0_25px_rgba(0,171,240,0.5)]"
              >
                View my work <ExternalLink size={16} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/contact"
                className="px-8 py-3.5 rounded-full font-bold border border-[#00abf0]/40 text-white hover:bg-[#00abf0]/10 transition-all duration-300 flex items-center gap-2 text-sm cursor-pointer hover:border-[#00abf0] hover:shadow-[0_0_15px_rgba(0,171,240,0.2)]"
              >
                Let's talk
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Links with Staggered Motion */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center space-x-4 text-gray-400"
          >
            {[
              { href: "https://linkedin.com/in/rathishan-mahendran", icon: <Linkedin size={18} />, label: "LinkedIn", color: "hover:text-[#0A66C2] hover:border-[#0A66C2]/40" },
              { href: "https://github.com/skr2rathishan-oss", icon: <Github size={18} />, label: "GitHub", color: "hover:text-white hover:border-white/40" },
              { href: "https://instagram.com/rathishan._", icon: <Instagram size={18} />, label: "Instagram", color: "hover:text-[#E4405F] hover:border-[#E4405F]/40" },
              { href: "https://facebook.com/rathishan.21", icon: <Facebook size={18} />, label: "Facebook", color: "hover:text-[#1877F2] hover:border-[#1877F2]/40" }
            ].map((social, i) => (
              <motion.a
                key={social.label}
                variants={socialVariants}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors duration-200 bg-white/[0.02] cursor-pointer ${social.color}`}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Floating Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full lg:w-[44%] flex justify-center items-center order-1 lg:order-2"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
             {/* Glowing Cybernetic Backdrop Accent */}
             <div 
               className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
               style={{ background: 'radial-gradient(circle, #00abf0 0%, #081b29 70%)' }}
             />

             {/* Dynamic Organic Outer Ring */}
             <div 
               className="absolute inset-[-10px] md:inset-[-12px] border border-[#00abf0]/40 transition-transform duration-1000"
               style={{ 
                 borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                 animation: 'morphShape 12s ease-in-out infinite alternate',
                 background: 'linear-gradient(135deg, rgba(0,171,240,0.15) 0%, rgba(8,27,41,0.4) 100%)'
               }}
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
    id: 'ai-agents',
    title: 'AI Agents & LLMs',
    subtitle: 'Autonomous agents, tool calling, memory systems, and LangChain orchestration.',
    icon: Bot,
    tools: [
      {
        name: 'LangChain',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        status: 'WORKING WITH',
        tagline: 'Orchestrating agent workflows, memory buffers, and tool-calling chains in Velora AI.',
        howIUseIt: ['Agent Tool Calling', 'Custom Prompts', 'Conversation Memory', 'LLM Chains'],
        flow: ['User Intent', 'Tool Selection', 'Action Execution', 'Synthesized Response']
      },
      {
        name: 'LLM Agents',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
        status: 'WORKING WITH',
        tagline: 'Multi-tool reasoning, function calling, and structured JSON outputs.',
        howIUseIt: ['Function Calling', 'Structured Schemas', 'Multi-step Reasoning', 'Automated Search'],
        flow: ['Prompt', 'Guardrails', 'Function Call', 'Validation', 'Action']
      },
      {
        name: 'FastAPI Services',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
        status: 'WORKING WITH',
        tagline: 'High-performance async API endpoints powering AI agent workflows.',
        howIUseIt: ['Async Handlers', 'Pydantic Schemas', 'CORS & Auth', 'Model Endpoints'],
        flow: ['Request', 'Schema Parse', 'Agent Pipeline', 'JSON Payload']
      },
      {
        name: 'Python',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        status: 'WORKING WITH',
        tagline: 'Primary language for AI agents, machine learning experiments, and backend scripts.',
        howIUseIt: ['Agent Architecture', 'Data Pipelines', 'Automation Scripts', 'FastAPI Services'],
        flow: ['Problem', 'Data Structure', 'Algorithm', 'Testing', 'Production']
      }
    ]
  },
  {
    id: 'ai-ml',
    title: 'Machine Learning',
    subtitle: 'Model training, data preprocessing, regression, and classification.',
    icon: Cpu,
    tools: [
      {
        name: 'scikit-learn',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg',
        status: 'WORKING WITH',
        tagline: 'Classical ML algorithms, regression, classification, clustering, and cross-validation.',
        howIUseIt: ['Feature Engineering', 'Random Forests', 'Regression Models', 'Hyperparameter Tuning'],
        flow: ['Raw Data', 'Preprocessing', 'Model Fit', 'Evaluation', 'Predictions']
      },
      {
        name: 'PyTorch',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
        status: 'HANDS-ON',
        tagline: 'Building, training, and evaluating deep learning neural network architectures.',
        howIUseIt: ['Tensors & Layers', 'Training Loops', 'Loss Functions', 'Model Validation'],
        flow: ['Dataset', 'Model Architecture', 'Training Loop', 'Validation', 'Inference']
      },
      {
        name: 'TensorFlow',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
        status: 'HANDS-ON',
        tagline: 'Machine learning workflows, Keras model pipelines, and neural classification.',
        howIUseIt: ['Keras Models', 'Data Pipeline', 'Model Evaluation', 'Feature Scaling'],
        flow: ['Preprocess', 'Architecture', 'Train', 'Validate', 'Export']
      },
      {
        name: 'Pandas & Data Science',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
        status: 'WORKING WITH',
        tagline: 'Exploratory data analysis, cleaning, data wrangling, and feature transformations.',
        howIUseIt: ['Data Preprocessing', 'Feature Extraction', 'Outlier Detection', 'Data Cleaning'],
        flow: ['CSV/Data', 'Clean & Transform', 'Analyze', 'Feature Set', 'ML Ready']
      }
    ]
  },
  {
    id: 'web-dev',
    title: 'Frontend & UI',
    subtitle: 'Reactive modern web applications, state management, and responsive styling.',
    icon: Globe,
    tools: [
      {
        name: 'React',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        status: 'WORKING WITH',
        tagline: 'Component-driven interactive web applications with custom hooks and state.',
        howIUseIt: ['Custom Hooks', 'Dynamic State', 'Framer Motion Animations', 'SPA Architecture'],
        flow: ['Wireframe', 'Components', 'State & Props', 'Virtual DOM', 'Smooth UI']
      },
      {
        name: 'Vue.js',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
        status: 'WORKING WITH',
        tagline: 'Reactive SPAs built with Composition API, Pinia state, and Vue Router in E-Commerce SPA.',
        howIUseIt: ['Composition API', 'Pinia Store', 'Reactive Directives', 'Single-File Components'],
        flow: ['Setup Script', 'Reactive State', 'Directives', 'Router/Pinia', 'Production SPA']
      },
      {
        name: 'TypeScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        status: 'WORKING WITH',
        tagline: 'Strictly-typed scalable web applications, robust interfaces, and type safety.',
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
        name: 'Tailwind CSS',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        status: 'WORKING WITH',
        tagline: 'Utility-first modern responsive UI design, glassmorphic themes, and sleek layouts.',
        howIUseIt: ['Responsive Design', 'Custom Themes', 'Glassmorphism', 'Micro-interactions'],
        flow: ['Layout Concept', 'Utility Classes', 'Breakpoints', 'JIT Engine', 'Polished UI']
      },
      {
        name: 'HTML5 & CSS3',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        status: 'COMFORTABLE',
        tagline: 'Semantic page structure, responsive flexbox/grid systems, and CSS animations.',
        howIUseIt: ['Semantic Layouts', 'Flexbox & CSS Grid', 'Custom Keyframes', 'Responsive Breakpoints'],
        flow: ['Wireframe', 'Semantic HTML', 'CSS Styles', 'Animation Test', 'Cross-browser']
      }
    ]
  },
  {
    id: 'devops-tools',
    title: 'Tooling & DevOps',
    subtitle: 'Version control, modern build tooling, API testing, and developer workflow.',
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
        status: 'WORKING WITH',
        tagline: 'Designing, consuming, and handling asynchronous RESTful HTTP endpoints.',
        howIUseIt: ['Async Fetch', 'Error Boundaries', 'JWT Authentication', 'Pagination & Filter'],
        flow: ['API Spec', 'HTTP Query', 'Response Parse', 'State Cache', 'Render']
      },
      {
        name: 'Linux & Bash',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
        status: 'WORKING WITH',
        tagline: 'Command-line scripting, server management, package builds, and system administration.',
        howIUseIt: ['Shell Scripting', 'Process Management', 'CLI Tools', 'File Permissions'],
        flow: ['CLI Terminal', 'Script Run', 'Service Daemon', 'Log Monitor', 'Healthy Sys']
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
        name: 'VS Code',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
        status: 'WORKING WITH',
        tagline: 'Advanced developer IDE workflow, breakpoints, linters, and productivity extensions.',
        howIUseIt: ['Integrated Debugger', 'ESLint & TypeScript', 'Git Graph', 'Productivity Shortcuts'],
        flow: ['Code Base', 'Lint Check', 'Debugger Step', 'Inspect State', 'Clean Code']
      }
    ]
  }
];

const quickPillsRow1 = [
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', catId: 'ai-agents', toolName: 'Python' },
  { name: 'LangChain', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', catId: 'ai-agents', toolName: 'LangChain' },
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', catId: 'web-dev', toolName: 'React' },
  { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', catId: 'web-dev', toolName: 'Vue.js' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', catId: 'web-dev', toolName: 'TypeScript' },
  { name: 'PyTorch', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg', catId: 'ai-ml', toolName: 'PyTorch' },
  { name: 'FastAPI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg', catId: 'ai-agents', toolName: 'FastAPI Services' },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', catId: 'web-dev', toolName: 'Tailwind CSS' },
  { name: 'Git & GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', catId: 'devops-tools', toolName: 'Git & GitHub' },
  { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', catId: 'devops-tools', toolName: 'Vite' },
];

const quickPillsRow2 = [
  { name: 'scikit-learn', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg', catId: 'ai-ml', toolName: 'scikit-learn' },
  { name: 'TensorFlow', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', catId: 'ai-ml', toolName: 'TensorFlow' },
  { name: 'LLM Agents', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', catId: 'ai-agents', toolName: 'LLM Agents' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', catId: 'web-dev', toolName: 'JavaScript' },
  { name: 'Pandas', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg', catId: 'ai-ml', toolName: 'Pandas & Data Science' },
  { name: 'HTML5 & CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', catId: 'web-dev', toolName: 'HTML5 & CSS3' },
  { name: 'REST APIs', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', catId: 'devops-tools', toolName: 'REST APIs & Fetch' },
  { name: 'Linux', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', catId: 'devops-tools', toolName: 'Linux & Bash' },
  { name: 'Postman', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg', catId: 'devops-tools', toolName: 'Postman' },
  { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', catId: 'devops-tools', toolName: 'VS Code' },
];

function Skills() {
  const [selectedCatId, setSelectedCatId] = useState<string>('ai-agents');
  const [selectedToolName, setSelectedToolName] = useState<string>('LangChain');

  const currentCategory = useMemo(() => {
    return toolkitCategories.find(c => c.id === selectedCatId) || toolkitCategories[0];
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

  const getStatusBadgeStyle = (status: ToolDetail['status']) => {
    switch (status) {
      case 'WORKING WITH':
        return 'text-[#00abf0] border-[#00abf0]/40 bg-[#00abf0]/10';
      case 'HANDS-ON':
        return 'text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10';
      case 'COMFORTABLE':
        return 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10';
      case 'EXPLORING':
        return 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10';
    }
  };

  return (
    <div className="relative z-10 w-full text-white">
      {/* ─── 1. Header (Mobile Only, Hidden on Desktop) ─── */}
      <div className="mb-6 md:hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-[#00abf0] uppercase">
            03 &nbsp;TOOLKIT
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          Skills &amp; Technologies
        </h2>
      </div>

      {/* ─── 2. Dual Horizontal Scrolling Marquee (Continuous, Non-stop, Non-clickable on All Devices) ─── */}
      <div className="relative w-full overflow-hidden mb-8 pb-1 space-y-3 pointer-events-none select-none">
        {/* Left and right fade gradient masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#081524] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#081524] to-transparent z-10" />

        {/* Row 1: Leftward Infinite Marquee */}
        <div className="animate-marquee-left flex gap-3">
          {[...quickPillsRow1, ...quickPillsRow1].map((pill, idx) => (
            <div
              key={`row1-${pill.name}-${idx}`}
              className="h-11 md:h-12 px-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap border bg-white/[0.03] border-white/[0.08] text-gray-300 pointer-events-none select-none shrink-0"
            >
              <img src={pill.icon} alt={pill.name} className="w-5 h-5 object-contain" />
              <span>{pill.name}</span>
            </div>
          ))}
        </div>

        {/* Row 2: Rightward Infinite Marquee */}
        <div className="animate-marquee-right flex gap-3">
          {[...quickPillsRow2, ...quickPillsRow2].map((pill, idx) => (
            <div
              key={`row2-${pill.name}-${idx}`}
              className="h-11 md:h-12 px-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap border bg-white/[0.03] border-white/[0.08] text-gray-300 pointer-events-none select-none shrink-0"
            >
              <img src={pill.icon} alt={pill.name} className="w-5 h-5 object-contain" />
              <span>{pill.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Main Interactive Workspace Frame (Shadowless & Clean Border) ─── */}
      <div className="rounded-2xl border border-white/10 bg-[#071726]/80 backdrop-blur-xl overflow-hidden shadow-none">
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
          <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-white/10 p-3 flex flex-col gap-1.5 bg-black/20">
            {toolkitCategories.map((cat) => {
              const isActive = cat.id === selectedCatId;
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 md:py-3 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00abf0]/15 text-white border border-[#00abf0]/40 shadow-[0_0_15px_rgba(0,171,240,0.15)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-[#00abf0]' : 'text-gray-500'} />
                    <span className="truncate font-semibold">{cat.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 ${
                    isActive ? 'bg-[#00abf0]/20 text-[#00abf0]' : 'text-gray-600 bg-white/[0.02]'
                  }`}>
                    0{cat.tools.length}
                  </span>
                </motion.button>
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
                    <motion.div
                      key={tool.name}
                      whileHover={{ x: 3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedToolName(tool.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00abf0]/15 border-[#00abf0]/60 shadow-[0_0_15px_rgba(0,171,240,0.1)]'
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
                    </motion.div>
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
                {/* Tool Header: Icon + Title + Status */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-[#00abf0]/40 flex items-center justify-center p-3 shadow-[0_0_20px_rgba(0,171,240,0.15)]">
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
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-amber-500/30 text-amber-300 cursor-default">
            <span>🤗</span>
            <span>Hugging Face Fine-Tuning</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-red-500/30 text-red-300 cursor-default">
            <span>⚡</span>
            <span>Redis Vector Search</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#00abf0]/30 text-[#00abf0] cursor-default">
            <span>🔄</span>
            <span>Sensor Fusion with ROS 2</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isMobile?: boolean;
}

const ProjectCard = memo(function ProjectCard({ project, isMobile = false }: ProjectCardProps) {
  const cardBody = (
    <div
      className={`group relative rounded-2xl md:rounded-3xl bg-[#061424] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 pb-5 flex flex-col justify-between transition-colors duration-200 ${
        isMobile
          ? 'w-[84vw] max-w-[340px] flex-shrink-0 snap-center min-h-[460px]'
          : 'w-full min-h-[490px]'
      }`}
    >
      <div>
        {/* Project Thumbnail Image */}
        <div className="relative w-full h-44 rounded-xl md:rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061424]/90 via-transparent to-transparent pointer-events-none" />
          
          {/* Complexity pill badge top-left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#061424]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-gray-300">
            <span className={`w-1.5 h-1.5 rounded-full ${
              project.complexity === 'high' ? 'bg-amber-400' : project.complexity === 'medium' ? 'bg-[#00abf0]' : 'bg-emerald-400'
            }`} />
            {project.complexity}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#00abf0] transition-colors duration-200">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Structured Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag: Tag) => {
            const isCore = tag.level === 'core';
            return (
              <span
                key={tag.name}
                className={`text-[10px] md:text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                  isCore
                    ? 'bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30'
                    : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                }`}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-auto">
        {project.demoLink ? (
          <>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#00abf0] text-[#081b29] hover:bg-[#00abf0]/90 transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(0,171,240,0.25)]"
            >
              <Eye size={14} />
              <span>Visit Site</span>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={project.codeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <Github size={14} />
              <span>Source Code</span>
            </motion.a>
          </>
        ) : (
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={project.codeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-[#00abf0]/15 hover:border-[#00abf0]/30 hover:text-[#00abf0] transition-colors duration-200 cursor-pointer"
          >
            <Github size={14} />
            <span>Source Code</span>
          </motion.a>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return cardBody;
  }

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="w-full flex"
    >
      {cardBody}
    </motion.div>
  );
});

function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'fullstack' | 'frontend'>('all');

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'fullstack', label: 'Full-Stack' },
    { id: 'ai', label: 'AI & Machine Learning' },
    { id: 'frontend', label: 'Frontend / UI' },
  ];

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projectsData;
    if (selectedCategory === 'ai') {
      return projectsData.filter(
        p => p.tags.some(t => ['TensorFlow', 'PyTorch', 'scikit-learn', 'Python', 'LangChain', 'AI Agents', 'LLMs', 'Pandas'].includes(t.name)) || 
             p.title.toLowerCase().includes('ai') || 
             p.title.toLowerCase().includes('learning')
      );
    }
    if (selectedCategory === 'fullstack') {
      return projectsData.filter(
        p => p.tags.some(t => ['Vue 3', 'TypeScript', 'React', 'FastAPI', 'LangChain', 'AI Agents', 'DummyJSON', 'Node.js', 'AI Routing', 'RBAC Auth'].includes(t.name))
      );
    }
    if (selectedCategory === 'frontend') {
      return projectsData.filter(
        p => p.tags.some(t => ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React', 'Vue 3'].includes(t.name))
      );
    }
    return projectsData;
  }, [selectedCategory]);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto pb-2 md:pb-12">
      {/* ─── Category Filter Pills (Desktop Only) ─── */}
      <div className="hidden md:flex items-center justify-center flex-wrap gap-2 mb-8 md:mb-10 pt-2">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/40 shadow-[0_0_12px_rgba(0,171,240,0.2)]'
                : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* ─── Mobile Horizontal Swipe Phase (< md) ─── */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto snap-x snap-proximity gap-4 pb-5 px-4 -mx-4 no-scrollbar touch-pan-x overscroll-x-contain">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} isMobile={true} />
          ))}
        </div>
        
        {/* Swipe helper & indicator */}
        <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px] pt-1">
          <Sparkles size={11} className="text-[#00abf0]" />
          <span>Swipe horizontally to view projects</span>
        </div>
      </div>

      {/* ─── Desktop 3-Column Card Grid (>= md) ─── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.title} project={project} isMobile={false} />
        ))}
      </div>
    </div>
  );
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function PortfolioLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const location = useLocation();

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const navLinks = useMemo(() => [
    { to: '/',        id: 'home',     label: 'Home'     },
    { to: '/about',   id: 'about',    label: 'About Me' },
    { to: '/skills',  id: 'skills',   label: 'Skills'   },
    { to: '/projects',id: 'projects', label: 'Projects' },
    { to: '/contact', id: 'contact',  label: 'Connect'  },
  ], []);

  // For mobile devices: scrollspy active indicator
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerWidth < 1024) {
            const scrollPosition = window.scrollY + 200;
            const sectionIds = ['home', 'about', 'skills', 'projects', 'contact'];

            for (let i = sectionIds.length - 1; i >= 0; i--) {
              const el = document.getElementById(sectionIds[i]);
              if (el && scrollPosition >= el.offsetTop) {
                setActiveSection((prev) => (prev !== sectionIds[i] ? sectionIds[i] : prev));
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNavClick = (id: string) => {
    closeMobileMenu();
    setActiveSection(id);
    scrollToSection(id);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col relative bg-[#081524] text-white selection:bg-[#00abf0] selection:text-white">
      {/* 3D Atmospheric Background */}
      <NetworkBackground />

      {/* ─── Sticky Navbar ─── */}
      <header className="sticky top-0 z-50 bg-[#081524]/85 backdrop-blur-md border-b border-white/5">
        <nav className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto w-full">
          {/* Logo / Brand */}
          <Link 
            to="/" 
            onClick={() => handleMobileNavClick('home')}
            className="text-2xl font-bold tracking-tight cursor-pointer flex items-center group bg-transparent border-none p-0"
          >
            <span className="text-white group-hover:text-gray-100 transition-colors">Rathishan</span>
            <span className="text-[#00abf0]">.</span>
            <span className="text-gray-300 group-hover:text-white font-medium ml-1.5 transition-colors">M</span>
          </Link>

          {/* Desktop Nav Links (Route-based for Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold tracking-wide">
            {navLinks.map(l => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative py-1 transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-[#00abf0] font-bold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#00abf0] rounded-full shadow-[0_0_8px_rgba(0,171,240,0.8)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden lg:flex items-center space-x-6">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/Resume/Rathishan_Mahendran_CV_FullStack_Intern.pdf" 
              download="Rathishan_Mahendran_CV_FullStack_Intern.pdf" 
              className="border-2 border-[#ff004f] text-[#ff004f] px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:bg-[#ff004f] hover:text-white shadow-[0_0_15px_rgba(255,0,79,0.2)] hover:shadow-[0_0_22px_rgba(255,0,79,0.5)] cursor-pointer"
            >
              Download CV <Download size={16} className="stroke-[2.2]" />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/[0.05] hover:bg-white/[0.1] text-white ${isMobileMenuOpen ? 'ring-2 ring-[#00abf0]/50' : ''}`}
            >
              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                <X size={20} style={{ color: '#00abf0' }} />
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                <Menu size={20} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        onClick={closeMobileMenu}
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-[#081b29]/95 border-l border-white/10 backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button onClick={() => handleMobileNavClick('home')} className="text-lg font-bold flex items-center bg-transparent border-none p-0">
            <span className="text-white">Rathishan</span>
            <span className="text-[#00abf0]">.</span>
            <span className="text-gray-300 ml-1">M</span>
          </button>
          <button
            onClick={closeMobileMenu}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col px-4 pt-4 gap-1 flex-1">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleMobileNavClick(l.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left cursor-pointer ${
                activeSection === l.id
                  ? 'bg-[#00abf0]/10 text-[#00abf0] border-l-2 border-[#00abf0]'
                  : 'text-gray-300 hover:bg-white/[0.05] hover:text-white border-l-2 border-transparent'
              }`}
            >
              <span>{l.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6 pt-4 border-t flex flex-col gap-4 border-white/10">
          <a 
            href="/Resume/Rathishan_Mahendran_CV_FullStack_Intern.pdf" 
            download="Rathishan_Mahendran_CV_FullStack_Intern.pdf" 
            className="w-full border-2 px-5 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white"
          >
            Download CV <Download size={15} />
          </a>
        </div>
      </aside>

      {/* ─── Desktop Content: Dedicated Page Views with Smooth Route Transitions ─── */}
      <div className="hidden lg:flex flex-col flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><div className="py-6"><About /></div></PageTransition>} />
            <Route path="/skills" element={<PageTransition><div className="py-6"><Skills /></div></PageTransition>} />
            <Route path="/projects" element={<PageTransition><div className="py-6"><Projects /></div></PageTransition>} />
            <Route path="/contact" element={<PageTransition><div className="py-6"><Contact /></div></PageTransition>} />
            <Route path="*" element={<PageTransition><Home /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* ─── Mobile Content: Continuous Vertical Scrolling ─── */}
      <main className="lg:hidden flex-1 w-full max-w-7xl mx-auto px-4 relative z-10 space-y-4">
        {/* 1. Hero Section */}
        <section id="home" className="min-h-[calc(100vh-64px)] flex flex-col justify-center pt-2 pb-2 scroll-mt-16">
          <Home />
        </section>

        {/* 2. About Me Section */}
        <section id="about" className="pt-2 pb-2 scroll-mt-16">
          <div className="mb-3">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-1 text-[#00abf0]">02 ABOUT</p>
            <h2 className="text-2xl font-bold text-white">About Me</h2>
          </div>
          <About />
        </section>

        {/* 3. Skills & Technologies Section */}
        <section id="skills" className="pt-2 pb-2 scroll-mt-16">
          <Skills />
        </section>

        {/* 4. Featured Projects Section */}
        <section id="projects" className="pt-2 pb-2 scroll-mt-16">
          <div className="mb-3 md:hidden">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-1 text-[#00abf0]">04 WORK</p>
            <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
          </div>
          <Projects />
        </section>

        {/* 5. Contact Section */}
        <section id="contact" className="pt-2 pb-8 scroll-mt-16">
          <div className="mb-3">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-1 text-[#00abf0]">05 CONNECT</p>
            <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
          </div>
          <Contact />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 border-t border-white/5 bg-[#081b29]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-500">
            &copy; {new Date().getFullYear()} Rathishan Mahendran. Built with React &amp; TypeScript.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link to="/" onClick={() => scrollToSection('home')} className="hover:text-[#00abf0] transition-colors cursor-pointer">Back to Top &uarr;</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <PortfolioLayout />
    </Router>
  );
}
