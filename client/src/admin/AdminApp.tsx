import { useState, type FormEvent } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Seo from '../components/Seo';
import { AuthProvider, useAuth } from './auth';
import { ToastProvider, inputCls } from './ui';
import Dashboard from './pages/Dashboard';
import MediaLibrary from './pages/MediaLibrary';
import Products from './pages/Products';
import ProductEdit from './pages/ProductEdit';
import Collections from './pages/Collections';
import Blog from './pages/Blog';
import BlogEdit from './pages/BlogEdit';
import Enquiries from './pages/Enquiries';
import SettingsPage from './pages/SettingsPage';
import { CloseIcon, MenuIcon } from '../components/Icons';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/collections', label: 'Collections' },
  { to: '/admin/blog', label: 'Journal' },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Seo title="Admin" noindex />
        <Gate />
      </ToastProvider>
    </AuthProvider>
  );
}

function Gate() {
  const { user, checking } = useAuth();
  if (checking) return <div className="min-h-screen bg-cream" />;
  if (!user) return <Login />;
  return <Shell />;
}

function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await login(String(form.get('email')), String(form.get('password')));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-cream p-8">
        <img src="/logo.png" alt="LucianaSoul" className="mx-auto h-24 w-24 object-cover mix-blend-multiply" />
        <h1 className="mt-4 text-center font-serif text-3xl uppercase tracking-[0.2em]">Studio admin</h1>
        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="field-label">Email</span>
            <input name="email" type="email" required autoComplete="username" className={inputCls} />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </label>
          {error && <p className="text-sm text-[#8a4b3c]">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <Link to="/" className="label mt-6 block text-center text-taupe">
          Back to website
        </Link>
      </form>
    </div>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
              isActive ? 'bg-ink text-cream' : 'text-deep hover:bg-stone/60'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-taupe/30 bg-sand p-5 lg:flex lg:min-h-screen lg:flex-col">
        <Link to="/admin" className="mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-10 object-cover mix-blend-multiply" />
          <span className="font-serif text-lg uppercase tracking-[0.22em] text-deep">LucianaSoul</span>
        </Link>
        {nav}
        <div className="mt-auto space-y-3 border-t border-taupe/30 pt-4 text-xs text-deep">
          <p className="truncate">{user?.email}</p>
          <p className="label text-[9px] text-taupe">{user?.role}</p>
          <div className="flex gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="link-underline">
              View site
            </a>
            <button type="button" onClick={logout} className="link-underline">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-taupe/30 bg-sand px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu">
          <MenuIcon />
        </button>
        <span className="font-serif uppercase tracking-[0.22em] text-deep">LucianaSoul admin</span>
        <button type="button" onClick={logout} className="label text-[10px]">
          Sign out
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 bg-sand p-5 lg:hidden">
          <button type="button" onClick={() => setOpen(false)} className="mb-6" aria-label="Close menu">
            <CloseIcon />
          </button>
          {nav}
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-8 lg:p-10">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductEdit />} />
          <Route path="products/:id" element={<ProductEdit />} />
          <Route path="collections" element={<Collections />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/new" element={<BlogEdit />} />
          <Route path="blog/:id" element={<BlogEdit />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
