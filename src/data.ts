export interface Skill {
  name: string;
  icon: string;
  proficiency: number;
  color: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  codeLink: string;
  demoLink: string;
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
  homeImage: '/profile/Profilephoto.jpeg',
  aboutImage: '/profile/Aboutmeprofile.jpeg',
};

export const skillsData: Skill[] = [
  { name: 'laravel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg', proficiency: 95, color: '#ff2d20' },
  { name: 'framer_motion', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framer/framer-original.svg', proficiency: 90, color: '#0055FF' },
  { name: 'vue', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg', proficiency: 88, color: '#41b883' },
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', proficiency: 85, color: '#61dafb' },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', proficiency: 92, color: '#38bdf8' },
  { name: 'firebase.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg', proficiency: 80, color: '#ffca28' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', proficiency: 75, color: '#3776ab' },
  { name: 'vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg', proficiency: 80, color: '#646cff' },
];

export const projectsData: Project[] = [
  {
    title: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with payment gateway',
    // To use a local image, create a 'projects' folder inside your 'public' folder
    // and reference it like this: image: '/projects/ecommerce.jpg'
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
    color: '#2496ED',
    credentialLink: 'https://github.com/nisalgunawardhana/github-actions-learning/issues/85#issuecomment-3848795415',
    skillsLearned: ['GitHub']
  },
  {
    name: 'Generative AI Handbook',
    issuer: 'Educative',
    year: 'December 2025',
    image: '/Certificates/educative.jpg',
    color: '#A855F7',
    credentialLink: 'https://www.educative.io/verify-certificate/985KjktxAO7yklNVyH0jWo6rDgkVhN',
    skillsLearned: ['LLMs', 'RAGs', 'Fine-tuning', 'Prompt Engineering']
  },
  {
    name: 'AI/ML Engineer - Stage 1',
    issuer: 'SLIIT',
    year: 'October 2025',
    image: '/Certificates/sliit_logo.jpg',
    color: '#F5821F',
    credentialLink: 'https://code.sliit.org/certificates/veaysmvojn',
    skillsLearned: ['Image Processing', 'Computer Vision']
  }
];

export const achievementsData: Achievement[] = [
  {
    title: 'CodeBlast 2025 Hackathon',
    org: 'University of Ruhuna & SLT Mobitel',
    year: '2025',
    image: 'https://cdn-icons-png.flaticon.com/512/888/888846.png',
    badge: 'Competition',
    badgeColor: '#FFB800',
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
    color: '#F59E0B',
    link: 'https://theicore.org/'
  },
  {
    name: 'IEEE Member',
    role: 'Active Member',
    org: 'IEEE (Global)',
    desc: 'Actively participated in technical workshops and research discussions focused on advancements in AI engineering. Engaged in professional development activities and networking initiatives to foster innovation.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/1200px-IEEE_logo.svg.png',
    color: '#00629B'
  }
];
