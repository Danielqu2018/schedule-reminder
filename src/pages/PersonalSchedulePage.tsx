import React, { useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';
import { Schedule } from '../types/database';
import './PersonalSchedulePage.css';

export default function PersonalSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    status: 'pending' as Schedule['status'],
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('加载日程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('schedules').insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      setFormData({
        title: '',
        date: '',
        time: '',
        description: '',
        status: 'pending',
      });
      setShowForm(false);
      loadSchedules();
    } catch (error: any) {
      alert('添加失败: ' + error.message);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Schedule['status']) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadSchedules();
    } catch (error: any) {
      alert('更新失败: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个日程吗？')) return;

    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      loadSchedules();
    } catch (error: any) {
      alert('删除失败: ' + error.message);
    }
  };

  const getStatusLabel = (status: Schedule['status']) => {
    const labels = {
      pending: '📋 待办',
      in_progress: '🔄 进行中',
      completed: '✅ 已完成',
      cancelled: '❌ 已取消',
    };
    return labels[status];
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="personal-schedule-page">
      <div className="page-header">
        <h2>个人日程管理</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? '取消' : '+ 添加日程'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-row">
            <div className="form-group">
              <label>标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>状态</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Schedule['status'] })
                }
              >
                <option value="pending">📋 待办</option>
                <option value="in_progress">🔄 进行中</option>
                <option value="completed">✅ 已完成</option>
                <option value="cancelled">❌ 已取消</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>日期 *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>时间 *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>

          <button type="submit" className="submit-btn">
            添加日程
          </button>
        </form>
      )}

      <div className="schedules-grid">
        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>暂无日程安排，点击上方按钮开始记录</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="schedule-card fade-in">
              <div className="schedule-header">
                <h3>{schedule.title}</h3>
                <span className={`status-badge status-${schedule.status}`}>
                  {getStatusLabel(schedule.status)}
                </span>
              </div>
              
              <div className="schedule-info">
                <div className="info-row">
                  <span className="info-icon">🕒</span>
                  <span>{schedule.date} {schedule.time}</span>
                </div>
                {schedule.description && (
                  <div className="info-row description">
                    <p>{schedule.description}</p>
                  </div>
                )}
              </div>

              <div className="schedule-footer">
                <select
                  value={schedule.status}
                  onChange={(e) =>
                    handleStatusChange(schedule.id, e.target.value as Schedule['status'])
                  }
                  className="status-select-premium"
                >
                  <option value="pending">📋 待办</option>
                  <option value="in_progress">🔄 进行中</option>
                  <option value="completed">✅ 已完成</option>
                  <option value="cancelled">❌ 已取消</option>
                </select>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="btn-delete-icon"
                  title="删除日程"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
