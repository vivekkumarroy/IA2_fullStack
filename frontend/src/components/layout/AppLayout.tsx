import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, BookUp, Users, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { ShelfLifeMark } from '../common/ShelfLifeMark';

export const AppLayout: React.FC = () => {
  const { librarian, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { to: '/', label: 'Catalog', detail: 'Books & inventory', icon: BookOpen, end: true },
    { to: '/issue', label: 'Issue a loan', detail: 'Create a checkout', icon: BookUp },
    { to: '/members', label: 'Members', detail: 'People & histories', icon: Users },
  ];
  const handleLogout = () => { logout(); navigate('/login'); };

  return <div className="min-h-screen bg-[#f7f4ed] text-[#192531] lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
    <aside className="hidden min-h-screen flex-col border-r border-[#d8d3c9] bg-[#1b3b48] px-5 py-6 text-[#eaf0ec] lg:flex">
      <NavLink to="/" className="flex items-center gap-3 px-2" aria-label="ShelfLife home">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e87861] p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"><ShelfLifeMark className="h-full w-full" /></span>
        <span><span className="block font-serif text-2xl font-bold tracking-tight">Shelf<span className="text-[#f1b490]">Life</span></span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#abc2c1]">Library desk</span></span>
      </NavLink>
      <div className="mt-11 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#93b2b5]">Workspace</div>
      <nav className="mt-3 space-y-1.5" aria-label="Primary navigation">
        {navItems.map(({ to, label, detail, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 transition ${isActive ? 'bg-[#f6f0e7] text-[#173641] shadow-[0_4px_14px_rgba(8,25,34,0.16)]' : 'text-[#d4e0de] hover:bg-white/10 hover:text-white'}`}>
          {({ isActive }) => <><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${isActive ? 'bg-[#e6b8a5] text-[#84362b]' : 'bg-white/10 text-[#c7dcdb] group-hover:bg-white/15'}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className={`mt-0.5 block text-[11px] ${isActive ? 'text-[#68766f]' : 'text-[#9ebbb9]'}`}>{detail}</span></span></>}
        </NavLink>)}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.07] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#f2f1e9]"><Sparkles className="h-4 w-4 text-[#edb785]" /> Live inventory</div><p className="mt-2 text-xs leading-5 text-[#b9cecc]">Every checkout checks availability before the loan is recorded.</p></div>
      <div className="mt-4 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e6b8a5] text-sm font-bold text-[#71352f]">{librarian?.name?.slice(0, 1).toUpperCase() || 'L'}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{librarian?.name || 'Librarian'}</p><p className="truncate text-xs text-[#a8c1c0]">{librarian?.email}</p></div><button onClick={handleLogout} className="rounded-lg p-2 text-[#bdd2d0] transition hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-40 border-b border-[#d8d3c9] bg-[#f7f4ed]/95 backdrop-blur lg:hidden"><div className="flex h-16 items-center justify-between px-4 sm:px-6"><NavLink to="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e87861] p-1"><ShelfLifeMark className="h-full w-full" /></span><span className="font-serif text-xl font-bold">Shelf<span className="text-[#a74a39]">Life</span></span></NavLink><Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sign out"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></Button></div><nav className="flex gap-1 overflow-x-auto border-t border-[#e1ddd4] px-3 py-2" aria-label="Mobile navigation">{navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${isActive ? 'bg-[#1b3b48] text-white' : 'text-[#59666a]'}`}><Icon className="h-3.5 w-3.5" />{label}</NavLink>)}</nav></header>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10"><Outlet /></main>
      <footer className="mx-auto flex max-w-[1440px] flex-col gap-1 border-t border-[#d8d3c9] px-4 py-5 text-xs text-[#78817f] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10"><span>© 2026 ShelfLife. Thoughtful libraries, well kept.</span><span>Catalog · Loans · Member records</span></footer>
    </div>
  </div>;
};
