import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, BookUp, Users, LogOut, Sparkles, ClipboardList, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { ShelfLifeMark } from '../common/ShelfLifeMark';

export const AppLayout: React.FC = () => {
  const { librarian, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navSections = [
    {
      label: 'Collection',
      items: [{ to: '/', label: 'Books', detail: 'Catalog & inventory', icon: BookOpen, end: true }],
    },
    {
      label: 'Circulation',
      items: [
        { to: '/circulation', label: 'Circulation', detail: 'All book activity', icon: ClipboardList, end: false },
        { to: '/issue', label: 'Issue a book', detail: 'Create a checkout', icon: BookUp, end: false },
      ],
    },
    {
      label: 'Community',
      items: [{ to: '/members', label: 'Members', detail: 'People & histories', icon: Users, end: false }],
    },
  ];
  const navItems = navSections.flatMap(({ items }) => items);
  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return <div className="min-h-screen bg-[#f7f4ed] text-[#192531] lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
    <aside className="hidden min-h-screen flex-col border-r border-[#d8d3c9] bg-[#1b3b48] px-5 py-6 text-[#eaf0ec] lg:flex">
      <NavLink to="/" className="flex items-center gap-3 px-2" aria-label="ShelfLife home">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e87861] p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"><ShelfLifeMark className="h-full w-full" /></span>
        <span><span className="block font-serif text-2xl font-bold tracking-tight">Shelf<span className="text-[#f1b490]">Life</span></span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#abc2c1]">Library desk</span></span>
      </NavLink>
      <nav className="mt-11 space-y-1.5" aria-label="Primary navigation">
        {navSections.map(({ label: sectionLabel, items }) => <section key={sectionLabel}>
          <div className="space-y-1.5">
            {items.map(({ to, label, detail, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 transition duration-200 ease-[var(--ease-out-quart)] active:scale-[0.98] ${isActive ? 'bg-[#f6f0e7] text-[#173641] shadow-[0_4px_14px_rgba(8,25,34,0.16)]' : 'text-[#d4e0de] hover:bg-white/10 hover:text-white'}`}>
              {({ isActive }) => <><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${isActive ? 'bg-[#e6b8a5] text-[#84362b]' : 'bg-white/10 text-[#c7dcdb] group-hover:bg-white/15'}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className={`mt-0.5 block text-[11px] ${isActive ? 'text-[#68766f]' : 'text-[#9ebbb9]'}`}>{detail}</span></span></>}
            </NavLink>)}
          </div>
        </section>)}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.07] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#f2f1e9]"><Sparkles className="h-4 w-4 text-[#edb785]" /> Live inventory</div><p className="mt-2 text-xs leading-5 text-[#b9cecc]">Every checkout checks availability before a book issue is recorded.</p></div>
      <div className="mt-4 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e6b8a5] text-sm font-bold text-[#71352f]">{librarian?.name?.slice(0, 1).toUpperCase() || 'L'}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{librarian?.name || 'Librarian'}</p><p className="truncate text-xs text-[#a8c1c0]">{librarian?.email}</p></div><button onClick={handleLogout} className="rounded-lg p-2 text-[#bdd2d0] transition hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-40 border-b border-[#d8d3c9] bg-[#f7f4ed]/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5" aria-label="ShelfLife home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e87861] p-1"><ShelfLifeMark className="h-full w-full" /></span>
            <span className="font-serif text-xl font-bold">Shelf<span className="text-[#a74a39]">Life</span></span>
          </NavLink>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sign out"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation">
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>Menu</span>
            </Button>
          </div>
        </div>
        {mobileNavOpen && (
          <nav id="mobile-navigation" className="mobile-nav-panel border-t border-[#e1ddd4] px-4 py-3 sm:px-6" aria-label="Mobile navigation">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(({ to, label, detail, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-h-14 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition duration-200 ease-[var(--ease-out-quart)] ${isActive ? 'bg-[#1b3b48] text-white shadow-[0_4px_12px_rgba(23,54,65,0.16)]' : 'bg-[#f0ede5] text-[#35434a] hover:bg-[#e8e4da]'}`}>
                {({ isActive }) => <><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${isActive ? 'bg-white/15 text-[#f0bd9b]' : 'bg-[#fffdf9] text-[#1d5968]'}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-xs font-bold">{label}</span><span className={`mt-0.5 block truncate text-[10px] ${isActive ? 'text-[#c6d9d6]' : 'text-[#74807f]'}`}>{detail}</span></span></>}
              </NavLink>)}
            </div>
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10"><div key={location.pathname} className="page-enter"><Outlet /></div></main>
      <footer className="mx-auto flex max-w-[1440px] flex-col gap-1 border-t border-[#d8d3c9] px-4 py-5 text-xs text-[#78817f] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10"><span>© 2026 ShelfLife. Thoughtful libraries, well kept.</span><span>Books · Circulation · Member records</span></footer>
    </div>
  </div>;
};
