import { Navbar } from './Navbar';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 antialiased">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
