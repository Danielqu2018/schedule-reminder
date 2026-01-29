import { supabase } from '../lib/supabaseClient';

/**
 * 数据库表检查结果
 */
export interface TableCheckResult {
  exists: boolean;
  tableName: string;
  error?: string;
}

/**
 * 检查数据库表是否存在
 * @param tableName 表名
 * @returns 检查结果
 */
export async function checkTableExists(tableName: string): Promise<TableCheckResult> {
  try {
    // 尝试查询表（使用 limit 0 避免实际获取数据）
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    if (error) {
      // 检查是否是表不存在的错误
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          exists: false,
          tableName,
          error: `表 '${tableName}' 不存在`,
        };
      }
      // 其他错误（如权限问题）
      return {
        exists: false,
        tableName,
        error: error.message || '未知错误',
      };
    }

    return {
      exists: true,
      tableName,
    };
  } catch (err) {
    return {
      exists: false,
      tableName,
      error: err instanceof Error ? err.message : '检查失败',
    };
  }
}

/**
 * 检查所有必需的表是否存在
 * @param tableNames 表名数组
 * @returns 检查结果数组
 */
export async function checkRequiredTables(
  tableNames: string[]
): Promise<TableCheckResult[]> {
  const results = await Promise.all(
    tableNames.map((tableName) => checkTableExists(tableName))
  );
  return results;
}

/**
 * 获取缺失表的友好错误消息
 * @param results 检查结果数组
 * @returns 错误消息
 */
export function getMissingTablesMessage(results: TableCheckResult[]): string {
  const missingTables = results.filter((r) => !r.exists);
  
  if (missingTables.length === 0) {
    return '';
  }

  const tableList = missingTables.map((r) => `- ${r.tableName}`).join('\n');
  
  return `数据库表缺失！\n\n缺失的表：\n${tableList}\n\n` +
    `请按照以下步骤修复：\n` +
    `1. 访问 Supabase Dashboard → SQL Editor\n` +
    `2. 执行相应的 SQL 脚本创建缺失的表\n` +
    `3. 个人日程功能：执行 docs/sql/CREATE_SCHEDULES_TABLE.sql\n` +
    `4. 团队功能：执行 docs/sql/TEAM_DATABASE_COMPLETE.sql\n` +
    `5. 刷新页面重试`;
}

/**
 * 检查个人日程功能所需的表
 */
export async function checkPersonalScheduleTables(): Promise<{
  isValid: boolean;
  message: string;
}> {
  const results = await checkRequiredTables(['schedules']);
  const missing = results.filter((r) => !r.exists);
  
  if (missing.length > 0) {
    return {
      isValid: false,
      message: getMissingTablesMessage(results),
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}
