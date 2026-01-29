import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TaskEvent, TaskEventFile } from '../../types/database';
import { useToast } from '../../hooks/useToast';
import { uploadFile, deleteFile, formatFileSize, getFileIcon, getSignedFileUrl } from '../../utils/fileUpload';
import './EventRecordModal.css';

interface EventRecordModalProps {
  taskId: number;
  workItemId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: TaskEvent; // 编辑模式时传入
}

export default function EventRecordModal({
  taskId,
  workItemId,
  isOpen,
  onClose,
  onSuccess,
  event,
}: EventRecordModalProps) {
  const [formData, setFormData] = useState({
    event_type: 'meeting' as 'meeting' | 'activity' | 'milestone' | 'other',
    title: '',
    description: '',
    event_date: new Date().toISOString().slice(0, 16),
    location: '',
    participants: [] as string[],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<TaskEventFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ user_id: string; email?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, ToastContainer } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      if (event) {
        // 编辑模式
        setFormData({
          event_type: event.event_type,
          title: event.title,
          description: event.description || '',
          event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
          location: event.location || '',
          participants: event.participants ? JSON.parse(event.participants) : [],
        });
        loadEventFiles();
      } else {
        // 新建模式
        setFormData({
          event_type: 'meeting',
          title: '',
          description: '',
          event_date: new Date().toISOString().slice(0, 16),
          location: '',
          participants: [],
        });
        setFiles([]);
        setUploadedFiles([]);
      }
    }
  }, [isOpen, event]);

  const loadTeamMembers = async () => {
    try {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('team_id')
        .eq('id', taskId)
        .single();

      if (taskData?.team_id) {
        const { data: members } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', taskData.team_id);

        if (members) {
          // 简化处理：只存储 user_id，前端显示时使用 user_id
          setTeamMembers(members.map(m => ({ user_id: m.user_id })));
        }
      }
    } catch (error) {
      console.error('加载团队成员失败:', error);
    }
  };

  const loadEventFiles = async () => {
    if (!event) return;
    try {
      const { data, error } = await supabase
        .from('task_event_files')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('加载事件文件失败:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeUploadedFile = async (file: TaskEventFile) => {
    try {
      // 删除数据库记录
      const { error: dbError } = await supabase
        .from('task_event_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // 删除存储文件
      await deleteFile(file.file_path);

      setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id));
      showSuccess('文件已删除');
    } catch (error) {
      console.error('删除文件失败:', error);
      showError('删除文件失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError('请输入事件标题');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('请先登录');
        return;
      }

      let eventId: number;

      if (event) {
        // 更新事件
        const { data, error } = await supabase
          .from('task_events')
          .update({
            event_type: formData.event_type,
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            location: formData.location,
            participants: JSON.stringify(formData.participants),
          })
          .eq('id', event.id)
          .select()
          .single();

        if (error) throw error;
        eventId = data.id;
      } else {
        // 创建新事件
        const { data, error } = await supabase
          .from('task_events')
          .insert({
            task_id: taskId,
            work_item_id: workItemId || null,
            event_type: formData.event_type,
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            location: formData.location,
            participants: JSON.stringify(formData.participants),
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        eventId = data.id;
      }

      // 上传新文件
      if (files.length > 0) {
        setUploading(true);
        for (const file of files) {
          const fileType = file.type.startsWith('image/') ? 'photo' : 
                          file.type === 'application/pdf' ? 'meeting_minutes' :
                          file.type.includes('document') ? 'document' : 'other';
          
          const result = await uploadFile(file, eventId, fileType);
          if (result.success && result.filePath) {
            // 保存文件记录到数据库
            await supabase
              .from('task_event_files')
              .insert({
                event_id: eventId,
                file_type: fileType,
                file_name: file.name,
                file_path: result.filePath,
                file_size: file.size,
                mime_type: file.type,
                uploaded_by: user.id,
              });
          }
        }
        setUploading(false);
      }

      showSuccess(event ? '事件已更新' : '事件已创建');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('保存事件失败:', error);
      showError(error instanceof Error ? error.message : '保存事件失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="event-record-modal-overlay" onClick={onClose}>
        <div className="event-record-modal" onClick={(e) => e.stopPropagation()}>
          <div className="event-record-modal-header">
            <h3>{event ? '编辑事件' : '记录过程性成果'}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="event-record-form">
            <div className="form-group">
              <label>事件类型 *</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                required
              >
                <option value="meeting">例会</option>
                <option value="activity">活动</option>
                <option value="milestone">里程碑</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="form-group">
              <label>事件标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：项目启动会、产品发布会等"
                required
              />
            </div>

            <div className="form-group">
              <label>事件描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述事件内容、讨论要点、成果等"
                rows={4}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>事件时间 *</label>
                <input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>地点</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：会议室A、线上会议等"
                />
              </div>
            </div>

            <div className="form-group">
              <label>参与者</label>
              <div className="participants-selector">
                {teamMembers.map(member => (
                  <label key={member.user_id} className="participant-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.participants.includes(member.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            participants: [...formData.participants, member.user_id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            participants: formData.participants.filter(id => id !== member.user_id),
                          });
                        }
                      }}
                    />
                    <span>{member.email || member.user_id.slice(0, 8)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>上传文件</label>
              <div className="file-upload-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-upload"
                >
                  + 选择文件
                </button>
                <span className="file-hint">支持照片、会议纪要、成果文件等（最大10MB）</span>
              </div>

              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span>{getFileIcon(file.type)} {file.name} ({formatFileSize(file.size)})</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="btn-remove-file"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files-list">
                  <div className="uploaded-files-header">已上传的文件：</div>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="file-item uploaded">
                      <span>{getFileIcon(file.mime_type)} {file.file_name} ({formatFileSize(file.file_size || 0)})</span>
                      <div className="file-actions">
                        <a
                          href="#"
                          onClick={async (e) => {
                            e.preventDefault();
                            const url = await getSignedFileUrl(file.file_path);
                            if (url) window.open(url, '_blank');
                          }}
                          className="btn-view-file"
                        >
                          查看
                        </a>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(file)}
                          className="btn-remove-file"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={submitting || uploading}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || uploading}
              >
                {uploading ? '上传中...' : submitting ? '保存中...' : event ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
