// 文件上传工具函数
import { supabase } from '../lib/supabaseClient';

const STORAGE_BUCKET = 'task-event-files';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * 上传文件到 Supabase Storage
 * @param file 要上传的文件
 * @param eventId 事件ID（用于组织文件路径）
 * @param fileType 文件类型
 * @returns 上传结果
 */
export async function uploadFile(
  file: File,
  eventId: number,
  fileType: 'photo' | 'document' | 'meeting_minutes' | 'result_file' | 'other'
): Promise<UploadResult> {
  try {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`,
      };
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${eventId}/${fileName}`;

    // 上传文件
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('文件上传失败:', error);
      return {
        success: false,
        error: error.message || '文件上传失败',
      };
    }

    return {
      success: true,
      filePath: data.path,
    };
  } catch (error) {
    console.error('上传文件时发生错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取文件的公开URL
 * @param filePath 文件路径
 * @returns 文件的公开URL
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * 获取文件的签名URL（用于私有文件）
 * @param filePath 文件路径
 * @param expiresIn 过期时间（秒），默认3600
 * @returns 签名URL
 */
export async function getSignedFileUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('获取签名URL失败:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('获取签名URL时发生错误:', error);
    return null;
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 * @returns 是否成功
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('删除文件失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除文件时发生错误:', error);
    return false;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 获取文件类型图标
 * @param mimeType MIME类型
 * @returns 图标名称或emoji
 */
export function getFileIcon(mimeType?: string): string {
  if (!mimeType) return '📄';
  
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
  
  return '📄';
}
