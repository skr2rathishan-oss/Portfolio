// ── Skill (produced by the engine, not stored statically) ───
export interface Skill {
  name:        string;
  icon:        string;
  color:       string;
  proficiency: number;  // 0-95, derived algorithmically
  frequency:   number;  // number of projects it appears in
}

// ── Tag attached to each project ────────────────────────────
export interface Tag {
  name:  string;
  level: 'core' | 'supporting' | 'exposure';
}

// ── Project ──────────────────────────────────────────────────
export interface Project {
  title:       string;
  description: string;
  image:       string;
  tags:        Tag[];             // structured tags
  weight:      1 | 2 | 3;        // project importance
  complexity:  'low' | 'medium' | 'high';
  codeLink:    string;
  demoLink?:   string;           // optional — only shown when present
}

export interface ProfileInfo {
  homeImage: string;
  aboutImage: string;
}

export interface Education {
  period: string;
  degree: string;
  school: string;
  status: string;
  logo: string | null;
  link?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  image: string;
  color: string;
  description?: string;
  skillsLearned?: string[];
  credentialLink?: string;
}

export interface Achievement {
  title: string;
  org: string;
  year: string;
  image: string;
  badge: string;
  badgeColor: string;
  description?: string;
  skillsGained?: string[];
  link?: string;
}

export interface CommunityRole {
  name: string;
  role: string;
  org: string;
  desc: string;
  image: string;
  color: string;
  link?: string;
}

export const profileData: ProfileInfo = {
  homeImage: '/profile/Aboutmeprofile.jpeg',
  aboutImage: '/profile/Aboutmeprofile.jpeg',
};

