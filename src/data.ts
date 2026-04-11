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
}

export interface Achievement {
  title: string;
  org: string;
  year: string;
  image: string;
  badge: string;
  badgeColor: string;
}

export interface CommunityRole {
  name: string;
  role: string;
  org: string;
  desc: string;
  image: string;
  color: string;
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
    period: '2023 – 2027', degree: 'B.Sc. Computer Engineering',
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
  { name: 'Docker Fundamentals', issuer: 'Docker Inc.', year: '2024', image: '/icons/cert.png', color: '#2496ED' },
  { name: 'Generative AI Basics', issuer: 'Google', year: '2024', image: '/icons/cert.png', color: '#4285F4' },
  { name: 'AI/ML Engineering', issuer: 'Coursera', year: '2024', image: '/icons/cert.png', color: '#F5821F' },
  { name: 'Python Programming', issuer: 'UoM', year: '2023', image: '/icons/cert.png', color: '#3776AB' },
  { name: 'React Development', issuer: 'Online', year: '2024', image: '/icons/cert.png', color: '#61DAFB' },
  { name: 'Firebase & Cloud', issuer: 'Google Cloud', year: '2024', image: '/icons/cert.png', color: '#FFCA28' },
];

export const achievementsData: Achievement[] = [
  {
    title: 'Top 10 — CodeBlast Hackathon',
    org: 'Univ. of Ruhuna & Mobitel',
    year: '2024',
    image: '/icons/trophy.png',
    badge: 'Competition',
    badgeColor: '#FFB800',
  },
  {
    title: 'GSoC 2026 Proposal Submitted',
    org: 'Oppia Foundation (Google)',
    year: '2025',
    image: '/icons/trophy.png',
    badge: 'Open Source',
    badgeColor: '#00abf0',
  },
  {
    title: 'IEEE Student Branch Member',
    org: 'University of Ruhuna',
    year: '2023',
    image: '/icons/trophy.png',
    badge: 'Membership',
    badgeColor: '#A855F7',
  },
];

export const communityData: CommunityRole[] = [
  {
    name: 'IEEE Student Branch',
    role: 'Active Member',
    org: 'University of Ruhuna',
    desc: 'Participating in workshops, technical seminars, and IEEE-organized events.',
    image: '/icons/community.png',
    color: '#00629B',
  },
  {
    name: 'Innovation Club',
    role: 'AI & Data Lead',
    org: 'University of Ruhuna',
    desc: 'Driving AI exploration sessions, conducting data workshops and project demos.',
    image: '/icons/community.png',
    color: '#F59E0B',
  },
  {
    name: 'Open-Source Community',
    role: 'Contributor',
    org: 'GitHub',
    desc: 'Contributing to open-source projects under GSoC 2026 preparations (Oppia).',
    image: '/icons/community.png',
    color: '#10B981',
  },
];
