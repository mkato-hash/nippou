import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import styles from '../../styles/submit.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function SubmitReport() {
  const router = useRouter();
  const [trainingContent, setTrainingContent] = useState('');
  const [progressStatus, setProgressStatus] = useState('');
  const [problems, setProblems] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE_URL}/reports`,
        {
          trainingContent,
          progressStatus,
          problems,
          tomorrowPlan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setTrainingContent('');
      setProgressStatus('');
      setProblems('');
      setTomorrowPlan('');

      setTimeout(() => {
        router.push('/trainee/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || '日報の提出に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>日報を提出する</h1>
          <Link href="/trainee/dashboard" className={styles.backLink}>
            ← ダッシュボードに戻る
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
        <div className={styles.card}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>日報が提出されました</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="training">本日の研修内容</label>
              <textarea
                id="training"
                value={trainingContent}
                onChange={(e) => setTrainingContent(e.target.value)}
                placeholder="今日学んだことや取り組んだ内容を記入してください"
                rows={5}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="progress">進捗状況</label>
              <textarea
                id="progress"
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
                placeholder="現在のプロジェクトやタスクの進捗を記入してください"
                rows={5}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="problems">問題・困ったこと</label>
              <textarea
                id="problems"
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                placeholder="本日の課題や困っていることを記入してください"
                rows={5}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tomorrow">明日の予定</label>
              <textarea
                id="tomorrow"
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                placeholder="明日の予定や目標を記入してください"
                rows={5}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? '提出中...' : '日報を提出する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
