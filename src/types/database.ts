// 数据库类型定义

export interface User {
  id: string;
  email?: string;
}

// 个人版本 - Schedule
export interface Schedule {
  id: number;
  user_id: string;
  title: string;
  start_date: string; // 计划启动日期
  end_date: string; // 计划完成日期
  date?: string; // 保留字段，兼容旧数据
  time?: string; // 保留字段，兼容旧数据
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number; // 0-100 完成率
  last_progress_update_at?: string; // 最后更新进展的时间
  updated_at?: string; // 最后更新时间
  created_at: string;
}

// 个人日程子项目
export interface ScheduleSubItem {
  id: number;
  schedule_id: number;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  order_index: number;
  created_at: string;
  updated_at: string;
}

// 个人日程进展更新记录
export interface ScheduleProgressUpdate {
  id: number;
  schedule_id: number;
  user_id: string;
  progress: number; // 0-100
  update_content: string; // 进展更新内容
  created_at: string;
}

// 团队版本 - Team
export interface Team {
  id: number;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

// 团队成员
export interface TeamMember {
  id: number;
  team_id: number;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// 工作组
export interface WorkGroup {
  id: number;
  team_id: number;
  name: string;
  description?: string;
  leader_id?: string;
  created_at: string;
}

// 工作组成员
export interface WorkGroupMember {
  id: number;
  work_group_id: number;
  user_id: string;
  joined_at: string;
}

// 任务
export interface Task {
  id: number;
  team_id: number;
  work_group_id?: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 工作子项
export interface WorkItem {
  id: number;
  task_id: number;
  title: string;
  description?: string;
  execution_order: 'parallel' | 'sequential';
  sequence_number: number;
  planned_start_time?: string;
  duration_hours?: number;
  planned_end_time?: string;
  assignee_id?: string;
  collaborators?: string; // JSON数组
  objectives?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
  progress: number; // 0-100
  actual_start_time?: string;
  actual_end_time?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 工作子项状态历史
export interface WorkItemStatusHistory {
  id: number;
  work_item_id: number;
  status: string;
  progress: number;
  changed_by: string;
  changed_at: string;
}

// 任务评论
export interface TaskComment {
  id: number;
  task_id?: number;
  work_item_id?: number;
  user_id: string;
  content: string;
  created_at: string;
}

// 团队邀请
export interface TeamInvitation {
  id: number;
  team_id: number;
  email: string;
  invited_by: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// 任务事件（过程性成果记录）
export interface TaskEvent {
  id: number;
  task_id: number;
  work_item_id?: number;
  event_type: 'meeting' | 'activity' | 'milestone' | 'other';
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  participants?: string; // JSON数组
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 事件文件
export interface TaskEventFile {
  id: number;
  event_id: number;
  file_type: 'photo' | 'document' | 'meeting_minutes' | 'result_file' | 'other';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  created_at: string;
}
