import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Modal from "./Modal";

export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      if (nickname) {
        try {
          await updateProfile(userCred.user, { displayName: nickname });
        } catch (err) {
          console.warn('updateProfile failed:', err);
        }
      }

      const userRef = doc(db, 'users', userCred.user.uid);
      await setDoc(userRef, {
        nickname: nickname || '',
        email,
        balance: 10000,
        createdAt: serverTimestamp(),
      });

      setShowModal(true);
    } catch (err) {
      alert('Registration error: ' + err.message);
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/dashboard');
  };

  return (
    <>
      <form onSubmit={handleRegister} className="card p-3" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2 className="mb-3">Register</h2>
        <input type="text" placeholder="Username" className="input mb-2" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input type="email" placeholder="Email" className="input mb-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="input mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
      {showModal && <Modal message="You have successfully registered!" onClose={closeModal} />}
    </>
  );
}




