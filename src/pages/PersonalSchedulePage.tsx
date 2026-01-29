import React, { useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';
import { Schedule } from '../types/database';
import { useToast } from '../hooks/useToast';
import { validateLength, validateDateRange } from '../utils/validation';
import { checkPersonalScheduleTables, getMissingTablesMessage } from '../utils/databaseCheck';
import ProgressUpdateModal from '../components/ProgressUpdate/ProgressUpdateModal';
import SubItemsManager from '../components/SubItems/SubItemsManager';
import './PersonalSchedulePage.css';

export default function PersonalSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const { showSuccess, showError, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
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
        .order('start_date', { ascending: true, nullsLast: true })
        .order('end_date', { ascending: true, nullsLast: true });

      if (error) {
        // 检查是否是表不存在的错误
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          const checkResult = await checkPersonalScheduleTables();
          if (!checkResult.isValid) {
            showError(checkResult.message);
            return;
          }
        }
        throw error;
      }
      setSchedules(data || []);
    } catch (error) {
      console.error('加载日程失败:', error);
      const errorMessage = error instanceof Error ? error.message : '加载日程失败，请刷新页面重试';
      
      // 如果是表不存在的错误，提供更详细的提示
      if (errorMessage.includes('schema cache') || errorMessage.includes('PGRST205')) {
        const checkResult = await checkPersonalScheduleTables();
        showError(checkResult.isValid ? errorMessage : checkResult.message);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const titleValidation = validateLength(formData.title, 1, 100, '标题');
    if (!titleValidation.isValid) {
      showError(titleValidation.error || '验证失败');
      return;
    }

    const descriptionValidation = validateLength(formData.description || '', 0, 500, '描述');
    if (!descriptionValidation.isValid) {
      showError(descriptionValidation.error || '验证失败');
      return;
    }

    // 验证日期范围
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        showError('计划完成日期不能早于计划启动日期');
        return;
      }
    }

    if (!formData.start_date) {
      showError('请选择计划启动日期');
      return;
    }

    if (submitting) return; // 防止重复提交
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showError('请先登录');
        return;
      }

      const { error } = await supabase.from('schedules').insert({
        title: formData.title,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date, // 如果没有结束日期，使用开始日期
        description: formData.description || null,
        status: formData.status,
        user_id: user.id,
      });

      if (error) {
        // 检查是否是表不存在的错误
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          const checkResult = await checkPersonalScheduleTables();
          if (!checkResult.isValid) {
            showError(checkResult.message);
            return;
          }
        }
        throw error;
      }

      setFormData({
        title: '',
        start_date: '',
        end_date: '',
        description: '',
        status: 'pending',
      });
      setShowForm(false);
      showSuccess('日程添加成功！');
      loadSchedules();
    } catch (error) {
      console.error('添加日程失败:', error);
      let errorMessage = error instanceof Error ? error.message : '添加失败，请重试';
      
      // 如果是表不存在的错误，提供更详细的提示
      if (errorMessage.includes('schema cache') || errorMessage.includes('PGRST205')) {
        const checkResult = await checkPersonalScheduleTables();
        errorMessage = checkResult.isValid ? errorMessage : checkResult.message;
      }
      
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: Schedule['status']) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      showSuccess('状态更新成功');
      loadSchedules();
    } catch (error) {
      console.error('更新状态失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个日程吗？')) return;

    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      showSuccess('日程删除成功');
      loadSchedules();
    } catch (error) {
      console.error('删除日程失败:', error);
      const errorMessage = error instanceof Error ? error.message : '删除失败，请重试';
      showError(errorMessage);
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
    <div className="personal-schedule-page material-texture">
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
              <label>计划启动日期 *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>计划完成日期</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
              <small className="form-hint">不填写则默认为启动日期</small>
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

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? '添加中...' : '添加日程'}
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
                  <span className="info-icon">📅</span>
                  <span>
                    启动: {schedule.start_date || schedule.date || '未设置'}
                    {schedule.end_date && schedule.end_date !== schedule.start_date && (
                      <> | 完成: {schedule.end_date}</>
                    )}
                  </span>
                </div>
                {schedule.description && (
                  <div className="info-row description">
                    <p>{schedule.description}</p>
                  </div>
                )}
                
                {/* 完成率显示 */}
                {(schedule.progress !== undefined && schedule.progress !== null) && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">完成率</span>
                      <span className="progress-percentage">{schedule.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${schedule.progress}%` }}
                      />
                    </div>
                    {schedule.last_progress_update_at && (
                      <div className="progress-update-time">
                        最后更新: {new Date(schedule.last_progress_update_at).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 子项目管理 */}
                <SubItemsManager
                  scheduleId={schedule.id}
                  userId={schedule.user_id}
                />
              </div>

              <div className="schedule-footer">
                <div className="footer-left">
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
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowProgressModal(true);
                    }}
                    className="btn-update-progress"
                    title="更新进展"
                  >
                    📊 更新进展
                  </button>
                </div>
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
      
      {selectedSchedule && (
        <ProgressUpdateModal
          schedule={selectedSchedule}
          isOpen={showProgressModal}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedSchedule(null);
          }}
          onUpdate={() => {
            loadSchedules();
          }}
        />
      )}
      
      <ToastContainer />
    </div>
  );
}
