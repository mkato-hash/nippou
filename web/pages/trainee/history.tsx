import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import styles from '../../styles/history.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Report {
  id: string;
  trainingContent: string;
  progressStatus: string;
  problems: string;
  tomorrowPlan: string;
  submittedAt: string;
}

export default function ReportHistory() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadReports();
  }, [router]);

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/reports/me/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError('日報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>過去の日報</h1>
          <Link href="/trainee/submit" className={styles.backLink}>
            ← 新しい日報を提出する
          </Link>
        </div>
        <button
          className={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            router.push('/login');
          }}
        >
          ログアウト
        </button>
      </div>

      <div className={styles.content}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {reports.length === 0 ? (
          <div className={styles.emptyMessage}>
            <p>提出した日報はまだありません</p>
            <Link href="/trainee/submit" className={styles.submitLink}>
              今すぐ日報を提出する
            </Link>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report) => (
              <div key={report.id} className={styles.reportItem}>
                <div
                  className={styles.reportHeader}
                  onClick={() =>
                    setExpandedId(expandedId === report.id ? null : report.id)
                  }
                >
                  <div className={styles.dateSection}>
                    <span className={styles.date}>
                      {formatDate(report.submittedAt)}
                    </span>
                  </div>
                  <span className={styles.toggleIcon}>
                    {expandedId === report.id ? '▼' : '▶'}
                  </span>
                </div>

                {expandedId === report.id && (
                  <div className={styles.reportContent}>
                    <div className={styles.section}>
                      <h3>本日の研修内容</h3>
                      <p>{report.trainingContent}</p>
                    </div>

                    <div className={styles.section}>
                      <h3>進捗状況</h3>
                      <p>{report.progressStatus}</p>
                    </div>

                    <div className={styles.section}>
                      <h3>問題・困ったこと</h3>
                      <p>{report.problems}</p>
                    </div>

                    <div className={styles.section}>
                      <h3>明日の予定</h3>
                      <p>{report.tomorrowPlan}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
