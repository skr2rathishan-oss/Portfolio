import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Download, Facebook, Twitter, Instagram, Linkedin, Github, ExternalLink } from 'lucide-react';

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

function Home({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
      {/* Left: Image with Blob */}
      <div className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-1 mt-10 lg:mt-0">
        {/* Glowing background */}
        <div className={`absolute inset-0 bg-[#00abf0] blur-[100px] rounded-full w-[250px] h-[250px] md:w-[350px] md:h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-15'}`}></div>
        
        <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] flex items-center justify-center">
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
             src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
             alt="Chandni Chauhan" 
             className="relative z-10 w-full h-full object-cover"
             style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
           />
        </div>
      </div>

      {/* Right: Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-start text-left order-2 lg:order-2">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Hello, I'm</h2>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Chandni Chauhan</h1>
        <h3 className="text-xl md:text-3xl font-semibold mb-6">
          And I'm a <span className="text-[#00abf0]">Frontend Developer</span><span className="animate-pulse text-[#00abf0]">|</span>
        </h3>
        
        <p className={`text-sm md:text-base leading-relaxed mb-8 max-w-lg transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eveniet iusto tempore possimus voluptates quis necessitatibus, cupiditate explicabo ad a perferendis!
        </p>

        {/* Social Icons */}
        <div className="flex items-center space-x-4 mb-8">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
            <a key={idx} href="#" className={`w-10 h-10 rounded-full border-2 border-[#00abf0] text-[#00abf0] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_#00abf0] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}>
              <Icon size={18} className={Icon !== Instagram ? "fill-current" : ""} />
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button className={`px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,171,240,0.6)] ${isDarkMode ? 'bg-[#00abf0] text-[#081b29]' : 'bg-[#00abf0] text-white shadow-md'}`}>
            Hire Me
          </button>
          <button className={`border-2 border-[#00abf0] text-[#00abf0] px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,171,240,0.4)] ${isDarkMode ? 'hover:bg-[#00abf0] hover:text-[#081b29]' : 'hover:bg-[#00abf0] hover:text-white'}`}>
            Contact Me
          </button>
        </div>
      </div>
    </main>
  );
}

function Skills({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          My <span className="text-[#00abf0]">Skills</span>
        </h2>
        <p className={`text-sm md:text-base transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          Technologies and tools I work with to create amazing web experiences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillsData.map((skill, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
              isDarkMode 
                ? 'bg-[#0a253a] border border-[#00abf0]/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,171,240,0.15)]' 
                : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2.5 ${isDarkMode ? 'bg-[#081b29]' : 'bg-slate-50'}`}>
                <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-lg">{skill.name}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Proficiency</span>
                <span className="font-bold" style={{ color: skill.color }}>{skill.proficiency}%</span>
              </div>
              
              <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-[#081b29]' : 'bg-slate-100'}`}>
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${skill.proficiency}%`, backgroundColor: skill.color }}
                ></div>
              </div>
              
              <div 
                className="h-1 w-8 rounded-full mt-4"
                style={{ backgroundColor: skill.color, opacity: 0.5 }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          My <span className="text-[#00abf0]">Projects</span>
        </h2>
        <p className={`text-sm md:text-base transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          A showcase of my recent work
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projectsData.map((project, index) => (
          <div 
            key={index} 
            className={`rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col ${
              isDarkMode 
                ? 'bg-[#0a253a] border border-[#00abf0]/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,171,240,0.15)]' 
                : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60'
            }`}
          >
            {/* Image */}
            <div className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-xl mb-2">{project.title}</h3>
              <p className={`text-sm mb-4 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {project.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isDarkMode ? 'bg-[#081b29] text-gray-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Buttons */}
              <div className="flex items-center gap-4 mt-auto">
                <a 
                  href={project.codeLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-[#081b29] hover:bg-gray-800 text-white' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
                  }`}
                >
                  <Github size={16} /> Code
                </a>
                <a 
                  href={project.demoLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-[#00abf0] hover:bg-[#00abf0]/90 text-white transition-colors shadow-lg shadow-[#00abf0]/20"
                >
                  <ExternalLink size={16} /> Demo
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
  const location = useLocation();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#081b29] text-white selection:bg-[#00abf0] selection:text-white' : 'bg-[#f8fafc] text-[#0f172a] selection:bg-[#00abf0] selection:text-white'}`}>
      {/* Modern Grid Background */}
      <div className={`modern-grid-bg transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-60'}`}></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-2xl font-bold tracking-tight cursor-pointer">
          Portfolio
        </Link>
        
        <div className={`hidden lg:flex items-center space-x-8 text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
          <Link to="/" className={`${location.pathname === '/' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Home</Link>
          <Link to="/about" className={`${location.pathname === '/about' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>About</Link>
          <Link to="/education" className={`${location.pathname === '/education' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Education</Link>
          <Link to="/skills" className={`${location.pathname === '/skills' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Skills</Link>
          <Link to="/projects" className={`${location.pathname === '/projects' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Projects</Link>
          <Link to="/services" className={`${location.pathname === '/services' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Services</Link>
          <Link to="/contact" className={`${location.pathname === '/contact' ? 'text-[#00abf0]' : 'hover:text-[#00abf0]'} transition-colors`}>Contact</Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3 cursor-pointer group" onClick={toggleTheme}>
            <div className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-0 bg-[#00abf0]' : 'translate-x-6 bg-white shadow-sm'}`}>
              </div>
            </div>
            {isDarkMode ? (
              <Moon size={18} className="text-gray-300 group-hover:text-white transition-colors" />
            ) : (
              <Sun size={18} className="text-amber-500 group-hover:text-amber-600 transition-colors" />
            )}
          </div>
          
          <button className="bg-[#ff004f] hover:bg-[#ff004f]/90 text-white px-4 py-2 md:px-5 md:py-2.5 rounded text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-[#ff004f]/20 hover:shadow-[#ff004f]/40">
            Download CV <Download size={16} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <Routes>
        <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
        <Route path="/skills" element={<Skills isDarkMode={isDarkMode} />} />
        <Route path="/projects" element={<Projects isDarkMode={isDarkMode} />} />
        <Route path="*" element={<Home isDarkMode={isDarkMode} />} />
      </Routes>

      {/* Footer */}
      <footer className={`relative z-10 w-full py-6 mt-auto border-t backdrop-blur-md transition-colors duration-500 ${isDarkMode ? 'border-[#00abf0]/20 bg-[#081b29]/50' : 'border-slate-200 bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            &copy; {new Date().getFullYear()} Chandni Chauhan. All rights reserved.
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
