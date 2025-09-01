import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowModal(true);
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email": setError("Invalid email."); break;
        case "auth/user-disabled": setError("This account was disabled."); break;
        case "auth/user-not-found": setError("User not found."); break;
        case "auth/wrong-password": setError("Wrong password."); break;
        default: setError("Login error. Try again.");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate("/user-profile");
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="d-flex flex-column gap-2" style={{ width: 320 }}>
        <input type="email" placeholder="Email" className="border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="border p-2" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <div className="mt-2">
        <Link to="/reset">Forgot password?</Link>
      </div>
      {error && <p className="text-danger mt-2">{error}</p>}
      {showModal && <Modal message="Successfully logged in!" onClose={closeModal} />}
    </div>
  );
}

