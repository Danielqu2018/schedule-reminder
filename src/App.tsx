import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Component, ReactNode } from 'react';
import { supabase } from './lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// 页面组件
import LoginPage from './pages/LoginPage';
import PersonalSchedulePage from './pages/PersonalSchedulePage';
import TeamOverviewPage from './pages/TeamOverviewPage';
import TeamManagementPage from './pages/TeamManagementPage';
import TaskManagementPage from './pages/TaskManagementPage';
import WorkItemPage from './pages/WorkItemPage';
import StatisticsPage from './pages/StatisticsPage';

// 布局组件
import Layout from './components/Layout/Layout';
import { useReminderEngine } from './hooks/useReminderEngine';

// Error Boundary 组件
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>出错了</h2>
          <p>很抱歉，应用程序发生了预期外的错误。</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动全局提醒引擎
  useReminderEngine(user?.id);


  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-main)',
        gap: '20px'
      }}>
        <div className="loading-spinner" style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid var(--primary-glow)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ProjectFlow 正在启动...</div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route
          path="/"
          element={user ? <Layout user={user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<PersonalSchedulePage />} />
          <Route path="teams" element={<TeamOverviewPage />} />
          <Route path="teams/:teamId" element={<TeamManagementPage />} />
          <Route path="tasks" element={<TaskManagementPage />} />
          <Route path="work-items" element={<WorkItemPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

