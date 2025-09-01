import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { updateNickname } from '../store/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile as updateAuthProfile } from 'firebase/auth';

function Avatar({ url, size = 96 }) {
  return url ? (
    <img
      src={url}
      alt="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #334155',
        boxShadow: '0 8px 30px rgba(0,0,0,.35)'
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'conic-gradient(from 180deg, #f87171, #f59e0b, #22d3ee, #8b5cf6, #f87171)',
        padding: 3,
        boxShadow: '0 8px 30px rgba(0,0,0,.35)'
      }}
      aria-label="avatar placeholder"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontWeight: 700,
          fontSize: 28
        }}
      >
        👤
      </div>
    </div>
  );
}

const githubAvatars = [
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%201.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%202.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%203.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%204.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%205.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%206.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%207.jpg',
  'https://raw.githubusercontent.com/anna1kt/Trading-Simulator/52432c7c1e0cb12e28c6a7cfd1cd7071fa2ec9da/avatars%201/picture%208.jpg',
];

export default function UserProfile() {
  const u = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState(u?.email || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!u) return;
    const userRef = doc(db, 'users', u.uid);

    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setNickname(data.nickname || '');
      setAvatarUrl(data.avatarUrl || '');
      setSelectedAvatar(data.avatarUrl || '');
      setLoading(false);
    });

    return () => unsub();
  }, [u?.uid]);

  const saveNickname = async () => {
    if (!u) return;
    await updateNickname(u.uid, nickname.trim());
    try { await updateAuthProfile(u, { displayName: nickname.trim() || null }); } catch {}
    showMsg('Никнейм обновлён');
  };

  const saveAvatar = async () => {
    if (!u || !selectedAvatar) return;
    try {
      await updateDoc(doc(db, 'users', u.uid), { avatarUrl: selectedAvatar });
      try { await updateAuthProfile(u, { photoURL: selectedAvatar }); } catch {}
      setAvatarUrl(selectedAvatar);
      showMsg('Аватар обновлён');
    } catch (e) {
      console.error(e);
      showMsg('Ошибка при сохранении аватара');
    }
  };

  const changePassword = async () => {
    if (!u) return;
    const newPass = prompt('Введите новый пароль (мин. 6 символов):');
    if (!newPass) return;
    try {
      try {
        await updatePassword(u, newPass);
      } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
          const currentPass = prompt('Повторная аутентификация: введите текущий пароль:');
          if (!currentPass) return;
          const cred = EmailAuthProvider.credential(u.email, currentPass);
          await reauthenticateWithCredential(u, cred);
          await updatePassword(u, newPass);
        } else {
          throw err;
        }
      }
      showMsg('Пароль обновлён');
    } catch (e) {
      alert('Ошибка смены пароля: ' + e.message);
    }
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2000);
  };

  if (!u) return <div className="alert alert-warning">Требуется вход.</div>;
  if (loading) return <div className="text-secondary">Загрузка…</div>;

  return (
    <div className="card p-3" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-4">
        <Avatar url={avatarUrl} size={96} />
        <div className="text-center text-md-start">
          <h3 className="mb-1">{nickname || 'Без никнейма'}</h3>
          <div className="text-secondary">{email}</div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <div className="card p-3 h-100">
            <h5 className="mb-3">Никнейм</h5>
            <div className="d-flex gap-2">
              <input className="form-control" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <button className="btn btn-primary" onClick={saveNickname}>Сохранить</button>
            </div>
            <div className="small text-secondary mt-2">Отображается в лидерборде и истории.</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card p-3 h-100">
            <h5 className="mb-3">Безопасность</h5>
            <div className="d-flex flex-column gap-2">
              <div>
                <div className="small text-secondary mb-1">Почта</div>
                <input className="form-control" value={email} disabled readOnly />
              </div>
              <button className="btn btn-outline-secondary" onClick={changePassword}>Сменить пароль</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <h5 className="mb-3">Выберите аватар</h5>
        <div className="d-flex flex-wrap gap-2">
          {githubAvatars.map((url) => (
            <img
              key={url}
              src={url}
              alt="avatar"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                cursor: "pointer",
                objectFit: "cover",
                border: selectedAvatar === url ? "3px solid #0d6efd" : "2px solid #ccc",
                transition: "transform 0.2s",
              }}
              onClick={() => setSelectedAvatar(url)}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            />
          ))}
        </div>
        <button className="btn btn-success mt-2" onClick={saveAvatar}>Сохранить аватар</button>
      </div>

      {msg && <div className="alert alert-success py-2 mt-3">{msg}</div>}
    </div>
  );
}









