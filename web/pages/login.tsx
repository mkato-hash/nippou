import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/auth.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type UserRole = 'TRAINEE' | 'MENTOR' | null;

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        const userRole = response.data.user.role;

        // 選択されたロールとログインユーザーのロールが一致しているか確認
        if (role === 'TRAINEE' && userRole !== 'TRAINEE') {
          setError('新人用のアカウントでログインしてください');
          setLoading(false);
          return;
        }

        if (role === 'MENTOR' && userRole !== 'MENTOR') {
          setError('メンター用のアカウントでログインしてください');
          setLoading(false);
          return;
        }

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (userRole === 'TRAINEE') {
          router.push('/trainee/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 役割選択画面
  if (!role) {
    return (
      <div className={styles.roleSelectionContainer}>
        <div className={styles.roleSelectionCard}>
          <h1 className={styles.roleTitle}>日報管理システム</h1>
          <p className={styles.roleSubtitle}>ログインする方を選択してください</p>

          <div className={styles.roleButtonsContainer}>
            <button
              onClick={() => setRole('TRAINEE')}
              className={`${styles.roleButton} ${styles.traineeButton}`}
            >
              <div className={styles.roleButtonIcon}>🎓</div>
              <div className={styles.roleButtonLabel}>新人として</div>
              <div className={styles.roleButtonSubtext}>日報を提出する</div>
            </button>

            <button
              onClick={() => setRole('MENTOR')}
              className={`${styles.roleButton} ${styles.mentorButton}`}
            >
              <div className={styles.roleButtonIcon}>👨‍🏫</div>
              <div className={styles.roleButtonLabel}>メンターとして</div>
              <div className={styles.roleButtonSubtext}>日報を確認する</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ログイン画面（役割別）
  const isTrainee = role === 'TRAINEE';
  const containerClassName = isTrainee
    ? styles.traineeLoginContainer
    : styles.mentorLoginContainer;
  const cardClassName = isTrainee ? styles.traineeCard : styles.mentorCard;

  return (
    <div className={containerClassName}>
      <div className={cardClassName}>
        <button
          onClick={() => setRole(null)}
          className={styles.backToRoleButton}
        >
          ← 戻る
        </button>

        <h1 className={styles.title}>
          {isTrainee ? '新人ログイン' : 'メンターログイン'}
        </h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
