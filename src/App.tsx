import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Download, Linkedin, Github, ExternalLink, Cpu, Zap, Instagram, Facebook, Menu, X } from 'lucide-react';
import About from './About';
import Contact from './Contact';
import { projectsData, profileData } from './data';
import { deriveTechnicalSkills } from './utils/skillEngine';

const roles = ["AI Engineer", "UI/UX Designer", "Front-End Developer"];

const Typewriter = () => {
  const [displayText, setDisplayText] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = roles[index];
    
    if (isDeleting) {
      timer = setTimeout(() => setDisplayText(currentWord.substring(0, displayText.length - 1)), 40);
    } else {
      timer = setTimeout(() => setDisplayText(currentWord.substring(0, displayText.length + 1)), 80);
    }

    if (!isDeleting && displayText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000); 
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index]);

  return <span className="text-[#00abf0] font-bold">{displayText}</span>;
}

function Home({ isDarkMode }: { isDarkMode: boolean }) {
  // Tech orbs removed from UI per request.


  const orbBase = isDarkMode
    ? 'bg-[#0c1f30] border border-[#00abf0]/20 shadow-[0_0_18px_rgba(0,0,0,0.6)]'
    : 'bg-white border border-slate-200 shadow-xl';

  return (
    <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-2 lg:pt-12 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
      {/* Left: Image with Blob & Orbitals */}
      <div className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-1 mt-4 lg:mt-0">
        {/* Glowing background */}
        <div className={`absolute inset-0 bg-[#00abf0] blur-[100px] rounded-full w-[250px] h-[250px] md:w-[350px] md:h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-15'}`}></div>

        <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] flex flex-col items-center justify-center">

          {/* Circular Icon Orbitals (Removed as requested) */}

           {/* Solid Blob */}
           <div
             className={`absolute inset-0 bg-[#00abf0] transition-shadow duration-500 ${isDarkMode ? 'shadow-[0_0_30px_rgba(0,171,240,0.5)]' : 'shadow-[0_10px_40px_rgba(0,171,240,0.3)]'}`}
             style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
           ></div>

           {/* Outline Blob */}
           <div
             className={`absolute inset-[-15px] md:inset-[-20px] border-2 transition-colors duration-500 ${isDarkMode ? 'border-white opacity-50' : 'border-[#00abf0] opacity-30'}`}
             style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'rotate(-15deg)' }}
           ></div>

           {/* Image */}
           <img
             src={profileData.homeImage}
             alt="Rathishan Mahendran Portrait"
             className="relative z-10 w-full h-full object-cover shadow-2xl"
             style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
           />
        </div>
      </div>

      {/* Right: Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-start text-left order-2 lg:order-2">
        <h2 className={`text-xl md:text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Hello, I'm</h2>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Rathishan M.</h1>
        <h3 className="text-xl md:text-3xl font-semibold mb-6 flex items-center h-10">
          <span className="mr-2">And I'm a</span> <Typewriter /><span className="animate-pulse text-[#00abf0] font-light ml-[1px]">|</span>
        </h3>
        
        <p className={`text-sm md:text-base leading-relaxed mb-8 max-w-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          A passionate Computer Engineering student driven to build intelligent, premium digital experiences through Generative AI, Full-Stack Development, and sophisticated UI/UX design.
        </p>

        {/* Social Icons */}
        <div className="flex items-center space-x-4 mb-8">
          <a
            href="https://github.com/skr2rathishan-oss"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}
          >
            <Github size={18} className="fill-current" />
          </a>
          <a
            href="https://www.linkedin.com/in/rathishan-mahendran-39812b316"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}
          >
            <Linkedin size={18} />
          </a>
          <a
            href="https://www.facebook.com/Rathishan21"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://www.instagram.com/rathishan21/"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}
          >
            <Instagram size={18} />
          </a>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button className={`px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,171,240,0.6)] ${isDarkMode ? 'bg-[#00abf0] text-[#081b29]' : 'bg-[#00abf0] text-white shadow-md'}`}>
            Hire Me
          </button>
          <Link to="/contact" className={`border-2 border-[#00abf0] text-[#00abf0] px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,171,240,0.4)] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}>
            Contact Me
          </Link>
        </div>
      </div>
    </main>
  );
}

function Skills({ isDarkMode }: { isDarkMode: boolean }) {
  // Engine derives skills from real project data — no static numbers
  const skills = useMemo(() => deriveTechnicalSkills(projectsData), []);

  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.08] hover:border-[#00abf0]/30 hover:shadow-[0_0_25px_rgba(0,171,240,0.12)]'
    : 'bg-white border border-slate-100 shadow-md hover:shadow-xl hover:border-[#00abf0]/30';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const tp = isDarkMode ? 'text-white' : 'text-slate-800';

  const getLabel = (p: number) => p >= 88 ? 'Expert' : p >= 78 ? 'Advanced' : p >= 70 ? 'Proficient' : 'Learning';
  const getLabelColor = (p: number) => p >= 88 ? '#00abf0' : p >= 78 ? '#a855f7' : p >= 70 ? '#f59e0b' : '#6b7280';

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-2 lg:pt-8 pb-20">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-2 text-[#00abf0]">Tech Stack</p>
          <h2 className={`text-2xl md:text-3xl font-bold ${tp}`}>Tools I Work With</h2>
        </div>
        {/* Algo badge */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
          isDarkMode ? 'border-[#00abf0]/20 text-[#00abf0] bg-[#00abf0]/5' : 'border-[#00abf0]/30 text-[#00abf0] bg-[#00abf0]/5'
        }`}>
          <Cpu size={12} />
          Scores derived from project analysis
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {skills.map((skill, i) => (
          <div
            key={skill.name}
            className={`group relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-default ${card}`}
          >
            {/* Ambient glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: `inset 0 0 30px ${skill.color}18` }}
            />

            {/* Icon box */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center p-3 mb-4 ${isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-50'}`}
              style={{ boxShadow: `0 0 0 1px ${skill.color}40` }}
            >
              <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
            </div>

            {/* Name + frequency badge */}
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-bold text-sm ${tp}`}>{skill.name}</h3>
              {/* Tooltip-style frequency badge */}
              <span
                title="Calculated from real project usage"
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold cursor-help ${
                  isDarkMode ? 'bg-white/[0.06] text-gray-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {skill.frequency}× used
              </span>
            </div>

            {/* Animated progress bar */}
            <div className={`h-1.5 rounded-full mb-2 overflow-hidden ${ isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 delay-75 ${
                  skill.proficiency >= 88 ? 'animate-pulse' : ''
                }`}
                style={{
                  width: `${skill.proficiency}%`,
                  background: `linear-gradient(to right, ${skill.color}, ${skill.color}bb)`,
                }}
              />
            </div>

            {/* Proficiency % + label */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold" style={{ color: getLabelColor(skill.proficiency) }}>
                {getLabel(skill.proficiency)}
              </span>
              <span className="text-[11px] font-bold" style={{ color: skill.color }}>
                {skill.proficiency}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className={`mt-6 text-[11px] text-center flex items-center justify-center gap-1.5 ${ts}`}>
        <Zap size={11} style={{ color: '#00abf0' }} />
        Proficiency scores are algorithmically derived from project weight, complexity, and tag role — never inflated.
      </p>
    </section>
  );
}

function Projects({ isDarkMode }: { isDarkMode: boolean }) {
  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.07] hover:border-[#00abf0]/30'
    : 'bg-white border border-slate-100 shadow-md hover:shadow-xl hover:border-[#00abf0]/30';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const tp = isDarkMode ? 'text-white' : 'text-slate-800';

  // Tag level → badge style
  const tagStyle = (level: 'core' | 'supporting' | 'exposure', isDark: boolean) => {
    if (level === 'core')       return isDark ? 'bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/20' : 'bg-[#00abf0]/10 text-[#00abf0] border border-[#00abf0]/20';
    if (level === 'supporting') return isDark ? 'bg-white/[0.05] text-gray-300 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200';
    return isDark ? 'bg-white/[0.02] text-gray-500 border border-white/5' : 'bg-slate-50 text-slate-400 border border-slate-150';
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
            <div className={`${i === 0 ? 'w-full lg:w-3/5 h-60 lg:h-auto min-h-[280px]' : 'w-full h-40'} overflow-hidden relative border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'border-white/[0.08]' : 'border-slate-100'}`}>
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
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${tagStyle(tag.level, isDarkMode)}`}
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
                  } ${isDarkMode ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
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
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#081b29] text-white selection:bg-[#00abf0] selection:text-white' : 'bg-[#f8fafc] text-[#0f172a] selection:bg-[#00abf0] selection:text-white'}`}>
      {/* Modern Grid Background */}
      <div className={`modern-grid-bg transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-60'}`}></div>

      {/* ─── Navbar ─── */}
      <nav className={`relative z-20 flex items-center justify-between px-5 lg:px-12 py-3 lg:py-5 max-w-7xl mx-auto w-full border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        {/* Logo — always visible */}
        <Link to="/" className="text-2xl font-bold tracking-tight cursor-pointer">
          <span className="text-[#00abf0]">Portfolio</span>
        </Link>

        {/* Desktop nav links */}
        <div className={`hidden lg:flex items-center space-x-8 text-sm font-semibold tracking-wide transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="hover:text-[#00abf0] transition-colors">{l.label}</Link>
          ))}
        </div>

        {/* Desktop right controls */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Theme Toggle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={toggleTheme}>
            <div className={`w-[46px] h-[24px] rounded-full relative flex items-center px-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#00abf0]/20 border border-[#00abf0]/50' : 'bg-slate-200 border border-slate-300'}`}>
              <div className={`w-[16px] h-[16px] rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-[20px] bg-[#00abf0]' : 'translate-x-0 bg-white shadow-sm'}`} />
            </div>
          </div>
          <button className={`border-2 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${isDarkMode ? 'border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white shadow-[0_0_15px_rgba(255,0,79,0.2)]' : 'border-[#ff004f] text-[#ff004f] hover:bg-[#ff004f] hover:text-white'}`}>
            Download CV <Download size={16} />
          </button>
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden items-center">
          {/* Hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isDarkMode ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            } ${isMobileMenuOpen ? 'ring-2 ring-[#00abf0]/50' : ''}`}
          >
            {/* Animated icon: X when open, Menu when closed */}
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
      />

      {/* Drawer panel — slides in from the right */}
      <aside
        className={`lg:hidden fixed top-0 right-0 z-40 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-[#081b29]/95 border-l border-white/10 backdrop-blur-xl' : 'bg-white/95 border-l border-slate-200 backdrop-blur-xl'}`}
      >
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
          <span className="text-lg font-bold text-[#00abf0]">Navigation</span>
          <button
            onClick={closeMobileMenu}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
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
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

        {/* Drawer footer: Theme Toggle & Download CV */}
        <div className={`px-4 pb-6 pt-4 border-t flex flex-col gap-4 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 cursor-pointer" onClick={toggleTheme}>
             <span className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Dark Mode</span>
             <div className={`w-[46px] h-[24px] rounded-full relative flex items-center px-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#00abf0]/20 border border-[#00abf0]/50' : 'bg-slate-200 border border-slate-300'}`}>
               <div className={`w-[16px] h-[16px] rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-[20px] bg-[#00abf0]' : 'translate-x-0 bg-white shadow-sm'}`} />
             </div>
          </div>
          
          <button className={`w-full border-2 px-5 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            isDarkMode ? 'border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white' : 'border-[#ff004f] text-[#ff004f] hover:bg-[#ff004f] hover:text-white'
          }`}>
            Download CV <Download size={16} />
          </button>
          <p className={`text-[11px] text-center mt-3 ${isDarkMode ? 'text-gray-600' : 'text-slate-400'}`}>
            © {new Date().getFullYear()} Rathishan Mahendran
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <Routes>
        <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
        <Route path="/about" element={<About isDarkMode={isDarkMode} />} />
        <Route path="/skills" element={<Skills isDarkMode={isDarkMode} />} />
        <Route path="/projects" element={<Projects isDarkMode={isDarkMode} />} />
        <Route path="/contact" element={<Contact isDarkMode={isDarkMode} />} />
        <Route path="*" element={<Home isDarkMode={isDarkMode} />} />
      </Routes>

      {/* Footer */}
      <footer className={`relative z-10 w-full py-6 mt-auto border-t transition-colors duration-500 ${isDarkMode ? 'border-white/5 bg-[#081b29]' : 'border-slate-200 bg-[#f8fafc]'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
            &copy; {new Date().getFullYear()} Rathishan Mahendran. Built with React & Vite.
          </p>
          <div className={`flex items-center space-x-4 text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
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
