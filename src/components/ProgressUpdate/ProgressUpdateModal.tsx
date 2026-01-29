import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Schedule, ScheduleProgressUpdate } from '../../types/database';
import { useToast } from '../../hooks/useToast';
import './ProgressUpdateModal.css';

interface ProgressUpdateModalProps {
  schedule: Schedule;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProgressUpdateModal({
  schedule,
  isOpen,
  onClose,
  onUpdate,
}: ProgressUpdateModalProps) {
  const [progress, setProgress] = useState(schedule.progress || 0);
  const [updateContent, setUpdateContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progressHistory, setProgressHistory] = useState<ScheduleProgressUpdate[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { showSuccess, showError, ToastContainer } = useToast();

  useEffect(() => {
    if (isOpen) {
      setProgress(schedule.progress || 0);
      setUpdateContent('');
      loadProgressHistory();
    }
  }, [isOpen, schedule.id]);

  const loadProgressHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('schedule_progress_updates')
        .select('*')
        .eq('schedule_id', schedule.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProgressHistory(data || []);
    } catch (error) {
      console.error('加载进展历史失败:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateContent.trim()) {
      showError('请输入进展更新内容');
      return;
    }

    if (progress < 0 || progress > 100) {
      showError('完成率必须在 0-100 之间');
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showError('请先登录');
        return;
      }

      // 插入进展更新记录
      const { error: insertError } = await supabase
        .from('schedule_progress_updates')
        .insert({
          schedule_id: schedule.id,
          user_id: user.id,
          progress: progress,
          update_content: updateContent.trim(),
        });

      if (insertError) throw insertError;

      // 如果完成率达到 100%，自动更新状态为已完成
      if (progress === 100 && schedule.status !== 'completed') {
        await supabase
          .from('schedules')
          .update({ status: 'completed' })
          .eq('id', schedule.id);
      } else if (progress > 0 && schedule.status === 'pending') {
        // 如果开始有进展，自动更新状态为进行中
        await supabase
          .from('schedules')
          .update({ status: 'in_progress' })
          .eq('id', schedule.id);
      }

      showSuccess('进展更新成功！');
      setUpdateContent('');
      loadProgressHistory();
      onUpdate();
    } catch (error) {
      console.error('更新进展失败:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="progress-update-modal-overlay" onClick={onClose}>
      <div className="progress-update-modal" onClick={(e) => e.stopPropagation()}>
        <div className="progress-update-modal-header">
          <h3>更新进展 - {schedule.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="progress-update-form">
          <div className="form-group">
            <label>
              完成率 <span className="progress-display">{progress}%</span>
            </label>
            <div className="progress-input-group">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="progress-slider"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const value = Math.max(0, Math.min(100, Number(e.target.value)));
                  setProgress(value);
                }}
                className="progress-number-input"
              />
            </div>
            <div className="progress-bar-preview">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>进展更新内容 *</label>
            <textarea
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              placeholder="请详细描述本次进展更新，包括完成的工作、遇到的问题、下一步计划等..."
              rows={6}
              maxLength={1000}
              required
              className="update-content-textarea"
            />
            <div className="char-count">{updateContent.length}/1000</div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '提交中...' : '提交更新'}
            </button>
          </div>
        </form>

        <div className="progress-history-section">
          <h4>进展历史</h4>
          {loadingHistory ? (
            <div className="loading">加载中...</div>
          ) : progressHistory.length === 0 ? (
            <div className="empty-history">暂无进展更新记录</div>
          ) : (
            <div className="progress-history-list">
              {progressHistory.map((update) => (
                <div key={update.id} className="progress-history-item">
                  <div className="history-item-header">
                    <span className="history-progress">{update.progress}%</span>
                    <span className="history-date">
                      {new Date(update.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="history-content">{update.update_content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}
