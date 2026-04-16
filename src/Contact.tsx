import React, { useState } from 'react';
import { Mail, Linkedin, Github, BookOpen, MapPin, ArrowUpRight, CheckCircle2, XCircle, Send } from 'lucide-react';

interface Props { isDarkMode: boolean; }

const CYAN = '#00abf0';

export default function Contact({ isDarkMode }: Props) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const submitData = new FormData();
    submitData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("subject", formData.subject);
    submitData.append("message", formData.message);

    // Honeypot (anti-spam)
    submitData.append("botcheck", "");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Optionally revert back to idle after a few seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const tp = isDarkMode ? 'text-white' : 'text-slate-800';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const inputBorder = isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800';
  const focusBorder = 'focus:border-[#00abf0] focus:outline-none';
  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-md'
    : 'bg-white border border-slate-100 shadow-md';

  const IeeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M8 11h8M8 15h8M12 7v8" />
    </svg>
  );

  const presence = [
    { label: 'Email', sub: 'rathishan2103@gmail.com', icon: <Mail className="w-5 h-5" />, link: 'mailto:rathishanm@gmail.com', color: '#EA4335' },
    { label: 'LinkedIn', sub: 'rathishan-mahendran', icon: <Linkedin className="w-5 h-5" />, link: 'https://linkedin.com/in/rathishan-mahendran', color: '#0A66C2' },
    { label: 'GitHub', sub: 'skr2rathishan-oss', icon: <Github className="w-5 h-5" />, link: 'https://github.com/skr2rathishan-oss', color: isDarkMode ? '#E6EDF3' : '#24292F' },
    { label: 'IEEE', sub: 'IEEE Student Branch', icon: <IeeeIcon />, link: '#', color: '#00629B' },
    { label: 'University', sub: 'Univ. of Ruhuna', icon: <BookOpen className="w-5 h-5" />, link: '#', color: '#7C3AED' },
    { label: 'Location', sub: 'Sri Lanka · GMT+5:30', icon: <MapPin className="w-5 h-5" />, link: '#', color: '#10B981' },
  ];

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-2 lg:pt-10 pb-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

        {/* ── Left: Form ── */}
        <div className="w-full lg:w-[52%]">
          <div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: CYAN }}>Get in Touch</p>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${tp}`}>
              Let's <span style={{ color: CYAN }}>Connect.</span>
            </h2>
            <p className={`mt-3 text-sm leading-relaxed max-w-md ${ts}`}>
              Open to collaborations, internships, and conversations about AI, design, and engineering.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(['name', 'email'] as const).map(field => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-widest ${ts}`}>{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    placeholder={field === 'name' ? 'Your Name' : 'your@email.com'}
                    className={`bg-transparent border-b px-0 py-2.5 text-sm transition-colors duration-200 placeholder-gray-600 ${inputBorder} ${focusBorder}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-widest ${ts}`}>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
                className={`bg-transparent border-b px-0 py-2.5 text-sm transition-colors duration-200 placeholder-gray-600 ${inputBorder} ${focusBorder}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-widest ${ts}`}>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Tell me what's on your mind..."
                className={`bg-transparent border-b px-0 py-2.5 text-sm transition-colors duration-200 placeholder-gray-600 resize-none ${inputBorder} ${focusBorder}`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`-mt-1 self-start flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 disabled:opacity-50 ${isDarkMode
                  ? 'bg-[#00abf0] text-[#081b29] hover:shadow-[0_0_20px_rgba(0,171,240,0.5)] hover:-translate-y-0.5'
                  : 'bg-[#00abf0] text-white hover:shadow-[0_8px_20px_rgba(0,171,240,0.4)] hover:-translate-y-0.5'
                }`}
            >
              {status === 'loading' ? (
                <><span className="w-4 h-4 border-2 border-t-transparent border-[#081b29] rounded-full animate-spin" /> Sending</>
              ) : (
                <><Send size={15} /> Send Message</>
              )}
            </button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium mt-1">
                <CheckCircle2 size={16} /> Sent successfully! I'll respond soon.
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-1">
                <XCircle size={16} /> Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>

        {/* ── Right: Digital Presence Bento Grid ── */}
        <div className="w-full lg:w-[48%]">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: CYAN }}>Digital Presence</p>

          <div className="grid grid-cols-2 gap-3">
            {presence.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`group relative p-4 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 ${card} hover:border-[${item.color}]/40`}
                style={{ borderColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${item.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {/* Icon badge */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}18`, color: item.color }}>
                  {item.icon}
                </div>

                <div className="flex-1">
                  <p className={`font-bold text-sm ${tp}`}>{item.label}</p>
                  <p className={`text-xs font-mono mt-0.5 truncate ${ts}`}>{item.sub}</p>
                </div>

                <ArrowUpRight
                  size={14}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: item.color }}
                />
              </a>
            ))}
          </div>

          {/* Availability badge */}
          <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 ${card}`}>
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
              <div className="absolute inset-0 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${tp}`}>Available for opportunities</p>
              <p className={`text-xs ${ts}`}>Internships · Freelance · Collaborations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
