import React from 'react';
import { 
  User, Target, GraduationCap, Award, Trophy, Users, 
  BrainCircuit, Eye, Code, Activity, Github, Cpu, 
  Calendar, MapPin, BookOpen, Languages, Briefcase,
  Rocket
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

function About({ isDarkMode }: { isDarkMode: boolean }) {
  const { scrollY } = useScroll();
  
  // Scroll zoom hero effects
  const headerY = useTransform(scrollY, [0, 300], [0, 80]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const headerScale = useTransform(scrollY, [0, 300], [1, 1.15]);
  const imageScale = useTransform(scrollY, [0, 400], [1, 1.3]);

  const cardBaseClass = `rounded-2xl p-6 transition-all duration-500 ${
    isDarkMode 
      ? 'bg-[#0a253a] border border-[#00abf0]/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
      : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50'
  }`;

  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const borderDivider = isDarkMode ? 'border-[#00abf0]/10' : 'border-slate-100';
  const innerCardBg = isDarkMode ? 'bg-[#081b29]' : 'bg-slate-50';

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
      
      {/* 1. PAGE HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ y: headerY, opacity: headerOpacity, scale: headerScale }}
        className="text-center mb-16 origin-top"
      >
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
          About <span className="text-[#00abf0]">Me</span>
        </h2>
        <p className={`text-sm md:text-base transition-colors duration-500 ${textSecondary}`}>
          A passionate Computer Engineering student building the future with AI and code.
        </p>
        <div className="w-[60px] h-[2px] bg-[#00abf0] mx-auto mt-3"></div>
      </motion.div>

      {/* 2. INTRODUCTION CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`${cardBaseClass} mb-8`}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#00abf0]/40 shadow-[0_0_20px_rgba(0,171,240,0.2)]">
              <motion.img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Professional Portrait" 
                className="w-full h-full object-cover origin-center"
                referrerPolicy="no-referrer"
                style={{ scale: imageScale }}
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-4 border-l-4 border-[#00abf0] pl-3 ${textPrimary}`}>
              Introduction
            </h3>
            <p className={`font-medium text-base mb-3 ${textPrimary}`}>
              I'm Mahendran Rathishan, a 2nd-year Computer Engineering student at the University of Ruhuna, Sri Lanka, deeply passionate about AI engineering, full-stack development, and electronics.
            </p>
            <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>
              I build intelligent systems, web applications, and explore signal processing. Active in the IEEE Student Branch and the Innovation Club (AI & Data Science section) at my university. I submitted a GSoC 2026 proposal to Oppia Foundation for an AI-Powered Personalized Learning Assistant.
            </p>
            <div className="flex flex-wrap gap-2">
              {['AI Engineering', 'Full-Stack Dev', 'Electronics'].map(skill => (
                <span key={skill} className="bg-[#00abf0]/15 border border-[#00abf0]/30 text-[#00abf0] text-xs px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. TWO-COLUMN GRID: Background + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Background Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <User size={20} className="text-[#00abf0]" /> Background
          </h3>
          <div className="flex flex-col">
            {[
              { icon: <User size={16} />, label: 'Name', value: 'Rathishan M.' },
              { icon: <Calendar size={16} />, label: 'Birthday', value: 'Oct 02' },
              { icon: <MapPin size={16} />, label: 'Location', value: 'Sri Lanka (GMT+5:30)' },
              { icon: <BookOpen size={16} />, label: 'University', value: 'Univ. of Ruhuna' },
              { icon: <GraduationCap size={16} />, label: 'Degree', value: 'B.Sc. Comp. Engineering' },
              { icon: <Languages size={16} />, label: 'Languages', value: 'English & Sinhala' },
              { icon: <Briefcase size={16} />, label: 'Status', value: 'Open to Opportunities' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 border-b ${borderDivider} last:border-0`}>
                <div className="text-[#00abf0]">{item.icon}</div>
                <span className={`text-xs w-28 ${textSecondary}`}>{item.label}</span>
                <span className={`text-sm font-medium ${textPrimary}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goals Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <Target size={20} className="text-[#00abf0]" /> Goals
          </h3>
          <div className="flex flex-col gap-4">
            {[
              { title: 'AI/ML Engineer', desc: 'Specialize in generative AI and LLM applications' },
              { title: 'Open Source Contributor', desc: 'Contribute to GSoC 2026 — Oppia AI Learning Assistant' },
              { title: 'Full-Stack AI Apps', desc: 'Build production-ready intelligent web applications' },
            ].map((goal, i) => (
              <div key={i} className="flex gap-3 mb-4 last:mb-0">
                <div className="w-7 h-7 rounded-full bg-[#00abf0]/20 border border-[#00abf0]/40 text-[#00abf0] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${textPrimary}`}>{goal.title}</h4>
                  <p className={`text-xs mt-0.5 ${textSecondary}`}>{goal.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* 4. INTERESTS SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Interests</h3>
          <p className={`text-sm ${textSecondary}`}>What drives my curiosity and passion</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: <BrainCircuit size={24} />, label: 'Generative AI' },
            { icon: <Eye size={24} />, label: 'Computer Vision' },
            { icon: <Code size={24} />, label: 'Full-Stack Dev' },
            { icon: <Activity size={24} />, label: 'Signal Processing' },
            { icon: <Github size={24} />, label: 'Open Source' },
            { icon: <Cpu size={24} />, label: 'IoT & Electronics' },
          ].map((interest, i) => (
            <div key={i} className={`p-4 rounded-xl flex flex-col items-center gap-2 text-center cursor-default transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#0a253a] border border-[#00abf0]/10' 
                : 'bg-white border border-slate-100 shadow-sm'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#00abf0]/10 flex items-center justify-center text-[#00abf0]">
                {interest.icon}
              </div>
              <span className={`text-xs font-medium ${textPrimary}`}>{interest.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5. ROW-WISE LAYOUT: Education + Certifications */}
      <div className="flex flex-col gap-8 mb-8">
        
        {/* Education Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <GraduationCap size={20} className="text-[#00abf0]" /> Education
          </h3>
          <div className="flex flex-col gap-6">
            {[
              { 
                period: '2023 – 2027', 
                duration: '4 years',
                degree: 'B.Sc. Computer Engineering', 
                school: 'University of Ruhuna', 
                location: 'Sri Lanka',
                note: 'Active in IEEE Student Branch & Innovation Club',
                logo: 'https://cdn-icons-png.flaticon.com/512/1903/1903162.png'
              },
              { 
                period: '2020 – 2022', 
                duration: '2 years',
                degree: 'A/L Physical Science', 
                school: "St. Sebastian's College, Moratuwa", 
                location: 'Sri Lanka',
                logo: 'https://cdn-icons-png.flaticon.com/512/167/167707.png'
              },
            ].map((edu, i) => (
              <div key={i} className={`flex flex-col sm:flex-row gap-6 p-6 rounded-xl ${innerCardBg} border ${borderDivider}`}>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg p-3 flex items-center justify-center border border-slate-200 shadow-sm">
                    <img src={edu.logo} alt={edu.school} className="max-w-full max-h-full object-contain opacity-90" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${textPrimary}`}>{edu.degree}</h4>
                  <p className={`text-base ${textPrimary}`}>{edu.school}</p>
                  <p className={`text-sm mt-1 ${textSecondary}`}>{edu.period} · {edu.duration}</p>
                  <p className={`text-sm ${textSecondary}`}>{edu.location}</p>
                  
                  {edu.note && (
                    <>
                      <div className={`w-full h-px my-3 ${borderDivider}`}></div>
                      <p className={`text-sm ${textSecondary}`}>{edu.note}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Certifications Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <Award size={20} className="text-[#00abf0]" /> Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { badge: 'Docker', name: 'Docker Fundamentals', issuer: 'Docker Inc.', logo: 'https://cdn-icons-png.flaticon.com/512/919/919853.png' },
              { badge: 'AI', name: 'Generative AI', issuer: 'Online Certification', logo: 'https://cdn-icons-png.flaticon.com/512/1693/1693746.png' },
              { badge: 'ML', name: 'AI/ML Engineering Stage 1', issuer: 'Online Certification', logo: 'https://cdn-icons-png.flaticon.com/512/8637/8637299.png' },
              { badge: 'Python', name: 'Python Programming', issuer: 'University of Moratuwa', logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968350.png' },
              { badge: 'Web', name: 'Web Design', issuer: 'University of Moratuwa', logo: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png' },
            ].map((cert, i) => (
              <div key={i} className={`flex flex-col xl:flex-row gap-5 p-5 rounded-xl ${innerCardBg} border ${borderDivider}`}>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-lg p-2.5 flex items-center justify-center border border-slate-200 shadow-sm">
                    <img src={cert.logo} alt={cert.name} className="max-w-full max-h-full object-contain opacity-90" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className={`text-base font-bold ${textPrimary}`}>{cert.name}</h4>
                  <p className={`text-sm ${textPrimary}`}>{cert.issuer}</p>
                  <div className="mt-2.5">
                    <span className="bg-[#00abf0]/15 text-[#00abf0] text-[11px] px-2.5 py-1 rounded-full font-mono inline-block">{cert.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* 6. ROW-WISE LAYOUT: Achievements + Community */}
      <div className="flex flex-col gap-8">
        
        {/* Achievements Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <Trophy size={20} className="text-[#00abf0]" /> Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { badge: 'Competition', name: 'Top 10 — CodeBlast', issuer: 'University of Ruhuna & Mobitel', logo: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png' },
              { badge: 'Open Source', name: 'GSoC 2026 Proposal', issuer: 'Oppia Foundation', logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
              { badge: 'Membership', name: 'IEEE Student Branch', issuer: 'University of Ruhuna', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/512px-IEEE_logo.svg.png' },
            ].map((achieve, i) => (
              <div key={i} className={`flex flex-col xl:flex-row gap-5 p-5 rounded-xl ${innerCardBg} border ${borderDivider}`}>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-lg p-2.5 flex items-center justify-center border border-slate-200 shadow-sm">
                    <img src={achieve.logo} alt={achieve.name} className="max-w-full max-h-full object-contain opacity-90" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className={`text-base font-bold ${textPrimary}`}>{achieve.name}</h4>
                  <p className={`text-sm ${textPrimary}`}>{achieve.issuer}</p>
                  <div className="mt-2.5">
                    <span className="bg-[#00abf0]/15 text-[#00abf0] text-[11px] px-2.5 py-1 rounded-full font-mono inline-block">{achieve.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Community Engagement Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${cardBaseClass}`}
        >
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textPrimary}`}>
            <Users size={20} className="text-[#00abf0]" /> Community Engagement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { badge: 'AI & Data', name: 'Innovation Club', issuer: 'University of Ruhuna', logo: 'https://cdn-icons-png.flaticon.com/512/1162/1162844.png' },
              { badge: 'Workshops', name: 'IEEE Student Branch', issuer: 'Technical Seminars', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/512px-IEEE_logo.svg.png' },
              { badge: 'GitHub', name: 'Open Source Contributor', issuer: 'skr2rathishan-oss', logo: 'https://cdn-icons-png.flaticon.com/512/733/733553.png' },
            ].map((comm, i) => (
              <div key={i} className={`flex flex-col xl:flex-row gap-5 p-5 rounded-xl ${innerCardBg} border ${borderDivider}`}>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-lg p-2.5 flex items-center justify-center border border-slate-200 shadow-sm">
                    <img src={comm.logo} alt={comm.name} className="max-w-full max-h-full object-contain opacity-90" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className={`text-base font-bold ${textPrimary}`}>{comm.name}</h4>
                  <p className={`text-sm ${textPrimary}`}>{comm.issuer}</p>
                  <div className="mt-2.5">
                    <span className="bg-[#00abf0]/15 text-[#00abf0] text-[11px] px-2.5 py-1 rounded-full font-mono inline-block">{comm.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </section>
  );
}

export default About;

