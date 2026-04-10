import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/dashboard.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Report {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  trainingContent: string;
  progressStatus: string;
  problems: string;
  tomorrowPlan: string;
  isRead: boolean;
  submittedAt: string;
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadReports();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserName(userData.name);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsRead = async (reportId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${API_BASE_URL}/reports/${reportId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      loadReports();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/logo.png" alt="ロゴ" className={styles.headerLogo} />
          <div>
            <h1>日報管理ダッシュボード</h1>
            <p>こんにちは、{userName}さん</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          ログアウト
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.label}>総件数</span>
            <span className={styles.value}>{reports.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>未読</span>
            <span className={styles.value}>{reports.filter((r) => !r.isRead).length}</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : reports.length === 0 ? (
          <div className={styles.empty}>提出された日報がまだありません</div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report) => (
              <div key={report.id} className={`${styles.reportCard} ${!report.isRead ? styles.unread : ''}`}>
                <div className={styles.reportHeader}>
                  <div>
                    <h3>{report.user.name}</h3>
                    <p className={styles.email}>{report.user.email}</p>
                  </div>
                  <div className={styles.reportMeta}>
                    <span className={styles.date}>{formatDate(report.submittedAt)}</span>
                    {!report.isRead && <span className={styles.badge}>未読</span>}
                  </div>
                </div>

                <div className={styles.reportContent}>
                  <div className={styles.section}>
                    <h4>本日の研修内容</h4>
                    <p>{report.trainingContent}</p>
                  </div>
                  <div className={styles.section}>
                    <h4>進捗状況</h4>
                    <p>{report.progressStatus}</p>
                  </div>
                  <div className={styles.section}>
                    <h4>問題・困ったこと</h4>
                    <p>{report.problems}</p>
                  </div>
                  <div className={styles.section}>
                    <h4>明日の予定</h4>
                    <p>{report.tomorrowPlan}</p>
                  </div>
                </div>

                <div className={styles.reportFooter}>
                  <Link href={`/report/${report.id}`} className={styles.detailLink}>
                    詳細を見る
                  </Link>
                  {!report.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(report.id)}
                      className={styles.readBtn}
                    >
                      既読にする
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
