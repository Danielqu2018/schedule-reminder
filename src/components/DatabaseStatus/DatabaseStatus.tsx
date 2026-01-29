import React, { useState, useEffect } from 'react';
import { checkPersonalScheduleTables } from '../../utils/databaseCheck';
import './DatabaseStatus.css';

interface DatabaseStatusProps {
  onDismiss?: () => void;
}

/**
 * 数据库状态检查组件
 * 在应用启动时检查必需的数据库表是否存在
 */
export default function DatabaseStatus({ onDismiss }: DatabaseStatusProps) {
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const result = await checkPersonalScheduleTables();
        setIsValid(result.isValid);
        setMessage(result.message);
      } catch (error) {
        setIsValid(false);
        setMessage('数据库检查失败，请检查网络连接');
      } finally {
        setChecking(false);
      }
    };

    checkDatabase();
  }, []);

  if (checking || isValid) {
    return null;
  }

  return (
    <div className="database-status-banner">
      <div className="database-status-content">
        <div className="database-status-icon">⚠️</div>
        <div className="database-status-text">
          <h3>数据库配置缺失</h3>
          <pre className="database-status-message">{message}</pre>
        </div>
        <div className="database-status-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              window.open('https://app.supabase.com', '_blank');
            }}
          >
            打开 Supabase Dashboard
          </button>
          {onDismiss && (
            <button className="btn-text" onClick={onDismiss}>
              稍后提醒
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
