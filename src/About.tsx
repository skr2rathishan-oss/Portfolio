import React, { useState } from 'react';
import { User, Target, GraduationCap, Award, Trophy, Users, MapPin, BookOpen, Languages, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { profileData, educationData, certificationsData, achievementsData, communityData } from './data';

interface Props { isDarkMode: boolean; }

const tabs = [
  { id: 'overview', label: 'Overview', icon: <User size={16} /> },
  { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
  { id: 'certifications', label: 'Certifications', icon: <Award size={16} /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
  { id: 'community', label: 'Community', icon: <Users size={16} /> },
];

const CYAN = '#00abf0';

export default function About({ isDarkMode }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const bg = isDarkMode ? 'bg-[#081b29]' : 'bg-[#f8fafc]';
  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.07] backdrop-blur-md'
    : 'bg-white border border-slate-100 shadow-md';
  const tp = isDarkMode ? 'text-white' : 'text-slate-800';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const divider = isDarkMode ? 'border-white/[0.06]' : 'border-slate-100';
  const innerCard = isDarkMode ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100';
  const tabActive = isDarkMode
    ? 'bg-[#00abf0]/10 text-[#00abf0] border-l-2 border-[#00abf0]'
    : 'bg-[#00abf0]/10 text-[#00abf0] border-l-2 border-[#00abf0]';
  const tabIdle = isDarkMode
    ? 'text-gray-400 hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent'
    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-l-2 border-transparent';

  // Reusable badge box
  const Badge = ({ src, alt, emoji }: { src?: string; alt: string; emoji?: string }) => (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>
      {src
        ? <img src={src} alt={alt} className="w-7 h-7 object-contain" />
        : <span className="text-2xl">{emoji}</span>
      }
    </div>
  );

  // Reusable info row
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className={`flex items-center gap-3 py-2.5 border-b ${divider} last:border-0`}>
      <div style={{ color: CYAN }}>{icon}</div>
      <span className={`text-xs w-20 font-semibold uppercase tracking-wide ${ts}`}>{label}</span>
      <span className={`text-sm font-medium ml-auto ${tp}`}>{value}</span>
    </div>
  );

  return (
    <section className={`relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 pt-6 pb-6 flex gap-6`}
      style={{ height: 'calc(100vh - 160px)' }}>

      {/* Subtle glow — unified cyan only */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${CYAN}08 0%, transparent 70%)` }} />

      {/* ── Sidebar ── */}
      <nav className={`w-52 flex-shrink-0 rounded-2xl p-3 flex flex-col gap-1 self-start ${card}`}>
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-3 px-2 ${ts}`}>Sections</p>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? tabActive : tabIdle}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Content Stage ── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex flex-col gap-4 overflow-auto"
            style={{ scrollbarWidth: 'none' }}
          >

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
              <>
                {/* Intro card */}
                <div className={`rounded-2xl p-5 ${card}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        src={profileData.aboutImage}
                        alt="Rathishan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-xl font-bold mb-1 ${tp}`}>Mahendran Rathishan</h2>
                      <p style={{ color: CYAN }} className="text-xs font-semibold uppercase tracking-widest mb-3">
                        Computer Engineering Student · Front End Developer
                      </p>
                      <p className={`text-sm leading-relaxed ${ts}`}>
                        2nd-year B.Sc. Computer Engineering student at the University of Ruhuna, Sri Lanka.
                        Passionate about Generative AI, Full-Stack Development, and Embedded Systems.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['AI Engineering', 'Full-Stack Dev', 'Generative AI', 'IoT', 'Open Source'].map(s => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: `${CYAN}18`, color: CYAN }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Background + Goals side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
                  <div className={`rounded-2xl p-5 ${card}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                      <User size={14} style={{ color: CYAN }} /> Background
                    </h3>
                    <InfoRow icon={<MapPin size={15} />} label="Location" value="Sri Lanka (GMT+5:30)" />
                    <InfoRow icon={<BookOpen size={15} />} label="University" value="Univ. of Ruhuna" />
                    <InfoRow icon={<GraduationCap size={15} />} label="Degree" value="B.Sc. Comp. Eng." />
                    <InfoRow icon={<Languages size={15} />} label="Languages" value="English & Tamil" />
                  </div>
                  <div className={`rounded-2xl p-5 ${card}`}>
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                      <Target size={14} style={{ color: CYAN }} /> Core Goals
                    </h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { n: 'AI/ML Engineer', d: 'LLM agentic systems', e: '🤖' },
                        { n: 'Open Source', e: '🌍' },
                        { n: 'Full-Stack', d: 'End-to-end premium apps', e: '⚡' },
                      ].map((g, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${innerCard}`}>
                          <span className="text-xl">{g.e}</span>
                          <div>
                            <p className={`text-sm font-bold ${tp}`}>{g.n}</p>
                            <p className={`text-xs ${ts}`}>{g.d}</p>
                          </div>
                          <ChevronRight size={14} className="ml-auto" style={{ color: CYAN }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ EDUCATION ══ */}
            {activeTab === 'education' && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl p-5 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                    <GraduationCap size={14} style={{ color: CYAN }} /> Formal Education
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {educationData.map((e, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${innerCard}`}>
                        <div className={`w-18 h-18 rounded-lg flex-shrink-0 overflow-hidden border ${isDarkMode ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                          {e.logo
                            ? <img src={e.logo} alt={e.school} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full flex items-center justify-center text-xl ${isDarkMode ? 'bg-white/[0.05]' : 'bg-slate-100'}`}>🎓</div>
                          }
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm ${tp}`}>{e.degree}</h4>
                          {e.link ? (
                            <a
                              href={e.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs mt-0.5 hover:text-[#00abf0] transition-colors duration-200 underline underline-offset-2 ${ts}`}
                            >{e.school}</a>
                          ) : (
                            <p className={`text-xs ${ts} mt-0.5`}>{e.school}</p>
                          )}
                          <p className={`text-xs ${ts}`}>{e.period}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${e.status === 'In Progress'
                          ? 'bg-[#00abf0]/15 text-[#00abf0]' : 'bg-emerald-500/15 text-emerald-400'}`}>
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Glowing Pathway */}
                <div className={`rounded-2xl p-5 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${tp}`}>Academic Pathway</h3>
                  <div className="relative flex flex-col gap-0 pl-6">
                    {/* Vertical connecting line */}
                    <div
                      className="absolute left-[18px] top-4 bottom-4 w-[2px] rounded-full"
                      style={{ background: `linear-gradient(to bottom, ${CYAN}, ${CYAN}80, ${CYAN}20)` }}
                    />
                    {[
                      { y: '2028', label: 'Expected Graduation', sub: 'B.Sc. Computer Engineering', done: false },
                      { y: '2025', label: 'B.Sc. Computer Engineering', sub: 'Selected Path', done: true },
                      { y: '2024', label: 'B.Sc.Engineering Enrolled', sub: 'University of Ruhuna', done: true },
                      { y: '2023', label: 'A/L Completed', sub: 'Physical Science Stream', done: true },
                      { y: '2020', label: 'A/L Studies Began', sub: "Mu/Puthukkudiyiruppu Central College", done: true, link: 'https://www.facebook.com/share/g/1CBMDWqCH5/' },
                    ].map((step, i, arr) => (
                      <div key={i} className={`relative flex items-start gap-4 ${i < arr.length - 1 ? 'pb-6' : ''}`}>
                        {/* Node */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 -ml-6 z-10 transition-all duration-300 ${step.done
                              ? 'text-white shadow-[0_0_14px_rgba(0,171,240,0.8)]'
                              : isDarkMode
                                ? 'border-2 border-dashed text-gray-600'
                                : 'bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400'
                            }`}
                          style={step.done
                            ? { background: CYAN, border: `2px solid ${CYAN}` }
                            : { borderColor: `${CYAN}40` }}
                        >
                          {step.done ? '✓' : '→'}
                        </div>
                        {/* Text content */}
                        <div className="flex-1 pt-1.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-xs font-extrabold"
                              style={{ color: step.done ? CYAN : `${CYAN}50` }}
                            >{step.y}</span>
                            {!step.done && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border border-dashed ${isDarkMode ? 'text-gray-500 border-gray-700' : 'text-slate-400 border-slate-300'}`}>
                                Upcoming
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-bold ${tp}`}>{step.label}</p>
                          {(step as any).link ? (
                            <a
                              href={(step as any).link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs mt-0.5 hover:text-[#00abf0] transition-colors duration-200 underline underline-offset-2 ${ts}`}
                            >{step.sub}</a>
                          ) : (
                            <p className={`text-xs mt-0.5 ${ts}`}>{step.sub}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ CERTIFICATIONS ══ */}
            {activeTab === 'certifications' && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl p-5 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                    <Award size={14} style={{ color: CYAN }} /> Certifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {certificationsData.map((cert, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl ${innerCard} group hover:border-[#00abf0]/40 transition-colors`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 overflow-hidden"
                          style={{ border: `1px solid ${cert.color}40` }}>
                          <img src={cert.image} alt={cert.name} className="w-6 h-6 object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${tp}`}>{cert.name}</p>
                          <p className={`text-xs ${ts}`}>{cert.issuer} · {cert.year}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CYAN }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ ACHIEVEMENTS ══ */}
            {activeTab === 'achievements' && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl p-5 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                    <Trophy size={14} style={{ color: CYAN }} /> Achievements
                  </h3>
                  <div className="flex flex-col gap-3">
                    {achievementsData.map((a, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${innerCard}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 overflow-hidden"
                          style={{ border: `1px solid ${a.badgeColor}40` }}>
                          <img src={a.image} alt={a.title} className="w-7 h-7 object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${tp}`}>{a.title}</p>
                          <p className={`text-xs ${ts} mt-0.5`}>{a.org} · {a.year}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                          style={{ background: `${a.badgeColor}20`, color: a.badgeColor }}>
                          {a.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { n: '3+', l: 'Awards', e: '🏆' },
                    { n: '10+', l: 'Projects', e: '💻' },
                    { n: '2+', l: 'Years Coding', e: '⚡' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-2xl p-4 flex flex-col items-center text-center ${card}`}>
                      <span className="text-2xl mb-2">{s.e}</span>
                      <span className="text-2xl font-bold" style={{ color: CYAN }}>{s.n}</span>
                      <span className={`text-xs ${ts} mt-1`}>{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ COMMUNITY ══ */}
            {activeTab === 'community' && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl p-5 ${card}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                    <Users size={14} style={{ color: CYAN }} /> Community & Clubs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {communityData.map((c, i) => (
                      <div key={i} className={`flex gap-4 p-4 rounded-xl ${innerCard}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 overflow-hidden"
                          style={{ border: `1px solid ${c.color}40` }}>
                          <img src={c.image} alt={c.name} className="w-7 h-7 object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`font-bold text-sm ${tp}`}>{c.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: `${CYAN}18`, color: CYAN }}>{c.role}</span>
                          </div>
                          <p className={`text-xs ${ts} mb-1`}>{c.org}</p>
                          <p className={`text-xs ${ts} leading-relaxed`}>{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
