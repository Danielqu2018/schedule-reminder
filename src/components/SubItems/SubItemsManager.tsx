import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ScheduleSubItem } from '../../types/database';
import { useToast } from '../../hooks/useToast';
import './SubItemsManager.css';

interface SubItemsManagerProps {
  scheduleId: number;
  userId: string;
}

export default function SubItemsManager({ scheduleId, userId }: SubItemsManagerProps) {
  const [subItems, setSubItems] = useState<ScheduleSubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showSuccess, showError, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as ScheduleSubItem['status'],
  });

  useEffect(() => {
    loadSubItems();
  }, [scheduleId]);

  const loadSubItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedule_sub_items')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubItems(data || []);
    } catch (error) {
      console.error('加载子项目失败:', error);
      showError('加载子项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('请输入子项目标题');
      return;
    }

    try {
      if (editingId) {
        // 更新
        const { error } = await supabase
          .from('schedule_sub_items')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            status: formData.status,
          })
          .eq('id', editingId)
          .eq('user_id', userId);

        if (error) throw error;
        showSuccess('子项目更新成功');
      } else {
        // 新增
        const maxOrder = subItems.length > 0 
          ? Math.max(...subItems.map(item => item.order_index)) 
          : -1;

        const { error } = await supabase
          .from('schedule_sub_items')
          .insert({
            schedule_id: scheduleId,
            user_id: userId,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            status: formData.status,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
        showSuccess('子项目添加成功');
      }

      setFormData({ title: '', description: '', status: 'pending' });
      setShowAddForm(false);
      setEditingId(null);
      loadSubItems();
    } catch (error) {
      console.error('保存子项目失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试';
      showError(errorMessage);
    }
  };

  const handleEdit = (item: ScheduleSubItem) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status,
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个子项目吗？')) return;

    try {
      const { error } = await supabase
        .from('schedule_sub_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      showSuccess('子项目删除成功');
      loadSubItems();
    } catch (error) {
      console.error('删除子项目失败:', error);
      showError('删除失败，请重试');
    }
  };

  const handleStatusChange = async (id: number, newStatus: ScheduleSubItem['status']) => {
    try {
      const { error } = await supabase
        .from('schedule_sub_items')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      loadSubItems();
    } catch (error) {
      console.error('更新状态失败:', error);
      showError('更新状态失败');
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = subItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= subItems.length) return;

    const items = [...subItems];
    const [moved] = items.splice(currentIndex, 1);
    items.splice(newIndex, 0, moved);

    // 更新 order_index
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('schedule_sub_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('user_id', userId);
      }

      loadSubItems();
    } catch (error) {
      console.error('重新排序失败:', error);
      showError('重新排序失败');
    }
  };

  const getStatusLabel = (status: ScheduleSubItem['status']) => {
    const labels = {
      pending: '📋 待办',
      in_progress: '🔄 进行中',
      completed: '✅ 已完成',
      cancelled: '❌ 已取消',
    };
    return labels[status];
  };

  if (loading) {
    return <div className="sub-items-loading">加载子项目中...</div>;
  }

  return (
    <div className="sub-items-manager">
      <div className="sub-items-header">
        <h4>子项目</h4>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ title: '', description: '', status: 'pending' });
          }}
          className="btn-add-sub-item"
        >
          {showAddForm ? '取消' : '+ 添加子项目'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="sub-item-form">
          <div className="form-group">
            <label>子项目标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入子项目标题"
              required
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="输入子项目描述（可选）"
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="form-group">
            <label>状态</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ScheduleSubItem['status'] })
              }
            >
              <option value="pending">📋 待办</option>
              <option value="in_progress">🔄 进行中</option>
              <option value="completed">✅ 已完成</option>
              <option value="cancelled">❌ 已取消</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? '更新' : '添加'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ title: '', description: '', status: 'pending' });
              }}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {subItems.length === 0 ? (
        <div className="sub-items-empty">暂无子项目</div>
      ) : (
        <div className="sub-items-list">
          {subItems.map((item, index) => (
            <div key={item.id} className="sub-item-card">
              <div className="sub-item-header">
                <div className="sub-item-title-row">
                  <span className="sub-item-order">{index + 1}</span>
                  <h5>{item.title}</h5>
                  <span className={`sub-item-status-badge status-${item.status}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <div className="sub-item-actions">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as ScheduleSubItem['status'])
                    }
                    className="status-select-small"
                  >
                    <option value="pending">📋 待办</option>
                    <option value="in_progress">🔄 进行中</option>
                    <option value="completed">✅ 已完成</option>
                    <option value="cancelled">❌ 已取消</option>
                  </select>
                  <button
                    onClick={() => handleReorder(item.id, 'up')}
                    disabled={index === 0}
                    className="btn-reorder"
                    title="上移"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(item.id, 'down')}
                    disabled={index === subItems.length - 1}
                    className="btn-reorder"
                    title="下移"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-edit"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-delete"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {item.description && (
                <div className="sub-item-description">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
