import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import Modal from "./Modal";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Некорректный email.");
          break;
        case "auth/user-not-found":
          setError("Пользователь с таким email не найден.");
          break;
        default:
          setError("Ошибка при сбросе пароля.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "70vh" }}>
      <h1 className="text-2xl mb-4">Сброс пароля</h1>
      {success ? (
        <Modal
          message="Письмо для сброса пароля отправлено на ваш email!"
          onClose={() => setSuccess(false)}
        />
      ) : (
        <form onSubmit={handleReset} className="d-flex flex-column gap-2" style={{ width: 320 }}>
          <input
            type="email"
            placeholder="Введите email"
            className="border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Отправить письмо</button>
        </form>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
      <div className="mt-2">
        <Link to="/login">Вернуться к входу</Link>
      </div>
    </div>
  );
}