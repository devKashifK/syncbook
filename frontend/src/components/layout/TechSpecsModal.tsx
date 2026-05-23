'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import {
  Server, Database, Globe, Shield, Cpu, GitBranch, Layers,
  Container, Settings2, Lock, Zap, Code2, Network, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { cn } from '../../lib/utils';

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function Section({ icon, title, badge, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600">{icon}</span>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{badge}</span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && <div className="px-4 py-4 bg-white space-y-3">{children}</div>}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-200 rounded-lg p-3 text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">
      {children}
    </pre>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={cn('text-xs text-right font-medium', accent ? 'text-blue-600' : 'text-slate-700')}>{value}</span>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
      {children}
    </span>
  );
}

function GridCard({ label, val }: { label: string; val: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-[11px] font-semibold text-slate-700">{val}</p>
    </div>
  );
}

type TechSpecsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TechSpecsModal({ isOpen, onClose }: TechSpecsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent showCloseButton={false} className="!max-w-5xl w-[90vw] bg-white border border-slate-200 text-slate-800 p-0 overflow-hidden max-h-[88vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Cpu className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">SyncBoard — System Architecture</h2>
                <p className="text-xs text-slate-500 mt-0.5">Distributed Monorepo · Full-Stack Technical Reference</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Next.js 15', 'Spring Boot 4', 'PostgreSQL 16', 'Docker', 'Render Cloud', 'Zustand', 'JWT Auth'].map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-2.5 flex-1">

          <Section icon={<Network className="h-4 w-4" />} title="Network Topology" badge="3-Node Distributed" defaultOpen>
            <CodeBlock>{`CLIENT BROWSER ──[ HTTPS / REST ]──► RENDER CLOUD ──[ JDBC / TCP ]──► LINUX SERVER
Next.js UI                           Spring Boot (Docker)              PostgreSQL DB
Local Mac / Vercel                   Singapore Data Center             CentOS Host`}</CodeBlock>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {[
                { icon: <Globe className="h-4 w-4" />, label: 'Node 1 · Client', val: 'Next.js UI', sub: 'Local Mac / Vercel' },
                { icon: <Server className="h-4 w-4" />, label: 'Node 2 · API', val: 'Spring Boot', sub: 'Render · Singapore' },
                { icon: <Database className="h-4 w-4" />, label: 'Node 3 · DB', val: 'PostgreSQL 16', sub: 'CentOS Dedicated' },
              ].map(n => (
                <div key={n.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-blue-600">{n.icon}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{n.label}</span>
                  <span className="text-xs font-bold text-slate-800">{n.val}</span>
                  <span className="text-[10px] text-slate-500">{n.sub}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<GitBranch className="h-4 w-4" />} title="Monorepo Structure" badge="devKashifK/syncbook">
            <CodeBlock>{`syncbook/
├── frontend/                    # Next.js 15 (Turbopack)
│   └── src/
│       ├── app/                 # Pages & Layouts (App Router)
│       ├── components/          # Reusable UI Components
│       ├── store/boardStore.ts  # Zustand State Engine
│       └── lib/                 # API client, formatters, auth hook
│
└── backend/syncboard/           # Spring Boot 4 (Maven)
    ├── src/main/resources/
    │   └── application.properties
    ├── Dockerfile               # Multi-stage container build
    └── pom.xml                  # Maven dependencies`}</CodeBlock>
          </Section>

          <Section icon={<Container className="h-4 w-4" />} title="Docker — Multi-Stage Build" badge="Optimized Image">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Stage 1 — Build</p>
                <p className="text-xs text-slate-600 leading-relaxed">Uses <code className="bg-slate-200 px-1 rounded font-mono text-slate-700">maven:3.9.6-eclipse-temurin-21</code> to compile source into an executable <code className="bg-slate-200 px-1 rounded font-mono text-slate-700">.jar</code> via <code className="bg-slate-200 px-1 rounded font-mono text-slate-700">mvn clean package -DskipTests</code>.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Stage 2 — Runtime</p>
                <p className="text-xs text-slate-600 leading-relaxed">Drops Maven tooling. Uses lightweight <code className="bg-slate-200 px-1 rounded font-mono text-slate-700">eclipse-temurin:21-jre</code>. Only the compiled <code className="bg-slate-200 px-1 rounded font-mono text-slate-700">app.jar</code> is copied. Minimal final image.</p>
              </div>
            </div>
          </Section>

          <Section icon={<Settings2 className="h-4 w-4" />} title="Spring Boot Configuration" badge="application.properties">
            <CodeBlock>{`server.port=\${PORT:8092}
spring.datasource.url=jdbc:postgresql://<DB_HOST>:5432/syncboard_db
spring.datasource.username=syncboard_admin
spring.datasource.password=<SECURE_PASSWORD>
spring.jpa.hibernate.ddl-auto=update`}</CodeBlock>
            <div className="mt-1 space-y-0">
              <InfoRow label="Local (Mac)" value="Fallback :8092 → Apache Tomcat binds port 8092" />
              <InfoRow label="Production (Render)" value="${PORT} overrides fallback with Render's dynamic port" accent />
              <InfoRow label="DDL Strategy" value="Auto schema update on startup — no manual migrations" />
            </div>
          </Section>

          <Section icon={<Globe className="h-4 w-4" />} title="CORS Security" badge="Cross-Origin">
            <InfoRow label="Annotation" value="@CrossOrigin(origins = &quot;*&quot;)" accent />
            <InfoRow label="Scope" value="All REST controllers — accepts requests from any web origin" />
            <InfoRow label="Preflight" value="Browser sends OPTIONS to validate headers before actual payload" />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> Wildcard origin (<code className="bg-amber-100 px-1 rounded font-mono">*</code>) is suitable for development. Restrict to the deployed frontend domain for production hardening.
              </p>
            </div>
          </Section>

          <Section icon={<Shield className="h-4 w-4" />} title="PostgreSQL Auth — pg_hba.conf" badge="Host-Level Security">
            <CodeBlock>{`# TYPE  DATABASE        USER               ADDRESS       METHOD
  host  syncboard_db   syncboard_admin   0.0.0.0/0     md5`}</CodeBlock>
            <div className="mt-1 space-y-0">
              <InfoRow label="host" value="TCP/IP socket connections (remote, not local Unix socket)" />
              <InfoRow label="syncboard_db" value="Restricts access to this catalog — system tables blocked" />
              <InfoRow label="syncboard_admin" value="Binds rule to specific DB user role" />
              <InfoRow label="0.0.0.0/0" value="Required: Render uses rotating dynamic outbound IPs" accent />
              <InfoRow label="md5 / scram-sha-256" value="Cryptographic hash auth — rejects plaintext handshakes" />
            </div>
          </Section>

          <Section icon={<Zap className="h-4 w-4" />} title="State Management — Zustand" badge="boardStore.ts">
            <div className="space-y-0 mb-3">
              <InfoRow label="Library" value="Zustand — lightweight, no Context/Redux boilerplate" />
              <InfoRow label="Scope" value="Tasks, boards, active timers — client session only" />
              <InfoRow label="Pattern" value="Immutable state transitions via .map() spread updates" />
            </div>
            <CodeBlock>{`export type Task = {
  id: string;
  title: string;
  timerStatus: 'idle' | 'running' | 'completed'; // strict literal union
};

// Immutable state transition with explicit return type
tasks: board.tasks.map((task): Task => { ... })`}</CodeBlock>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Explicit <code className="bg-slate-100 px-1 rounded font-mono text-slate-700">: Task</code> annotation enforces literal type narrowing at compile time — preventing invalid <code className="bg-slate-100 px-1 rounded font-mono text-slate-700">timerStatus</code> values in production builds.
            </p>
          </Section>

          <Section icon={<Code2 className="h-4 w-4" />} title="Frontend Tech Stack" badge="Next.js 15">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Framework', val: 'Next.js 15 (App Router)' },
                { label: 'Bundler', val: 'Turbopack (dev)' },
                { label: 'Language', val: 'TypeScript 5' },
                { label: 'Styling', val: 'Tailwind CSS v4' },
                { label: 'State', val: 'Zustand' },
                { label: 'UI Primitives', val: 'shadcn/ui + Radix' },
                { label: 'Drag & Drop', val: '@hello-pangea/dnd' },
                { label: 'Auth', val: 'JWT (localStorage + cookie)' },
              ].map(r => <GridCard key={r.label} label={r.label} val={r.val} />)}
            </div>
          </Section>

          <Section icon={<Layers className="h-4 w-4" />} title="Backend Tech Stack" badge="Spring Boot 4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Framework', val: 'Spring Boot 4.0.6' },
                { label: 'Language', val: 'Java 21 (LTS)' },
                { label: 'Build Tool', val: 'Maven 3.9.6' },
                { label: 'ORM', val: 'Spring Data JPA / Hibernate' },
                { label: 'Database', val: 'PostgreSQL 16' },
                { label: 'Connection Pool', val: 'HikariCP (default)' },
                { label: 'Auth', val: 'Spring Security + JWT' },
                { label: 'Deployment', val: 'Render.com — Singapore' },
              ].map(r => <GridCard key={r.label} label={r.label} val={r.val} />)}
            </div>
          </Section>

          <Section icon={<Lock className="h-4 w-4" />} title="Authentication Flow" badge="JWT">
            <CodeBlock>{`1. POST /api/auth/login  →  { email, password }
2. Server validates credentials → signs JWT token
3. Client stores token in localStorage + cookie
4. All subsequent requests: Authorization: Bearer <token>
5. Server validates JWT signature on every protected endpoint
6. 401 response → client clears token + cookie → redirects to /login`}</CodeBlock>
            <div className="mt-1 space-y-0">
              <InfoRow label="Token Storage" value="localStorage (API calls) + cookie (route guard)" />
              <InfoRow label="Route Guard" value="(main)/layout.tsx checks token on every protected mount" />
              <InfoRow label="API Guard" value="api.ts clears token + cookie on any 401 response" />
            </div>
          </Section>

        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">devKashifK / syncbook · Distributed Monorepo</p>
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
