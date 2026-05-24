# Diferenças dos últimos 2 commits

---

## Commit: df84db9961bcd83df35ae090da65bbe381bcd2ca
Mensagem: feat: implementação de trial user para simular block de features para usuario nao assinante

```diff
-      >
-        <Menu size={22} />
-      </button>
-
-      {/* Search */}
-      <ProcessSearchInput
-        value={searchQuery}
-        onChange={setSearchQuery}
-        onSubmit={handleSearchSubmit}
-        placeholder="Buscar por número do processo, autor ou réu..."
-        className="flex flex-1 max-w-xl gap-2"
-        inputClassName="bg-slate-50"
-        buttonClassName="hidden sm:inline-flex"
-      />
-
-      <div className="flex-1" />
-
-      {/* API Status — reage ao mock SSE automaticamente */}
-      <div className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${apiColor[apiStatus]}`}>
-        {apiStatus === 'disconnected'
-          ? <AlertTriangle size={13} />
-          : <span className={`w-2 h-2 rounded-full ${apiDot[apiStatus]}`} />}
-        {apiLabel[apiStatus]}
-      </div>
-
-      {/* Notificações */}
-      <button
-        type="button"
-        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
-        aria-label="Notificações"
-      >
-        <Bell size={19} />
-        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
-      </button>
-
-      {/* Perfil */}
-      <div ref={profileMenuRef} className="relative">
-        <button
-          type="button"
-          onClick={() => setProfileOpen((p) => !p)}
-          aria-haspopup="menu"
-          aria-expanded={profileOpen}
-          aria-controls="profile-menu"
-          className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
-        >
-          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
-            {initials}
-          </div>
-          <div className="hidden sm:block text-left">
-            <p className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</p>
-            <p className="text-[10px] text-slate-400 leading-tight">{displayOab}</p>
-          </div>
-          <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
-        </button>
-
-        {profileOpen && (
-          <div
-            id="profile-menu"
-            role="menu"
-            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
-          >
-            <div className="px-4 pb-2 mb-1 border-b border-slate-100">
-              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
-              <p className="text-xs text-slate-500">{displayOab}</p>
-            </div>
-            {([
-              ['/configuracoes/assistente', Settings,    'Configurações do assistente'],
-              ['/configuracoes/perfil',     UserRound,   'Meu perfil'],
-              ['/configuracoes/plano-faturamento', CreditCard, 'Plano e faturamento'],
-              ['/configuracoes/seguranca',  ShieldCheck, 'Segurança'],
-              ['/configuracoes/ajuda',      LifeBuoy,    'Central de ajuda'],
-            ] as const).map(([path, Icon, label]) => (
-              <button
-                key={path}
-                type="button"
-                role="menuitem"
-                onClick={() => nav(path)}
-                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
-              >
-                <Icon size={15} />
-                <span className="flex-1">{label}</span>
-              </button>
-            ))}
-            <div className="h-px bg-slate-100 my-1" />
-            <button
-              type="button"
-              role="menuitem"
-              onClick={onLogout}
-              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
-            >
-              <LogOut size={15} />
-              <span className="flex-1">Sair da conta</span>
-            </button>
-          </div>
-        )}
-      </div>
-    </header>
-  );
-});
+diff --git a/front-end/src/layouts/AppLayout.tsx b/front-end/src/layouts/AppLayout.tsx
+deleted file mode 100644
+index 0fc9d42..0000000
+--- a/front-end/src/layouts/AppLayout.tsx
++++ /dev/null
+@@ -1,106 +0,0 @@
+ -/**
+ - * AppLayout — estrutura base de todas as telas internas do Lex.
+ - *
+ - * Refatorado para:
+ - *   - AppHeader isolado em src/layouts/AppHeader.tsx (memo)
+ - *   - AppSidebar isolado em src/layouts/AppSidebar.tsx (memo)
+ - *   - apiStatus vem do hook useApiStatus (SSE mock) — removido do prop
+ - *   - AppLayout agora é responsável APENAS por orquestrar layout e estado
+ - *     de abertura da sidebar mobile
+ - */
+ -
+ -import { useState, type ReactNode } from 'react';
+ -import { useNavigate, useLocation } from 'react-router-dom';
+ -import { X } from 'lucide-react';
+ -import { useAuth } from '../hooks/useAuth';
+ -import { authService } from '../services/authService';
+ -import { AppHeader } from './AppHeader';
+ -import { AppSidebar } from './AppSidebar';
+ -
+ -interface AppLayoutProps {
+ -  children: ReactNode;
+ -}
+ -
+ -export function AppLayout({ children }: AppLayoutProps) {
+ -  const navigate  = useNavigate();
+ -  const location  = useLocation();
+ -  const { user, logout } = useAuth();
+ -  const [sidebarOpen, setSidebarOpen] = useState(false);
+ -
+ -  const displayName = user?.fullName?.trim() ?? '';
+ -  const displayOab  = user?.oab?.trim()      ?? '';
+ -  const initials    = displayName
+ -    .split(' ')
+ -    .slice(0, 2)
+ -    .map((n) => n[0] ?? '')
+ -    .join('')
+ -    .toUpperCase();
+ -
+ -  async function handleLogout() {
+ -    try { await authService.logout(); } catch (e) { console.error(e); }
+ -    logout();
+ -    setSidebarOpen(false);
+ -    navigate('/login');
+ -    window.scrollTo({ top: 0 });
+ -  }
+ -
+ -  function handleSidebarNavigate(path: string) {
+ -    navigate(path);
+ -    setSidebarOpen(false);
+ -  }
+ -
+ -  return (
+ -    <div className="flex h-screen bg-slate-50 overflow-hidden">
+ -
+ -      {/* Sidebar desktop */}
+ -      <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col bg-slate-900">
+ -        <AppSidebar
+ -          pathname={location.pathname}
+ -          onNavigate={handleSidebarNavigate}
+ -          onLogout={handleLogout}
+ -        />
+ -      </aside>
+ -
+ -      {/* Sidebar mobile drawer */}
+ -      {sidebarOpen && (
+ -        <>
+ -          <div
+ -            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
+ -            onClick={() => setSidebarOpen(false)}
+ -          />
+ -          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 flex flex-col">
+ -            <div className="flex justify-end p-4">
+ -              <button
+ -                type="button"
+ -                onClick={() => setSidebarOpen(false)}
+ -                className="text-slate-400 hover:text-white transition-colors"
+ -                aria-label="Fechar menu"
+ -              >
+ -                <X size={22} />
+ -              </button>
+ -            </div>
+ -            <AppSidebar
+ -              pathname={location.pathname}
+ -              onNavigate={handleSidebarNavigate}
+ -              onLogout={handleLogout}
+ -            />
+ -          </aside>
+ -        </>
+ -      )}
+ -
+ -      {/* Coluna principal */}
+ -      <div className="flex flex-col flex-1 min-w-0">
+ -        <AppHeader
+ -          displayName={displayName}
+ -          displayOab={displayOab}
+ -          initials={initials}
+ -          onOpenSidebar={() => setSidebarOpen(true)}
+ -          onLogout={handleLogout}
+ -        />
+ -        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
+ -          {children}
+ -        </main>
+ -      </div>
+ -    </div>
+ -  );
+ -}
+```

---

## Commit: d4c0ea058236b61c9ef91a55d0bbb936df93dbb9
Mensagem: refactor: isolamento de estilo em componentes styles.ts

```diff
+ */
+
+import { useState, type ReactNode } from 'react';
+import { useNavigate, useLocation } from 'react-router-dom';
+import { X } from 'lucide-react';
+import { useAuth } from '../../hooks/useAuth';
+import { authService } from '../../services/authService';
+import { AppHeader } from '../AppHeader';
+import { AppSidebar } from '../AppSidebar';
+import * as S from './styles';
+
+interface AppLayoutProps {
+  children: ReactNode;
+}
+
+export function AppLayout({ children }: AppLayoutProps) {
+  const navigate  = useNavigate();
+  const location  = useLocation();
+  const { user, logout } = useAuth();
+  const [sidebarOpen, setSidebarOpen] = useState(false);
+
+  const displayName = user?.fullName?.trim() ?? '';
+  const displayOab  = user?.oab?.trim()      ?? '';
+  const initials    = displayName
+    .split(' ')
+    .slice(0, 2)
+    .map((n) => n[0] ?? '')
+    .join('')
+    .toUpperCase();
+
+  async function handleLogout() {
+    try { await authService.logout(); } catch (e) { console.error(e); }
+    logout();
+    setSidebarOpen(false);
+    navigate('/login');
+    window.scrollTo({ top: 0 });
+  }
+
+  function handleSidebarNavigate(path: string) {
+    navigate(path);
+    setSidebarOpen(false);
+  }
+
+  return (
+    <S.Shell>
+      <S.DesktopSidebar>
+        <AppSidebar
+          pathname={location.pathname}
+          onNavigate={handleSidebarNavigate}
+          onLogout={handleLogout}
+        />
+      </S.DesktopSidebar>
+
+      {sidebarOpen && (
+        <>
+          <S.MobileBackdrop onClick={() => setSidebarOpen(false)} />
+          <S.MobileSidebar>
+            <S.MobileCloseRow>
+              <S.MobileCloseButton
+                type="button"
+                onClick={() => setSidebarOpen(false)}
+                aria-label="Fechar menu"
+              >
+                <X size={22} />
+              </S.MobileCloseButton>
+            </S.MobileCloseRow>
+            <AppSidebar
+              pathname={location.pathname}
+              onNavigate={handleSidebarNavigate}
+              onLogout={handleLogout}
+            />
+          </S.MobileSidebar>
+        </>
+      )}
+
+      <S.MainColumn>
+        <AppHeader
+          displayName={displayName}
+          displayOab={displayOab}
+          initials={initials}
+          onOpenSidebar={() => setSidebarOpen(true)}
+          onLogout={handleLogout}
+        />
+        <S.Main>{children}</S.Main>
+      </S.MainColumn>
+    </S.Shell>
+  );
+}
+
+diff --git a/front-end/src/layouts/AppLayout/styles.ts b/front-end/src/layouts/AppLayout/styles.ts
+new file mode 100644
+index 0000000..557d8ff
+--- /dev/null
++++ b/front-end/src/layouts/AppLayout/styles.ts
+@@ -0,0 +1,92 @@
+ import styled from 'styled-components';
+ 
+ export const Shell = styled.div`
+   display: flex;
+   height: 100vh;
+   overflow: hidden;
+   background: #f8fafc;
+ `;
+ 
+ export const DesktopSidebar = styled.aside`
+   display: none;
+   width: 14rem;
+   flex-shrink: 0;
+   flex-direction: column;
+   background: #0f172a;
+ 
+   @media (min-width: 1024px) {
+     display: flex;
+   }
+ 
+   @media (min-width: 1280px) {
+     width: 15rem;
+   }
+ `;
+
+ ... (arquivo truncado neste resumo)
+
```

---

> Observação: o segundo diff é extenso e alguns arquivos gerados foram truncados no bloco acima por brevidade; o arquivo completo contém todos os trechos de diff retornados pelo comando `git show`.
