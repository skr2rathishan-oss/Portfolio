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
    // ★ Velora AI Agent (1st)
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
    // ★ E-Commerce Mini-Project (2nd)
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
    // ★ Personalized Study Buddy (3rd)
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
    // ★ Web Dev Collection (4th)
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
  {
    // ★ Machine Learning Portfolio (5th - Last)
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
    issuer: 'DevTown',
    year: 'March 2026',
    image: '/Certificates/Devtown.jpg',
    color: '#00abf0',
    credentialLink: 'https://cert.devtown.in/verify/1Deezj',
    skillsLearned: ['Ai Agent Building']
  },
  {
    name: 'GitHub Actions Learning',
    issuer: 'GitHub Actions Learning (by Nisal Gunawardhana)',
    year: 'February 2026',
    image: '/Certificates/Github Actions.png',
    color: '#00abf0',
    credentialLink: 'https://github.com/nisalgunawardhana/github-actions-learning/issues/85#issuecomment-3848795415',
    skillsLearned: ['GitHub']
  },
  {
    name: 'Generative AI Handbook',
    issuer: 'Educative',
    year: 'December 2025',
    image: '/Certificates/educative.jpg',
    color: '#00abf0',
    credentialLink: 'https://www.educative.io/verify-certificate/985KjktxAO7yklNVyH0jWo6rDgkVhN',
    skillsLearned: ['LLMs', 'RAGs', 'Fine-tuning', 'Prompt Engineering']
  },
  {
    name: 'AI/ML Engineer - Stage 1',
    issuer: 'SLIIT',
    year: 'October 2025',
    image: '/Certificates/sliit_logo.jpg',
    color: '#00abf0',
    credentialLink: 'https://code.sliit.org/certificates/veaysmvojn',
    skillsLearned: ['Image Processing', 'Computer Vision']
  }
];

export const achievementsData: Achievement[] = [
  {
    title: 'CodeBlast 2025 Hackathon',
    org: 'University of Ruhuna & SLT Mobitel',
    year: '2025',
    image: '/about/codeblastRuhuna.jpeg',
    badge: 'Competition',
    badgeColor: '#00abf0',
    link: 'https://www.linkedin.com/posts/rathishan-mahendran-39812b316_codeblast2025-rextro2025-universityofruhuna-activity-7410300981302886402-QD_x',
    skillsGained: ['MSPACE APIs', 'Microsoft Azure', 'Backend Development', 'Model Training & Inference']
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
