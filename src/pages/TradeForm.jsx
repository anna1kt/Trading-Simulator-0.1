import React, { useState } from 'react';

export default function TradeForm({ price = 0, onTrade }) {
  const [qty, setQty] = useState(1);
  const total = (Number(qty) * Number(price) || 0).toFixed(2);

  const step = 0.1;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="p-2">
      <div className="mb-2">Текущая цена: <b>${price ? Number(price).toFixed(2) : '--'}</b></div>

      <div className="qty-control mb-2">
        <button type="button" onClick={() => setQty(q => Math.max(0, q - step))}>–</button>
        <input type="number" value={qty} onChange={e => setQty(+e.target.value)} />
        <button type="button" onClick={() => setQty(q => q + step)}>+</button>
      </div>

      <div className="mb-2">Сумма: <b>${total}</b></div>

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-success flex-fill" onClick={() => onTrade('buy', Number(qty))}>🟢 Купить</button>
        <button type="button" className="btn btn-danger flex-fill" onClick={() => onTrade('sell', Number(qty))}>🔴 Продать</button>
      </div>
    </form>
  );
}