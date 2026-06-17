// Shared navigation data — used by SideNav (desktop left rail) and TopBar
// (mobile/tablet dropdown) so the two never drift out of sync.
export const navGroups = [
  {
    label: 'Start Here',
    items: [
      { id: 'how-to-use', label: 'How to Practice', href: '/how-to-use/' },
      { id: 'leaderboard', label: 'Leaderboard',     href: '/leaderboard/' },
      { id: 'roadmap',     label: 'Roadmap',          href: '/roadmap/' },
      { id: 'about',       label: 'About',            href: '/about/' },
    ],
  },
  {
    label: 'Exam Practice',
    items: [
      { id: 'csa',      label: 'CSA',      href: '/csa/' },
      { id: 'cad',      label: 'CAD',      href: '/cad/' },
      { id: 'cis-itsm', label: 'CIS-ITSM', href: '/cis-itsm/' },
      { id: 'cis-df',   label: 'CIS-DF',   href: '/cis-df/' },
      { id: 'cis-sm',   label: 'CIS-SM',   href: '/cis-sm/' },
    ],
  },
];
