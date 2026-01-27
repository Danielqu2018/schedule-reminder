import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Team } from '../types/database';
import './TeamOverviewPage.css';
import { useNavigate } from 'react-router-dom';

export default function TeamOverviewPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch teams where user is a member (通过 team_members 表关联查询)
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // 提取团队数据（team_members 查询返回的是嵌套结构）
      const teamsData = (data || [])
        .map((item: any) => item.teams)
        .filter((team: any) => team !== null);
      
      setTeams(teamsData);
    } catch (error) {
      console.error('加载团队失败:', error);
      alert('加载团队失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('请先登录');
        return;
      }

      // 1. Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          description: formData.description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // 2. Add creator as owner in team_members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadTeams();
    } catch (error: any) {
      console.error('创建团队失败:', error);
      const errorMessage = error.message || '创建团队失败，请重试';
      alert(`创建团队失败: ${errorMessage}`);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="team-overview-page">
      <div className="page-header">
        <h2>团队概览</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? '取消' : '+ 创建团队'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateTeam} className="team-form">
          <div className="form-group">
            <label>团队名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              placeholder="输入团队名称"
            />
          </div>
          <div className="form-group">
            <label>团队描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="简单介绍一下团队"
            />
          </div>
          <button type="submit" className="submit-btn">
            立即创建
          </button>
        </form>
      )}

      <div className="teams-grid">
        {teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <p>您还没有加入任何团队</p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px', color: 'var(--text-muted)' }}>点击右上角按钮创建一个吧！</p>
          </div>
        ) : (
          teams.map((team) => (
            <div 
              key={team.id} 
              className="team-card fade-in"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="team-role-badge">成员</span>
              </div>
              <p>{team.description || '暂无团队描述...'}</p>
              <div className="team-footer">
                <div className="team-meta-item">
                  <span>📅</span>
                  <span>{new Date(team.created_at).toLocaleDateString()}</span>
                </div>
                <button className="view-team-btn">进入团队 ❯</button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
