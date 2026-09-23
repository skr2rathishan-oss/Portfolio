import React, { useState, useEffect } from "react";
import { 
  User, Target, GraduationCap, Award, Trophy, Users, MapPin, 
  BookOpen, Languages, ChevronRight, ExternalLink, Calendar, 
  ArrowRight, ShieldCheck, ZoomIn, X 
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "motion/react";
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
  const [previewCert, setPreviewCert] = useState<(typeof certificationsData)[0] | null>(null);

  // Close lightbox modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewCert(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Active tab display
  // Section visibility: continuous one by one on mobile, tab-controlled on desktop (md:)
  const secClass = (id: string) => `flex flex-col gap-4 ${activeTab === id ? "md:flex" : "md:hidden"}`;

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-5">
      {/* Subtle glow — unified cyan only */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${CYAN}08 0%, transparent 70%)` }} 
      />

      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* ── Desktop Sidebar ── */}
        <nav className={`hidden md:flex w-52 flex-shrink-0 rounded-2xl p-3 flex-col gap-1 self-start sticky top-24 z-20 ${card}`}>
          <p className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-3 px-2 ${ts}`}>Sections</p>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-semibold transition-colors duration-200 cursor-pointer overflow-hidden ${
                  isActive ? 'text-[#00abf0] font-bold' : tabIdle
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAboutTab"
                    className="absolute inset-0 bg-[#00abf0]/10 border-l-2 border-[#00abf0] rounded-xl shadow-[inset_0_0_12px_rgba(0,171,240,0.1)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* ── Content Stage ── */}
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
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${innerCard} hover:border-[#00abf0]/40 transition-colors duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(0,171,240,0.1)]`}
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
          <div className="flex flex-col gap-4">
            <div className={`rounded-2xl p-5 md:p-6 ${card}`}>
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className={`text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2 ${tp}`}>
                    <ShieldCheck size={18} style={{ color: CYAN }} /> Verified Certifications &amp; Credentials
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click any certificate preview to inspect in full resolution
                  </p>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00abf0]/10 border border-[#00abf0]/25 text-[#00abf0] font-semibold">
                    <Award size={13} />
                    {certificationsData.length} Credentials
                  </span>
                  <span className="text-[11px] text-gray-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 hidden md:inline-flex items-center gap-1">
                    <span>↕</span> Scroll to browse
                  </span>
                </div>
              </div>

              {/* Scrollable Container on Desktop / Natural Continuous Flow on Mobile */}
              <div 
                className="max-h-none md:max-h-[700px] xl:max-h-[740px] md:overflow-y-auto pr-0 md:pr-2 sm:pr-3 md:overscroll-contain md:custom-cert-scrollbar"
                tabIndex={0}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 pb-2">
                  {certificationsData.map((cert, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      whileHover={{ y: -4, transition: { duration: 0.25 } }}
                      className="group relative rounded-2xl bg-[#061524] border border-white/[0.08] hover:border-[#00abf0]/50 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,171,240,0.16)] overflow-hidden"
                    >
                      {/* Top: Large Certificate Framed Preview */}
                      <div className="relative mb-4">
                        <div 
                          onClick={() => setPreviewCert(cert)}
                          className="relative w-full aspect-[1.4/1] rounded-xl overflow-hidden cursor-pointer p-1.5 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,171,240,0.25)]"
                          style={{ 
                            border: `2px solid ${cert.color}75`,
                            background: `radial-gradient(ellipse at center, ${cert.color}15 0%, rgba(6,21,36,0.9) 100%)`,
                          }}
                        >
                          <img 
                            src={cert.image} 
                            alt={cert.name} 
                            className="w-full h-full object-contain rounded-lg bg-white/95 transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />

                          {/* Hover Overlay with Zoom Prompt */}
                          <div className="absolute inset-0 bg-[#081b29]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#00abf0] text-[#081b29] shadow-[0_0_20px_rgba(0,171,240,0.5)] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                              <ZoomIn size={14} />
                              Click to View Full Size
                            </span>
                          </div>
                        </div>

                        {/* Top-Right Corner Date Badge */}
                        <div className="absolute top-3 right-3 pointer-events-none">
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-white bg-black/70 backdrop-blur-md border border-white/20 shadow-md">
                            <Calendar size={11} className="text-[#00abf0]" />
                            {cert.year}
                          </span>
                        </div>
                      </div>

                      {/* Content: Title, Issuer, Description, Skills */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h4 
                            onClick={() => setPreviewCert(cert)}
                            className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-[#00abf0] transition-colors cursor-pointer mb-1 line-clamp-1"
                          >
                            {cert.name}
                          </h4>

                          {/* Issuer */}
                          <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00abf0]" />
                            {cert.issuer}
                          </p>

                          {/* Description */}
                          {cert.description && (
                            <p className="text-xs text-gray-400 leading-relaxed mb-3.5 line-clamp-2">
                              {cert.description}
                            </p>
                          )}

                          {/* Skill Badges */}
                          {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {cert.skillsLearned.map((skill, si) => (
                                <span 
                                  key={si} 
                                  className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30 hover:bg-[#00abf0]/25 transition-colors cursor-default"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2.5 mt-auto">
                          <button
                            onClick={() => setPreviewCert(cert)}
                            type="button"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                          >
                            <ZoomIn size={13} />
                            <span>Inspect</span>
                          </button>

                          {cert.credentialLink ? (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={cert.credentialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#00abf0]/15 border border-[#00abf0]/50 text-[#00abf0] hover:bg-[#00abf0] hover:text-[#081b29] transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(0,171,240,0.15)] hover:shadow-[0_0_18px_rgba(0,171,240,0.4)]"
                            >
                              <span>Verify Credential</span>
                              <ExternalLink size={13} />
                            </motion.a>
                          ) : (
                            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium text-gray-500 bg-white/[0.02] border border-white/5 cursor-default">
                              <ExternalLink size={13} />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ 4. ACHIEVEMENTS ══ */}
        <div className={secClass("achievements")}>
          <div className="flex flex-col gap-4">
            <div className={`rounded-2xl p-5 md:p-6 ${card}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${tp}`}>
                  <Trophy size={15} style={{ color: CYAN }} /> Honors &amp; Competitions
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  <span className="text-[#00abf0] font-bold">{achievementsData.length}</span> Highlights
                </span>
              </div>

              {/* Wide Cards matching reference layout */}
              <div className="flex flex-col gap-4">
                {achievementsData.map((a, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    className="group relative rounded-2xl bg-[#061524] border border-white/[0.08] hover:border-[#00abf0]/40 p-4 sm:p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,171,240,0.15)]"
                  >
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      {/* Left: Square Thumbnail Frame */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-[#00abf0]/40 p-1 bg-black/40 shadow-[0_0_15px_rgba(0,171,240,0.15)] transition-transform duration-300 group-hover:scale-105">
                        <img 
                          src={a.image} 
                          alt={a.title} 
                          className="w-full h-full object-cover rounded-xl"
                          loading="lazy"
                        />
                      </div>

                      {/* Right: Title, Badge, Org, Description, Tags */}
                      <div className="flex-1 min-w-0">
                        {/* Header: Title + Competition Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-[#00abf0] transition-colors">
                            {a.title}
                          </h4>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30 shadow-[0_0_10px_rgba(0,171,240,0.15)]">
                            <Trophy size={13} className="text-[#00abf0]" />
                            {a.badge}
                          </span>
                        </div>

                        {/* Org and Year */}
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400 mb-2.5">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#00abf0]" />
                            {a.org}
                          </span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#00abf0]" />
                            {a.year}
                          </span>
                        </div>

                        {/* Description */}
                        {a.description && (
                          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3.5">
                            {a.description}
                          </p>
                        )}

                        {/* Skills Gained Tags */}
                        {a.skillsGained && a.skillsGained.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {a.skillsGained.map((s, si) => (
                              <span 
                                key={si} 
                                className="text-xs px-3 py-1 rounded-full font-medium bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30 hover:bg-[#00abf0]/25 transition-colors cursor-default"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Full-Width Button */}
                    {a.link && (
                      <motion.a 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        href={a.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group/btn w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-[#00abf0]/40 text-white hover:bg-[#00abf0]/10 hover:border-[#00abf0] hover:text-[#00abf0] transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(0,171,240,0.15)]"
                      >
                        <ExternalLink size={14} className="transition-transform group-hover/btn:scale-110" />
                        <span>{a.link.includes('linkedin.com') ? 'View on LinkedIn' : a.link.includes('github.com') ? 'View on GitHub' : 'View Credential'}</span>
                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
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
                  whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
                  className={`rounded-2xl p-4 flex flex-col items-center text-center ${card} hover:border-[#00abf0]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,171,240,0.1)] cursor-default`}
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
                  whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                  className={`flex gap-4 p-4 rounded-xl ${innerCard} hover:border-[#00abf0]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,171,240,0.1)]`}
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
                        whileHover={{ x: 3 }}
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

      {/* ── Certificate Preview Lightbox Modal ── */}
      <AnimatePresence>
        {previewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#071728] border border-[#00abf0]/40 rounded-2xl shadow-[0_0_50px_rgba(0,171,240,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-black/40">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <ShieldCheck size={22} className="text-[#00abf0] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">{previewCert.name}</h3>
                    <p className="text-xs text-gray-400">{previewCert.issuer} • {previewCert.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Image Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-[#020b14]/70">
                <img
                  src={previewCert.image}
                  alt={previewCert.name}
                  className="w-full max-h-[64vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.08] bg-black/35">
                <div className="flex flex-wrap gap-1.5">
                  {previewCert.skillsLearned?.map((skill, si) => (
                    <span
                      key={si}
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[#00abf0]/15 text-[#00abf0] border border-[#00abf0]/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {previewCert.credentialLink ? (
                  <a
                    href={previewCert.credentialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00abf0] hover:bg-[#00abf0]/90 text-[#081b29] transition-all shadow-[0_0_15px_rgba(0,171,240,0.3)]"
                  >
                    <span>Verify Official Credential</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Official certificate issued by {previewCert.issuer}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