// ── Projects (controls order = exact render order in UI) ─────
export const projectsData: Project[] = [
  {
    // ★ n8n AI Job Discovery & Matching Agent (1st)
    title:       'n8n AI Job Discovery & Matching Agent',
    description: 'An AI-powered automated n8n workflow system for autonomous job discovery, resume analysis, and intelligent candidate-job matching powered by NVIDIA Nemotron LLM.',
    image:       '/projects/n8n-job-matching.png',
    weight:      3,
    complexity:  'high',
    tags: [
      { name: 'n8n',                 level: 'core'       },
      { name: 'NVIDIA Nemotron',     level: 'core'       },
      { name: 'AI Agents',           level: 'core'       },
      { name: 'LLMs',                level: 'supporting' },
      { name: 'Workflow Automations', level: 'supporting' },
      { name: 'Python',              level: 'exposure'   },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/n8n-ai-job-matching',
  },
  {
    // ★ Velora AI Agent (2nd)
    title:       'Velora - E-Commerce AI Agent',
    description: 'An autonomous multi-tool AI shopping assistant built with Python, LangChain, and LLM function calling to automate product discovery, intelligent recommendations, and cart operations.',
    image:       '/projects/Velora.jpeg',
    weight:      3,
    complexity:  'high',
    tags: [
      { name: 'Python',     level: 'core'       },
      { name: 'LangChain',  level: 'core'       },
      { name: 'FastAPI',    level: 'supporting' },
      { name: 'AI Agents',  level: 'core'       },
      { name: 'LLMs',       level: 'supporting' },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/EcommerceAiagent',
    demoLink: 'https://drive.google.com/file/d/1Yv_aZXqZv2L50LALfHK6NYD9sxVJM8Xw/view?usp=drive_link',
  },
  {
    // ★ SupportPilot - AI Customer Support Platform (2nd)
    title:       'SupportPilot - AI Customer Support Platform',
    description: 'An enterprise-grade AI-powered customer support platform featuring intelligent automated ticket routing, role-based access control (RBAC), multi-tenant onboarding, and a real-time platform admin dashboard.',
    image:       '/projects/CustomerSupoort.png',
    weight:      3,
    complexity:  'high',
    tags: [
      { name: 'React',        level: 'core'       },
      { name: 'TypeScript',   level: 'core'       },
      { name: 'Node.js',      level: 'core'       },
      { name: 'AI Routing',   level: 'core'       },
      { name: 'Tailwind CSS', level: 'supporting' },
      { name: 'RBAC Auth',    level: 'supporting' },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/Ai-powered-Customer-Support-Platform',
  },
  {
    // ★ Personalized Study Buddy (4th)
    title:       'Personalized Study Buddy',
    description: 'An AI-driven study companion that personalises learning paths and tracks progress using TypeScript-first architecture.',
    image:       '/projects/StudyBuddy.jpg',
    weight:      2,
    complexity:  'medium',
    tags: [
      { name: 'TypeScript',   level: 'core'       },
      { name: 'React',        level: 'core'       },
      { name: 'Tailwind CSS', level: 'supporting' },
      { name: 'Vite',         level: 'supporting' },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/Personalized-Study-Buddy',
  },
  {
    // ★ Machine Learning Portfolio (5th)
    title:       'Machine Learning Portfolio',
    description: 'Comprehensive machine learning portfolio showcasing data preprocessing, exploratory data analysis, feature engineering, regression, classification, clustering, and end-to-end model development.',
    image:       '/projects/MachineLearning.png',
    weight:      2,
    complexity:  'high',
    tags: [
      { name: 'Python',       level: 'core'       },
      { name: 'scikit-learn', level: 'core'       },
      { name: 'TensorFlow',   level: 'supporting' },
      { name: 'PyTorch',      level: 'supporting' },
      { name: 'Pandas',       level: 'supporting' },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/machine-learning-portfolio',
  },
  {
    // ★ E-Commerce Mini-Project (6th - before the last)
    title:       'E-Commerce Mini-Project',
    description: 'A fully responsive Vue 3 e-commerce SPA featuring real-time product search, cart management, JWT auth, and pagination — consuming the DummyJSON REST API.',
    image:       '/projects/Ecommerce-miniproject.jpg',
    weight:      3,
    complexity:  'high',
    tags: [
      { name: 'Vue 3',        level: 'core'       },
      { name: 'Tailwind CSS', level: 'core'       },
      { name: 'TypeScript',   level: 'supporting' },
      { name: 'DummyJSON',    level: 'supporting' },
      { name: 'Vite',         level: 'exposure'   },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/Mini-Project',
    demoLink: 'https://miniproject584.netlify.app/',
  },
  {
    // ★ Web Dev Collection (7th - Last)
    title:       'Web Dev Collection',
    description: 'Curated showcase of responsive UI experiments exploring animations, modern CSS techniques, and interactive frontend components.',
    image:       'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    weight:      1,
    complexity:  'low',
    tags: [
      { name: 'HTML',       level: 'core'       },
      { name: 'CSS',        level: 'core'       },
      { name: 'JavaScript', level: 'core'       },
    ],
    codeLink: 'https://github.com/skr2rathishan-oss/Web_Development_Projects',
  },
];

export const educationData: Education[] = [
  {
    period: '2023 – 2028', degree: 'B.Sc. Computer Engineering',
    school: 'University of Ruhuna', status: 'In Progress',
    logo: '/Education/Ruhuna.jpeg',
    link: 'https://www.eng.ruh.ac.lk/'
  },
  {
    period: '2020 – 2023', degree: 'A/L Physical Science',
    school: "Mu/Puthukkudiyiruppu Central College", status: 'Completed',
    logo: '/Education/Central_College.jpeg',
    link: 'https://www.facebook.com/share/g/1CBMDWqCH5/'
  }
];

export const certificationsData: Certification[] = [
  {
    name: 'Generative AI Chatbot Bootcamp',
    issuer: 'DevTown & Microsoft Student Chapter - MSIT',
    year: 'Mar 2026',
    image: '/Certificates/certificates/devtown_screenshot.jpg',
    color: '#a855f7',
    description: 'Built and deployed generative AI chatbots using LLMs, prompt engineering, and conversational AI architectures in collaboration with Microsoft Student Chapter.',
    skillsLearned: ['AI', 'Prompt Engineering', 'LLMs', 'Chatbot Dev'],
    credentialLink: 'https://cert.devtown.in/verify/ZKOpTH'
  },
  {
    name: 'Microsoft Azure Essentials',
    issuer: 'Microsoft & LinkedIn',
    year: 'Sep 2026',
    image: '/Certificates/certificates/azure.jpg',
    color: '#0078d4',
    description: 'Core cloud computing principles, Azure architectural components, resource management, cloud governance, and security fundamentals.',
    skillsLearned: ['Microsoft Azure', 'Cloud Computing', 'Security'],
    credentialLink: 'https://www.linkedin.com/learning/certificates/ef7af3cdb93346f07e0245e86a543f87b74892449b540de91ff8a72515a139ec'
  },
  {
    name: 'Docker Foundations',
    issuer: 'Docker & LinkedIn',
    year: 'Mar 2026',
    image: '/Certificates/certificates/docker_screenshot.jpg',
    color: '#2496ed',
    description: 'Hands-on containerization fundamentals, Dockerfile authoring, multi-container orchestration, and image management.',
    skillsLearned: ['Containerization', 'Docker Products', 'DevOps'],
    credentialLink: 'https://www.linkedin.com/learning/certificates/0bba75b6ffea8780fbce41622d99983ff99d4702426d4391841d57215df37a41'
  },
  {
    name: 'AI/ML Engineer - Stage 1',
    issuer: 'SLIIT Faculty of Computing',
    year: 'Oct 2025',
    image: '/Certificates/certificates/Slit.jpg',
    color: '#f59e0b',
    description: 'Comprehensive training covering machine learning pipelines, deep neural networks, image processing, and computer vision models.',
    skillsLearned: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
    credentialLink: 'https://code.sliit.org/certificates/veaysmvojn'
  },
  {
    name: 'Python for Data Science & ML',
    issuer: 'LinkedIn Learning',
    year: 'May 2026',
    image: '/Certificates/certificates/machinlearning.jpg',
    color: '#10b981',
    description: 'Exploratory data analysis, statistical model fitting, predictive regression algorithms, and machine learning pipelines in Python.',
    skillsLearned: ['Machine Learning', 'Python', 'Artificial Intelligence'],
    credentialLink: 'https://www.linkedin.com/learning/certificates/e8f6a8566a84c4b89f884553037d7c052e9311e85f02e5df834a0d46dbe04d9d'
  }
];

export const achievementsData: Achievement[] = [
  {
    title: 'CodeBlast 2025 Hackathon',
    org: 'University of Ruhuna & SLT Mobitel',
    year: '2025',
    image: '/about/codeblast_square.png',
    badge: 'Competition',
    badgeColor: '#00abf0',
    description: 'Participated in CodeBlast 2025, a national-level hackathon organized by the University of Ruhuna and SLT Mobitel. Built innovative solutions using modern cloud technologies and AI.',
    skillsGained: ['MSPACE APIs', 'Microsoft Azure', 'Backend Development', 'Model Training & Inference'],
    link: 'https://www.linkedin.com/posts/rathishan-mahendran-39812b316_codeblast2025-rextro2025-universityofruhuna-activity-7410300981302886402-QD_x'
  },
  {
    title: 'Kapruka Agent Challenge 2026',
    org: 'Kapruka Holdings PLC',
    year: '2026',
    image: '/about/kapruka_square.png',
    badge: 'Builder',
    badgeColor: '#a855f7',
    description: 'Built and submitted a live AI shopping agent on the Kapruka MCP in the Kapruka Agent Challenge 2026 — joining more than 700 developers across Sri Lanka in pioneering the future of agentic commerce.',
    skillsGained: ['AI Shopping Agent', 'Kapruka MCP', 'LLMs', 'Agentic Commerce'],
    link: 'https://github.com/skr2rathishan-oss/EcommerceAiagent'
  },
  {
    title: 'IEEEXtreme 19.0 Programming Competition',
    org: 'IEEE Global',
    year: '2025',
    image: '/about/ieee_square.png',
    badge: 'Competition',
    badgeColor: '#00629b',
    description: 'Participated with team Tamilcoders in IEEEXtreme 19.0, a 24-hour virtual competitive programming challenge that hosted +19,000 participants worldwide.',
    skillsGained: ['Competitive Programming', 'Algorithms', 'Data Structures', 'Team Problem Solving'],
    link: '/Certificates/certificates/IEEExtreme.jpg'
  }
];

export const communityData: CommunityRole[] = [
  {
    name: 'AI & Data Science Innovation Club Of Ruhuna Engineering',
    role: 'AI Knowledge Disseminator (Part-time)',
    org: 'University of Ruhuna',
    desc: 'Contributed to AI knowledge dissemination within the university and broader external community.',
    image: 'https://cdn-icons-png.flaticon.com/512/306/306232.png',
    color: '#00abf0',
    link: 'https://theicore.org/'
  },
  {
    name: 'IEEE Member',
    role: 'Active Member',
    org: 'IEEE (Global)',
    desc: 'Actively participated in technical workshops and research discussions focused on advancements in AI engineering. Engaged in professional development activities and networking initiatives to foster innovation.',
    image: '/about/IEE.png',
    color: '#00abf0'
  }
];
