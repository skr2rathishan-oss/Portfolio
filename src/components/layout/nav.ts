// Primary navigation, shared by the header, the mobile menu and the footer.
export interface NavItem {
  to: string;
  label: string;
  /** Match the route exactly (Home), so it is not active on every page. */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Me' },
  { to: '/projects', label: 'Projects' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact', label: 'Connect' },
];
