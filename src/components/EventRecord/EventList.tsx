import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TaskEvent, TaskEventFile } from '../../types/database';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getSignedFileUrl, formatFileSize, getFileIcon } from '../../utils/fileUpload';
import './EventList.css';

interface EventListProps {
  taskId: number;
  workItemId?: number;
  onEdit?: (event: TaskEvent) => void;
}

export default function EventList({ taskId, workItemId, onEdit }: EventListProps) {
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [eventFiles, setEventFiles] = useState<Record<number, TaskEventFile[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadEvents();
  }, [taskId, workItemId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('task_events')
        .select('*')
        .eq('task_id', taskId);

      if (workItemId) {
        query = query.eq('work_item_id', workItemId);
      }

      const { data, error } = await query.order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);

      // 加载所有事件的文件
      if (data && data.length > 0) {
        const eventIds = data.map(e => e.id);
        const { data: filesData } = await supabase
          .from('task_event_files')
          .select('*')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });

        if (filesData) {
          const filesMap: Record<number, TaskEventFile[]> = {};
          filesData.forEach(file => {
            if (!filesMap[file.event_id]) {
              filesMap[file.event_id] = [];
            }
            filesMap[file.event_id].push(file);
          });
          setEventFiles(filesMap);
        }
      }
    } catch (error) {
      console.error('加载事件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: '例会',
      activity: '活动',
      milestone: '里程碑',
      other: '其他',
    };
    return labels[type] || type;
  };

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      meeting: '📅',
      activity: '🎉',
      milestone: '🎯',
      other: '📝',
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="event-list-loading">
        <div className="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="event-list-empty">
        <p>暂无过程性成果记录</p>
        <p className="empty-hint">点击"记录事件"按钮开始记录</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map(event => {
        const isExpanded = expandedEvents.has(event.id);
        const files = eventFiles[event.id] || [];
        const participants = event.participants ? JSON.parse(event.participants) : [];

        return (
          <div key={event.id} className="event-card">
            <div className="event-card-header" onClick={() => toggleExpand(event.id)}>
              <div className="event-header-left">
                <span className="event-type-icon">{getEventTypeIcon(event.event_type)}</span>
                <div className="event-title-info">
                  <h4 className="event-title">{event.title}</h4>
                  <div className="event-meta">
                    <span className="event-type-badge">{getEventTypeLabel(event.event_type)}</span>
                    <span className="event-date">
                      {format(new Date(event.event_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </span>
                    {event.location && (
                      <span className="event-location">📍 {event.location}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="event-header-right">
                {files.length > 0 && (
                  <span className="file-count-badge">{files.length} 个文件</span>
                )}
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="event-card-content">
                {event.description && (
                  <div className="event-description">
                    <strong>描述：</strong>
                    <p>{event.description}</p>
                  </div>
                )}

                {participants.length > 0 && (
                  <div className="event-participants">
                    <strong>参与者：</strong>
                    <div className="participants-list">
                      {participants.map((userId: string) => (
                        <span key={userId} className="participant-tag">
                          {userId.slice(0, 8)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="event-files">
                    <strong>文件：</strong>
                    <div className="files-grid">
                      {files.map(file => (
                        <div key={file.id} className="file-card">
                          <div className="file-icon">{getFileIcon(file.mime_type)}</div>
                          <div className="file-info">
                            <div className="file-name" title={file.file_name}>
                              {file.file_name}
                            </div>
                            <div className="file-meta">
                              <span className="file-type">{file.file_type}</span>
                              {file.file_size && (
                                <span className="file-size">{formatFileSize(file.file_size)}</span>
                              )}
                            </div>
                          </div>
                          <a
                            href="#"
                            onClick={async (e) => {
                              e.preventDefault();
                              const url = await getSignedFileUrl(file.file_path);
                              if (url) window.open(url, '_blank');
                            }}
                            className="file-download-btn"
                            title="下载文件"
                          >
                            ⬇️
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {onEdit && (
                  <div className="event-actions">
                    <button
                      onClick={() => onEdit(event)}
                      className="btn-edit-event"
                    >
                      编辑
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
