import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Moon, Sun, Download, Linkedin, Github, ExternalLink } from 'lucide-react';
import About from './About';
import Contact from './Contact';

const skillsData = [
  { name: 'laravel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg', proficiency: 95, color: '#ff2d20' },
  { name: 'framer_motion', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framer/framer-original.svg', proficiency: 90, color: '#0055FF' },
  { name: 'vue', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg', proficiency: 88, color: '#41b883' },
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', proficiency: 85, color: '#61dafb' },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', proficiency: 92, color: '#38bdf8' },
  { name: 'firebase.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg', proficiency: 80, color: '#ffca28' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', proficiency: 75, color: '#3776ab' },
  { name: 'vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg', proficiency: 80, color: '#646cff' },
];

const projectsData = [
  {
    title: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with payment gateway',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Node.js', 'MongoDB'],
    codeLink: '#',
    demoLink: '#'
  },
  {
    title: 'Fitness Tracker App',
    description: 'Mobile fitness app with workout plans',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['React Native', 'Firebase'],
    codeLink: '#',
    demoLink: '#'
  },
  {
    title: 'AI Content Generator',
    description: 'AI-powered content generation tool',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Python', 'OpenAI'],
    codeLink: '#',
    demoLink: '#'
  },
  {
    title: 'Crypto Dashboard',
    description: 'Real-time crypto tracking dashboard',
    image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Vue.js', 'Chart.js'],
    codeLink: '#',
    demoLink: '#'
  },
  {
    title: 'Task Management',
    description: 'Collaborative task management system',
    image: 'https://images.unsplash.com/photo-1507925922893-a4c1d63cb856?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Laravel', 'Vue.js'],
    codeLink: '#',
    demoLink: '#'
  },
  {
    title: 'Real Estate Platform',
    description: 'Virtual tour real estate platform',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Next.js', 'Three.js'],
    codeLink: '#',
    demoLink: '#'
  }
];

const roles = ["Front-End Designer", "AI Engineer", "Full-Stack Developer"];

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
    <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
      {/* Left: Image with Blob & Orbitals */}
      <div className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-1 mt-10 lg:mt-0">
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
             src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
          {[Github, Linkedin].map((Icon, idx) => (
            <a key={idx} href="#" className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}>
              <Icon size={18} className={Icon === Github ? "fill-current" : ""} />
            </a>
          ))}
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
  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.08] hover:border-[#00abf0]/30 hover:shadow-[0_0_25px_rgba(0,171,240,0.12)]'
    : 'bg-white border border-slate-100 shadow-md hover:shadow-xl hover:border-[#00abf0]/30';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-2 text-[#00abf0]">Tech Stack</p>
        <h2 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tools I Work With</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {skillsData.map((skill, i) => (
          <div
            key={i}
            className={`group relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-default ${card}`}
          >
            {/* Glow orb on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: `inset 0 0 30px ${skill.color}18` }}
            />
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center p-3 mb-4 ${isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-50'}`}
              style={{ boxShadow: `0 0 0 1px ${skill.color}40` }}
            >
              <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
            </div>
            <h3 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{skill.name}</h3>
            <div className="flex items-center gap-2">
              <div
                className="h-1 rounded-full flex-1"
                style={{ background: `linear-gradient(to right, ${skill.color}, ${skill.color}40)`, opacity: 0.8 }}
              />
              <span className="text-[11px] font-bold" style={{ color: skill.color }}>{skill.proficiency}%</span>
            </div>
            <p className={`text-[11px] mt-2 ${ts}`}>Expert</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects({ isDarkMode }: { isDarkMode: boolean }) {
  const card = isDarkMode
    ? 'bg-white/[0.03] border border-white/[0.07] hover:border-[#00abf0]/30'
    : 'bg-white border border-slate-100 shadow-md hover:shadow-xl hover:border-[#00abf0]/30';
  const ts = isDarkMode ? 'text-gray-400' : 'text-slate-500';
  const tp = isDarkMode ? 'text-white' : 'text-slate-800';
  const tagBg = isDarkMode ? 'bg-white/[0.05] text-gray-300' : 'bg-slate-100 text-slate-600';

  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-2 text-[#00abf0]">Portfolio</p>
        <h2 className={`text-2xl md:text-3xl font-bold ${tp}`}>Featured Projects</h2>
      </div>

      {/* Asymmetric layout: first two tall, rest small */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...projectsData].reverse().map((project, i) => (
          <div
            key={i}
            className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-400 hover:-translate-y-1.5 ${card} ${
              i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
            }`}
          >
            {/* Image */}
            <div className={`w-full overflow-hidden ${i === 0 ? 'h-56' : 'h-36'}`}>
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className={`font-bold ${i === 0 ? 'text-xl' : 'text-base'} mb-1.5 ${tp}`}>{project.title}</h3>
              <p className={`text-xs leading-relaxed flex-1 mb-4 ${ts}`}>{project.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map((tag, ti) => (
                  <span key={ti} className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${tagBg}`}>{tag}</span>
                ))}
              </div>
              <div className="flex gap-3 mt-auto">
                <a href={project.codeLink}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                    isDarkMode ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}>
                  <Github size={13} /> Code
                </a>
                <a href={project.demoLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-[#00abf0] hover:bg-[#00abf0]/80 text-white transition-colors">
                  <ExternalLink size={13} /> Live Demo
                </a>
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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#081b29] text-white selection:bg-[#00abf0] selection:text-white' : 'bg-[#f8fafc] text-[#0f172a] selection:bg-[#00abf0] selection:text-white'}`}>
      {/* Modern Grid Background */}
      <div className={`modern-grid-bg transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-60'}`}></div>

      {/* Navbar */}
      <nav className={`relative z-20 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto w-full mb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <Link to="/" className="text-2xl font-bold tracking-tight cursor-pointer">
          <span className="text-[#00abf0]">Portfolio</span>
        </Link>
        
        <div className={`hidden lg:flex items-center space-x-8 text-sm font-semibold tracking-wide transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
          <Link to="/" className="hover:text-[#00abf0] transition-colors">Home</Link>
          <Link to="/about" className="hover:text-[#00abf0] transition-colors relative group">
            About Me
          </Link>
          <Link to="/skills" className="hover:text-[#00abf0] transition-colors">Skills</Link>
          <Link to="/projects" className="hover:text-[#00abf0] transition-colors">Projects</Link>
          <Link to="/contact" className="hover:text-[#00abf0] transition-colors">Connect</Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3 cursor-pointer group" onClick={toggleTheme}>
            <div className={`w-[46px] h-[24px] rounded-full relative flex items-center px-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#00abf0]/20 border border-[#00abf0]/50' : 'bg-slate-200 border border-slate-300'}`}>
              <div className={`w-[16px] h-[16px] rounded-full transition-transform duration-300 ease-spring flex items-center justify-center ${isDarkMode ? 'translate-x-[20px] bg-[#00abf0]' : 'translate-x-0 bg-white shadow-sm'}`}>
              </div>
            </div>
          </div>
          
          <button className={`border-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${isDarkMode ? 'border-[#ff004f]/50 text-[#ff004f] hover:bg-[#ff004f] hover:text-white shadow-[0_0_15px_rgba(255,0,79,0.2)] hover:shadow-[0_0_20px_rgba(255,0,79,0.5)]' : 'border-[#ff004f] text-[#ff004f] hover:bg-[#ff004f] hover:text-white'}`}>
            Download CV <Download size={16} />
          </button>
        </div>
      </nav>

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
