import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import styles from '../../styles/trainee-dashboard.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

interface Report {
  id: string;
  trainingContent: string;
  progressStatus: string;
  problems: string;
  tomorrowPlan: string;
  comments: string;
  submittedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function TraineeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        router.push('/login');
      }
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>ダッシュボード</h1>
          <p className={styles.welcome}>
            {user && `${user.name}さん、こんにちは`}
          </p>
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
        {/* アクションボタン */}
        <div className={styles.actionBar}>
          <Link href="/trainee/submit" className={styles.submitButton}>
            <span className={styles.buttonIcon}>➕</span>
            日報を登録する
          </Link>
        </div>

        {/* 統計情報 */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>提出済み日報</div>
            <div className={styles.statValue}>{reports.length}</div>
          </div>
        </div>

        {/* 日報一覧 */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingMessage}>読み込み中...</div>
        ) : reports.length === 0 ? (
          <div className={styles.emptyMessage}>
            <p>まだ日報を提出していません</p>
            <Link href="/trainee/submit" className={styles.emptySubmitButton}>
              最初の日報を提出する
            </Link>
          </div>
        ) : (
          <div className={styles.reportsList}>
            <h2 className={styles.reportsTitle}>提出済み日報一覧</h2>
            {reports.map((report) => {
              let comments: Comment[] = [];
              try {
                comments = JSON.parse(report.comments || '[]');
              } catch {
                comments = [];
              }
              const hasComments = comments.length > 0;

              return (
                <div key={report.id} className={styles.reportItem}>
                  <div
                    className={styles.reportHeader}
                    onClick={() =>
                      setExpandedId(expandedId === report.id ? null : report.id)
                    }
                  >
                    <div className={styles.reportHeaderLeft}>
                      <span className={styles.date}>
                        {formatDate(report.submittedAt)}
                      </span>
                      {hasComments && (
                        <span className={styles.commentBadge}>
                          💬 コメント {comments.length}
                        </span>
                      )}
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

                      {hasComments && (
                        <div className={styles.commentsSection}>
                          <h3 className={styles.commentsTitle}>
                            メンターからのコメント
                          </h3>
                          <div className={styles.commentsList}>
                            {comments.map((comment) => (
                              <div key={comment.id} className={styles.comment}>
                                <div className={styles.commentDate}>
                                  {formatDate(comment.createdAt)}
                                </div>
                                <p className={styles.commentText}>
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
