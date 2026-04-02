import React, { useState } from 'react';
import { Mail, Linkedin, Github, BookOpen, MapPin, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

function Contact({ isDarkMode }: { isDarkMode: boolean }) {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate async send — replace with real API later
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success'); // or 'error'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const IeeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] stroke-[#00abf0]">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M8 11h8" />
      <path d="M8 15h8" />
      <path d="M12 7v8" />
    </svg>
  );

  const inputClasses = `w-full rounded-xl border px-4 py-3.5 text-sm transition-all duration-200 outline-none ${
    isDarkMode 
      ? 'bg-[#081b29] border-[#00abf0]/20 text-white placeholder-gray-600 focus:border-[#00abf0]/60 focus:shadow-[0_0_0_3px_rgba(0,171,240,0.12)]' 
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00abf0]/60 focus:shadow-[0_0_0_3px_rgba(0,171,240,0.12)]'
  }`;

  const labelClasses = "text-xs font-semibold tracking-widest uppercase text-gray-400 flex items-center gap-2 mb-2";
  const labelDot = <span className="w-1 h-1 rounded-full bg-[#00abf0] inline-block"></span>;

  const cardClasses = `group block rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 relative ${
    isDarkMode
      ? 'bg-[#0a253a] border-[#00abf0]/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,171,240,0.15)] hover:border-[#00abf0]/30'
      : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 hover:border-[#00abf0]/30'
  }`;

  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';

  const contactCards = [
    {
      name: 'Email',
      handle: 'rathishanm@gmail.com',
      icon: <Mail className="size-[18px] stroke-[#00abf0]" />,
      link: 'mailto:rathishanm@gmail.com',
      external: false
    },
    {
      name: 'LinkedIn',
      handle: 'rathishan-mahendran',
      icon: <Linkedin className="size-[18px] stroke-[#00abf0]" />,
      link: 'https://linkedin.com/in/rathishan-mahendran-39812b316',
      external: true
    },
    {
      name: 'GitHub',
      handle: 'skr2rathishan-oss',
      icon: <Github className="size-[18px] stroke-[#00abf0]" />,
      link: 'https://github.com/skr2rathishan-oss',
      external: true
    },
    {
      name: 'IEEE',
      handle: 'IEEE Student Branch',
      icon: <IeeeIcon />,
      link: '#',
      external: true
    },
    {
      name: 'University',
      handle: 'Univ. of Ruhuna',
      icon: <BookOpen className="size-[18px] stroke-[#00abf0]" />,
      link: '#',
      external: true
    },
    {
      name: 'Location',
      handle: 'Sri Lanka • GMT+5:30',
      icon: <MapPin className="size-[18px] stroke-[#00abf0]" />,
      link: '#',
      external: true
    }
  ];

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column - 55% */}
        <div className="w-full lg:w-[55%] animate-slide-left">
          
          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 bg-[#00abf0]/10 border border-[#00abf0]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00abf0] animate-pulse"></span>
            <span className="text-[#00abf0] text-xs font-medium tracking-wide">Available for opportunities</span>
          </div>

          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
            Let's <span className="text-[#00abf0]">Connect</span>
          </h2>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
            Whether it's a project collaboration, internship, GSoC mentorship, or just a conversation about AI — my inbox is always open.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>{labelDot} Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>{labelDot} Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com" 
                  className={inputClasses}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className={labelClasses}>{labelDot} Subject</label>
              <input 
                type="text" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can I help you?" 
                className={inputClasses}
                required
              />
            </div>
            
            <div>
              <label className={labelClasses}>{labelDot} Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..." 
                rows={5}
                className={`${inputClasses} resize-none`}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full h-[52px] bg-[#00abf0] text-[#081b29] font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_24px_rgba(0,171,240,0.4)] hover:-translate-y-[1px] group disabled:opacity-70 disabled:pointer-events-none"
            >
              {status === 'loading' ? (
                <>
                  <span className="animate-spin border-2 border-[#081b29]/30 border-t-[#081b29] rounded-full w-4 h-4"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Status Feedback */}
            <div className={`transition-all duration-300 overflow-hidden ${status === 'success' || status === 'error' ? 'max-h-16 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
              {status === 'success' && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                  <CheckCircle2 size={18} />
                  Message sent! I'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <XCircle size={18} />
                  Something went wrong. Try again.
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - 45% */}
        <div className="w-full lg:w-[45%] animate-slide-right mt-12 lg:mt-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
            Find me on
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactCards.map((card, idx) => (
              <a 
                key={idx}
                href={card.link}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className={cardClasses}
              >
                <div className="bg-[#00abf0]/10 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
                  {card.icon}
                </div>
                <h3 className={`font-semibold text-sm ${textPrimary}`}>
                  {card.name}
                </h3>
                <p className="text-[#00abf0] text-xs mt-0.5 font-mono truncate">
                  {card.handle}
                </p>
                <div className="absolute bottom-5 right-5 text-gray-600 group-hover:text-[#00abf0] transition-colors duration-300">
                  <ArrowRight size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Contact;
