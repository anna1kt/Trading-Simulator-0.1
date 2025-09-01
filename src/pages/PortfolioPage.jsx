import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { listenUserDoc } from '../store/storage';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const unsub = listenUserDoc(uid, (data) => {
      if (!data) return;
      setBalance(data.balance ?? 0);
      setPortfolio(data.portfolio ?? []);
    });
    return () => unsub();
  }, [auth]);

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Мой портфель</h2>
        <div className="text-end">
          <div className="small text-secondary">Баланс</div>
          <div className="h5">${Number(balance).toFixed(2)}</div>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <p className="text-secondary">Портфель пуст</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>Тикер</th>
                <th className="text-end">Количество</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.symbol}</td>
                  <td className="text-end">{Number(item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}






