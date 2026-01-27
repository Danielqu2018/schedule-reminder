import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Team, TeamMember, WorkGroup } from '../types/database';
import './TeamManagementPage.css';

export default function TeamManagementPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'groups'>('members');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showManageGroup, setShowManageGroup] = useState<number | null>(null);
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
  const [inviteUserId, setInviteUserId] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (memberError) throw memberError;
      setMembers(memberData || []);

      const { data: groupData, error: groupError } = await supabase
        .from('work_groups')
        .select('*')
        .eq('team_id', teamId);

      if (groupError) throw groupError;
      setWorkGroups(groupData || []);

    } catch (error: any) {
      console.error('加载团队数据失败:', error);
      alert(`加载失败: ${error.message}`);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('work_groups')
        .insert({
          team_id: parseInt(teamId!),
          name: groupFormData.name,
          description: groupFormData.description,
        });

      if (error) throw error;

      setGroupFormData({ name: '', description: '' });
      setShowGroupForm(false);
      loadTeamData();
    } catch (error: any) {
      alert(`创建失败: ${error.message}`);
    }
  };

  const handleManageGroup = async (groupId: number) => {
    try {
      const { data, error } = await supabase
        .from('work_group_members')
        .select('user_id')
        .eq('work_group_id', groupId);
      
      if (error) throw error;
      setGroupMembers(data.map(m => m.user_id));
      setShowManageGroup(groupId);
    } catch (error: any) {
      alert(`获取成员失败: ${error.message}`);
    }
  };

  const toggleGroupMember = async (userId: string) => {
    if (!showManageGroup) return;

    const isMember = groupMembers.includes(userId);
    try {
      if (isMember) {
        await supabase
          .from('work_group_members')
          .delete()
          .eq('work_group_id', showManageGroup)
          .eq('user_id', userId);
        setGroupMembers(prev => prev.filter(id => id !== userId));
      } else {
        await supabase
          .from('work_group_members')
          .insert({
            work_group_id: showManageGroup,
            user_id: userId
          });
        setGroupMembers(prev => [...prev, userId]);
      }
    } catch (error: any) {
      alert(`操作失败: ${error.message}`);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!inviteUserId.trim()) return;

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: parseInt(teamId!),
          user_id: inviteUserId.trim(),
          role: 'member'
        });

      if (error) throw error;

      setInviteUserId('');
      setShowInviteForm(false);
      loadTeamData();
      alert('邀请成功！');
    } catch (error: any) {
      alert(`邀请失败: ${error.message}`);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!team) return <div>未找到团队信息</div>;

  return (
    <div className="team-management-page fade-in">
      <div className="team-header-premium">
        <button onClick={() => navigate('/teams')} className="back-link">
          ← 返回团队列表
        </button>
        <div className="team-title-row">
          <h1>{team.name}</h1>
          <div className="team-stats-mini">
            <span>👥 {members.length} 成员</span>
            <span>📦 {workGroups.length} 工作组</span>
          </div>
        </div>
        <p className="team-desc-premium">{team.description || '项目协作团队'}</p>
      </div>

      <div className="management-tabs-premium">
        <button 
          className={`tab-btn-premium ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          团队成员
        </button>
        <button 
          className={`tab-btn-premium ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          工作组架构
        </button>
      </div>

      <div className="tab-content-premium">
        {activeTab === 'members' ? (
          <div className="members-section-premium">
            <div className="section-header-premium">
              <h3>核心成员</h3>
              <button className="btn-primary-small" onClick={() => setShowInviteForm(!showInviteForm)}>
                {showInviteForm ? '取消邀请' : '+ 邀请成员'}
              </button>
            </div>

            {showInviteForm && (
              <form onSubmit={handleInviteMember} className="invite-form-premium card slide-in">
                <div className="form-group">
                  <label>用户唯一标识 (UUID)</label>
                  <input 
                    type="text" 
                    value={inviteUserId}
                    onChange={(e) => setInviteUserId(e.target.value)}
                    required
                    className="input-field"
                    placeholder="粘贴成员的用户 ID"
                  />
                  <p className="hint">提示：成员可以在其个人中心获取该 ID</p>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>确认添加成员</button>
              </form>
            )}

            <div className="members-grid-premium">
              {members.map(member => (
                <div key={member.id} className="member-card-premium card">
                  <div className="member-avatar-premium">{member.user_id.slice(0, 2).toUpperCase()}</div>
                  <div className="member-info-premium">
                    <h4>ID: {member.user_id.slice(0, 8)}...</h4>
                    <span className={`role-badge role-${member.role}`}>{member.role}</span>
                  </div>
                  <div className="member-joined">加入日期: {new Date(member.joined_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="groups-section-premium">
            <div className="section-header-premium">
              <h3>工作组</h3>
              <button onClick={() => setShowGroupForm(!showGroupForm)} className="btn-primary-small">
                {showGroupForm ? '取消创建' : '+ 新建工作组'}
              </button>
            </div>

            {showGroupForm && (
              <form onSubmit={handleCreateGroup} className="group-form-premium card slide-in">
                <div className="form-group">
                  <label>工作组名称 *</label>
                  <input 
                    type="text" 
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    required
                    className="input-field"
                    placeholder="例如：后端研发组"
                  />
                </div>
                <div className="form-group">
                  <label>职能描述</label>
                  <textarea 
                    value={groupFormData.description}
                    onChange={(e) => setGroupFormData({...groupFormData, description: e.target.value})}
                    className="input-field"
                    placeholder="描述该工作组的主要职责..."
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>立即创建</button>
              </form>
            )}

            <div className="groups-grid-premium">
              {workGroups.length === 0 ? (
                <p className="empty-msg">暂无工作组，开始创建一个吧！</p>
              ) : (
                workGroups.map(group => (
                  <div key={group.id} className="group-card-premium card">
                    <div className="group-card-header">
                      <h4>{group.name}</h4>
                      <button className="manage-btn" onClick={() => handleManageGroup(group.id)}>配置成员</button>
                    </div>
                    <p className="group-desc">{group.description || '暂无职能描述'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showManageGroup && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in">
            <div className="modal-header">
              <h3>管理工作组成员</h3>
              <button className="close-btn" onClick={() => setShowManageGroup(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-hint">选择要加入此工作组的团队成员：</p>
              <div className="member-selector-list">
                {members.map(m => (
                  <label key={m.id} className="selector-item">
                    <input 
                      type="checkbox" 
                      checked={groupMembers.includes(m.user_id)}
                      onChange={() => toggleGroupMember(m.user_id)}
                    />
                    <div className="selector-info">
                      <span className="selector-name">用户 {m.user_id.slice(0, 8)}</span>
                      <span className="selector-role">{m.role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowManageGroup(null)}>完成配置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

