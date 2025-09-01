import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("balance", "desc")); 
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setUsers(arr);
    });
    return () => unsub();
  }, []);

  if (!users.length) return <div className="text-center py-4">Нет пользователей для отображения…</div>;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4 text-center">🏆 Лидерборд</h1>

      {/* Главный лидер */}
      <div className="card mb-4 shadow-sm p-3 text-center">
        <h5 className="mb-2">🥇 Лидер</h5>
        <div className="d-flex align-items-center justify-content-center gap-3">
          {users[0].avatarUrl ? (
            <img
              src={users[0].avatarUrl}
              alt=""
              className="rounded-circle border border-warning"
              style={{ width: "64px", height: "64px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white border border-warning"
              style={{ width: "64px", height: "64px", fontSize: "28px" }}
            >
              👤
            </div>
          )}
          <div>
            <div className="fw-bold fs-5">{users[0].nickname || "Без имени"}</div>
            <div className="text-secondary">${users[0].balance?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Все пользователи */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Игрок</th>
              <th scope="col">Баланс</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i === 0 ? "table-warning fw-bold" : ""}>
                <td>{i + 1}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className="rounded-circle border"
                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ width: "32px", height: "32px" }}
                      >
                        👤
                      </div>
                    )}
                    <span>{u.nickname || "Без имени"}</span>
                  </div>
                </td>
                <td className="fw-semibold">${u.balance?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}




