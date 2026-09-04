import React, { useState } from "react";
import { User, Target, GraduationCap, Award, Trophy, Users, MapPin, BookOpen, Languages, ChevronRight, ExternalLink } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { profileData, educationData, certificationsData, achievementsData, communityData } from "./data";

const tabs = [
  { id: "overview", label: "Overview", icon: <User size={16} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={16} /> },
  { id: "certifications", label: "Certifications", icon: <Award size={16} /> },
  { id: "achievements", label: "Achievements", icon: <Trophy size={16} /> },
  { id: "community", label: "Community", icon: <Users size={16} /> },
];

const CYAN = "#00abf0";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function About() {
  const [activeTab, setActiveTab] = useState("overview");

  const card = "bg-white/[0.03] border border-white/[0.07] backdrop-blur-md";
  const tp = "text-white";
  const ts = "text-gray-400";
  const divider = "border-white/[0.06]";
  const innerCard = "bg-white/[0.03] border border-white/[0.06]";
  const tabActive = "bg-[#00abf0]/10 text-[#00abf0] border-l-2 border-[#00abf0]";
  const tabIdle = "text-gray-400 hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent";

  // Reusable info row
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className={`flex items-center gap-3 py-2.5 border-b ${divider} last:border-0`}>
      <div style={{ color: CYAN }}>{icon}</div>
      <span className={`text-xs w-20 font-semibold uppercase tracking-wide ${ts}`}>{label}</span>
      <span className={`text-sm font-medium ml-auto ${tp}`}>{value}</span>
    </div>
  );

  // On desktop: show only the active tab. On mobile: show all sections continuously!
  const secClass = (id: string) => `flex flex-col gap-4 ${activeTab === id ? "md:flex" : "md:hidden"}`;

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Subtle glow — unified cyan only */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${CYAN}08 0%, transparent 70%)` }} 
      />

      {/* ── Desktop Sidebar ── */}
      <nav className={`hidden md:flex w-52 flex-shrink-0 rounded-2xl p-3 flex-col gap-1 self-start ${card}`}>
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-3 px-2 ${ts}`}>Sections</p>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive ? tabActive : tabIdle}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          );
        })}
      </nav>

      {/* ── Content Stage (Continuous on Mobile, Tab-Switched on Desktop) ── */}
      <div className="flex-1 relative w-full flex flex-col gap-6 md:gap-4 pb-2">

        {/* ══ 1. OVERVIEW ══ */}
        <div className={secClass("overview")}>
          <div className="flex flex-col gap-4">
            {/* Intro card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-5 ${card}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border border-[#00abf0]/30 shadow-[0_0_15px_rgba(0,171,240,0.15)]">
                  <img
                    src={profileData.aboutImage}
                    alt="Rathishan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-bold mb-1 ${tp}`}>Mahendran Rathishan</h2>
                  <p style={{ color: CYAN }} className="text-xs font-semibold uppercase tracking-widest mb-3">
                    Computer Engineering Student &middot; Front End Developer
                  </p>
                  <p className={`text-sm leading-relaxed ${ts}`}>
                    3rd-year B.Sc. Computer Engineering student at the University of Ruhuna, Sri Lanka.
                    Passionate about Generative AI, Full-Stack Development, and Embedded Systems.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {["AI Engineering", "Full-Stack Dev", "Generative AI", "IoT", "Open Source"].map(s => (
                  <motion.span 
                    key={s} 
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="text-xs px-3 py-1 rounded-full font-medium cursor-default"
                    style={{ background: `${CYAN}18`, color: CYAN }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Background + Goals side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-5 ${card}`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                  <User size={14} style={{ color: CYAN }} /> Background
                </h3>
                <InfoRow icon={<MapPin size={15} />} label="Location" value="Sri Lanka (GMT+5:30)" />
                <InfoRow icon={<BookOpen size={15} />} label="University" value="Univ. of Ruhuna" />
                <InfoRow icon={<GraduationCap size={15} />} label="Degree" value="B.Sc. Comp. Eng." />
                <InfoRow icon={<Languages size={15} />} label="Languages" value="English & Tamil" />
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-5 ${card}`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                  <Target size={14} style={{ color: CYAN }} /> Core Goals
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { n: "AI/ML Engineer", d: "LLM agentic systems", e: "🤖" },
                    { n: "Open Source", d: "Community tools & contributions", e: "🌍" },
                    { n: "Full-Stack", d: "End-to-end premium apps", e: "⚡" },
                  ].map((g, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${innerCard} transition-colors`}
                    >
                      <span className="text-xl">{g.e}</span>
                      <div>
                        <p className={`text-sm font-bold ${tp}`}>{g.n}</p>
                        <p className={`text-xs ${ts}`}>{g.d}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto" style={{ color: CYAN }} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ══ 2. EDUCATION ══ */}
        <div className={secClass("education")}>
          <div className="flex flex-col gap-4">
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                <GraduationCap size={14} style={{ color: CYAN }} /> Formal Education
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {educationData.map((e, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${innerCard}`}
                  >
                    <div className={`w-18 h-18 rounded-lg flex-shrink-0 overflow-hidden border border-white/[0.08]`}>
                      {e.logo
                        ? <img src={e.logo} alt={e.school} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full flex items-center justify-center text-xl bg-white/[0.05]`}>🎓</div>
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
                      <p className={`text-xs ${ts} mt-0.5`}>{e.period}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${e.status === "In Progress"
                      ? "bg-[#00abf0]/15 text-[#00abf0]" : "bg-emerald-500/15 text-emerald-400"}`}>
                      {e.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Vertical Glowing Pathway */}
            <motion.div variants={itemVariants} className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${tp}`}>Academic Pathway</h3>
              <div className="relative flex flex-col gap-0 pl-6">
                {/* Vertical connecting line */}
                <div
                  className="absolute left-[18px] top-4 bottom-4 w-[2px] rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${CYAN}, ${CYAN}80, ${CYAN}20)` }}
                />
                {[
                  { y: "2028", label: "Expected Graduation", sub: "B.Sc. Computer Engineering", done: false },
                  { y: "2025", label: "B.Sc. Computer Engineering", sub: "Selected Path", done: true },
                  { y: "2024", label: "B.Sc.Engineering Enrolled", sub: "University of Ruhuna", done: true },
                  { y: "2023", label: "A/L Completed", sub: "Physical Science Stream", done: true },
                  { y: "2020", label: "A/L Studies Began", sub: "Mu/Puthukkudiyiruppu Central College", done: true, link: "https://www.facebook.com/share/g/1CBMDWqCH5/" },
                ].map((step, i, arr) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className={`relative flex items-start gap-4 ${i < arr.length - 1 ? "pb-6" : ""}`}
                  >
                    {/* Node */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 -ml-6 z-10 transition-all duration-300 ${step.done
                          ? "text-white shadow-[0_0_14px_rgba(0,171,240,0.8)]"
                          : "border-2 border-dashed text-gray-600"
                        }`}
                      style={step.done
                        ? { background: CYAN, border: `2px solid ${CYAN}` }
                        : { borderColor: `${CYAN}40` }}
                    >
                      {step.done ? "✓" : "→"}
                    </div>
                    {/* Text content */}
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-xs font-extrabold"
                          style={{ color: step.done ? CYAN : `${CYAN}50` }}
                        >{step.y}</span>
                        {!step.done && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border border-dashed text-gray-500 border-gray-700`}>
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══ 3. CERTIFICATIONS ══ */}
        <div className={secClass("certifications")}>
          <div className={`rounded-2xl p-5 ${card}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
              <Award size={14} style={{ color: CYAN }} /> Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certificationsData.map((cert, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`flex flex-col gap-2.5 p-3.5 rounded-xl ${innerCard} group hover:border-[#00abf0]/40 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ border: `1px solid ${cert.color}40`, background: `${cert.color}10` }}>
                      <img src={cert.image} alt={cert.name} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${tp}`}>{cert.name}</p>
                      <p className={`text-xs ${ts}`}>{cert.issuer} &middot; {cert.year}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cert.color }} />
                  </div>
                  {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skillsLearned.map((skill, si) => (
                        <span key={si} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${cert.color}15`, color: cert.color, border: `1px solid ${cert.color}25` }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {cert.credentialLink ? (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={cert.credentialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer"
                      style={{ background: `${cert.color}18`, color: cert.color, border: `1px solid ${cert.color}30` }}
                    >
                      <ExternalLink size={11} /> View Credential
                    </motion.a>
                  ) : (
                    <div
                      className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold opacity-40 cursor-default bg-white/[0.03] text-gray-500`}
                    >
                      <ExternalLink size={11} /> Credential Coming Soon
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 4. ACHIEVEMENTS ══ */}
        <div className={secClass("achievements")}>
          <div className="flex flex-col gap-4">
            <div className={`rounded-2xl p-5 ${card}`}>
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
                <Trophy size={14} style={{ color: CYAN }} /> Achievements
              </h3>
              <div className="flex flex-col gap-3">
                {achievementsData.map((a, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className={`flex flex-col gap-2.5 p-4 rounded-xl ${innerCard}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ border: `1px solid ${a.badgeColor}40`, background: `${a.badgeColor}0D` }}>
                        <img src={a.image} alt={a.title} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${tp}`}>{a.title}</p>
                        <p className={`text-xs ${ts} mt-0.5`}>{a.org} &middot; {a.year}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                        style={{ background: `${a.badgeColor}20`, color: a.badgeColor }}>
                        {a.badge}
                      </span>
                    </div>
                    {a.skillsGained && a.skillsGained.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {a.skillsGained.map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${a.badgeColor}15`, color: a.badgeColor, border: `1px solid ${a.badgeColor}25` }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {a.link && (
                      <motion.a 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={a.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-90 cursor-pointer"
                        style={{ background: `${a.badgeColor}15`, color: a.badgeColor, border: `1px solid ${a.badgeColor}30` }}
                      >
                        <ExternalLink size={11} /> View on LinkedIn
                      </motion.a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: "3+", l: "Awards", e: "🏆" },
                { n: "10+", l: "Projects", e: "💻" },
                { n: "2+", l: "Years Coding", e: "⚡" },
              ].map((s, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`rounded-2xl p-4 flex flex-col items-center text-center ${card}`}
                >
                  <span className="text-2xl mb-2">{s.e}</span>
                  <span className="text-2xl font-bold" style={{ color: CYAN }}>{s.n}</span>
                  <span className={`text-xs ${ts} mt-1`}>{s.l}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 5. COMMUNITY ══ */}
        <div className={secClass("community")}>
          <div className={`rounded-2xl p-5 ${card}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${tp}`}>
              <Users size={14} style={{ color: CYAN }} /> Community &amp; Clubs
            </h3>
            <div className="flex flex-col gap-3">
              {communityData.map((c, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`flex gap-4 p-4 rounded-xl ${innerCard}`}
                >
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
                    {c.link && (
                      <motion.a 
                        whileHover={{ x: 2 }}
                        href={c.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:underline underline-offset-2 transition-colors`} 
                        style={{ color: c.color }}
                      >
                        <ExternalLink size={10} /> Visit Link
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
