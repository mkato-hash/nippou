import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import styles from '../../styles/report-detail.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

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
  comments: string;
  submittedAt: string;
}

export default function ReportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReport(response.data);
      try {
        const parsedComments = JSON.parse(response.data.comments || '[]');
        setComments(parsedComments);
      } catch {
        setComments([]);
      }
    } catch (err) {
      console.error('Error loading report:', err);
      setError('日報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/reports/${id}/comments`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(response.data.comments || []);
      setReport(response.data.report);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('コメントの追加に失敗しました');
    } finally {
      setSubmittingComment(false);
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

  if (error || !report) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error || '日報が見つかりません'}</div>
        <Link href="/dashboard" className={styles.backLink}>
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/logo.png" alt="ロゴ" className={styles.headerLogo} />
          <div>
            <h1>日報詳細</h1>
            <Link href="/dashboard" className={styles.backLink}>
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <div>
              <h2>{report.user.name}</h2>
              <p className={styles.email}>{report.user.email}</p>
            </div>
            <div className={styles.reportMeta}>
              <span className={styles.date}>{formatDate(report.submittedAt)}</span>
              {report.isRead && <span className={styles.readBadge}>既読</span>}
            </div>
          </div>

          <div className={styles.reportContent}>
            <section className={styles.section}>
              <h3>本日の研修内容</h3>
              <p>{report.trainingContent}</p>
            </section>

            <section className={styles.section}>
              <h3>進捗状況</h3>
              <p>{report.progressStatus}</p>
            </section>

            <section className={styles.section}>
              <h3>問題・困ったこと</h3>
              <p>{report.problems}</p>
            </section>

            <section className={styles.section}>
              <h3>明日の予定</h3>
              <p>{report.tomorrowPlan}</p>
            </section>
          </div>

          {/* コメントセクション */}
          <div className={styles.commentsSection}>
            <h3 className={styles.commentsTitle}>コメント</h3>

            {comments.length > 0 && (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentDate}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを入力してください..."
                rows={4}
                disabled={submittingComment}
                className={styles.commentInput}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className={styles.commentButton}
              >
                {submittingComment ? 'コメント送信中...' : 'コメントを送信'}
              </button>
            </form>
          </div>

          <div className={styles.footer}>
            <Link href="/dashboard" className={styles.returnButton}>
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
