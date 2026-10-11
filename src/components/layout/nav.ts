// Primary navigation, shared by the header, the mobile menu and the footer.
export interface NavItem {
  to: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact', label: 'Contact' },
];
