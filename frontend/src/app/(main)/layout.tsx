'use client';

import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import ActiveTimerOverlay from '../../components/board/ActiveTimerOverlay';
import { useAuth, PageLoader } from '../../lib/auth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isAuthed = useAuth();

  if (!isAuthed) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-slate-50 relative pb-16 md:pb-0">
          <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] translate-x-1/3" />
          </div>
          <div className="relative z-10 flex flex-col flex-1 min-h-full">{children}</div>
        </main>
      </div>
      <ActiveTimerOverlay />
    </div>
  );
}
