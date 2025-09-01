import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, onSnapshot,
  serverTimestamp, runTransaction, query, orderBy, limit, onSnapshot as onSnap
} from 'firebase/firestore';

async function addHistory(uid, item) {
  // История лежит в users/{uid}/trades
  const tradesRef = collection(db, 'users', uid, 'trades');
  await addDoc(tradesRef, {
    ...item,
    ts: item.ts ?? Date.now(),
    createdAt: serverTimestamp()
  });
}

async function migrateUserDoc(userRef) {
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data() || {};
  const patch = {};
  if (typeof data.balance !== 'number') patch.balance = 10000;
  if (!Array.isArray(data.portfolio)) patch.portfolio = [];
  if (typeof data.lastAirdropAt !== 'number') patch.lastAirdropAt = Date.now();
  if (typeof data.welcomed !== 'boolean') patch.welcomed = false;
  if (typeof data.nickname !== 'string') patch.nickname = 'Новый трейдер';
  if (Object.keys(patch).length) await updateDoc(userRef, patch);
}

export async function ensureUserDoc(uid, nickname) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      nickname: nickname || 'Новый трейдер',
      balance: 10000,
      portfolio: [],
      createdAt: new Date().toISOString(),
      lastAirdropAt: Date.now(),
      welcomed: false,
      avatarUrl: ''
    });
    await addHistory(uid, { type: 'airdrop_start', amount: 10000, note: 'Стартовый баланс' });
  } else {
    await migrateUserDoc(userRef);
    if (nickname && snap.data()?.nickname !== nickname) {
      await updateDoc(userRef, { nickname });
    }
  }
  return userRef;
}

export function listenUserDoc(uid, cb) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => cb(snap.exists() ? snap.data() : null));
}

export async function getTrades(uid) {
  const tradesRef = collection(db, 'users', uid, 'trades');
  const snapshot = await getDocs(tradesRef);
  const trades = [];
  snapshot.forEach((d) => trades.push({ id: d.id, ...d.data() }));
  trades.sort((a, b) => b.ts - a.ts);
  return trades;
}

function upsertPosition(portfolio, symbol, deltaQty) {
  const list = [...(portfolio ?? [])];
  const i = list.findIndex(p => p.symbol === symbol);
  if (i === -1) {
    if (deltaQty <= 0) return list;
    list.push({ symbol, qty: Number(deltaQty) });
  } else {
    const newQty = Number(list[i].qty) + Number(deltaQty);
    if (newQty <= 0) list.splice(i, 1);
    else list[i] = { ...list[i], qty: newQty };
  }
  return list;
}

export async function buyAsset(uid, symbol, qty, price) {
  if (qty <= 0) throw new Error('Количество должно быть > 0');
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('Профиль не найден');
    const data = snap.data();
    const total = +(qty * price).toFixed(2);
    const nextBalance = +(data.balance - total).toFixed(2);
    if (nextBalance < -1000) throw new Error('Недостаточно средств: лимит долга -$1000.');
    const newPortfolio = upsertPosition(data.portfolio, symbol, qty);
    tx.update(userRef, { balance: nextBalance, portfolio: newPortfolio });
  });
  await addHistory(uid, { type: 'buy', symbol, qty: Number(qty), price: Number(price), total: +(qty * price).toFixed(2) });
  return { ok: true };
}

export async function sellAsset(uid, symbol, qty, price) {
  if (qty <= 0) throw new Error('Количество должно быть > 0');
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('Профиль не найден');
    const data = snap.data();
    const pos = (data.portfolio ?? []).find(p => p.symbol === symbol);
    if (!pos || pos.qty < qty) throw new Error('У вас нет достаточного количества этой монеты.');
    const total = +(qty * price).toFixed(2);
    const nextBalance = +(data.balance + total).toFixed(2);
    const newPortfolio = upsertPosition(data.portfolio, symbol, -qty);
    tx.update(userRef, { balance: nextBalance, portfolio: newPortfolio });
  });
  await addHistory(uid, { type: 'sell', symbol, qty: Number(qty), price: Number(price), total: +(qty * price).toFixed(2) });
  return { ok: true };
}

export async function airdropIfDue(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const now = Date.now();
  const last = data.lastAirdropAt ?? 0;

  const ONE_HOUR = 60 * 60 * 1000;

  if (now - last < ONE_HOUR) return null;

  const amount = 2000;
  const newBalance = +(Number(data.balance || 0) + amount).toFixed(2);

  await updateDoc(userRef, { balance: newBalance, lastAirdropAt: now });

  await addHistory(uid, { type: 'airdrop', amount, note: 'Периодическая выплата' });

  return { amount };
}


export async function setWelcomed(uid) {
  await updateDoc(doc(db, 'users', uid), { welcomed: true });
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateNickname(uid, nickname) {
  await updateDoc(doc(db, 'users', uid), { nickname });
  await addHistory(uid, { type: 'profile_update', note: 'Изменение ника', nickname });
  return { ok: true };
}

export function listenLeaderboard(cb, topN = 100) {
  const q = query(collection(db, 'users'), orderBy('balance', 'desc'), limit(topN));
  return onSnap(q, (snap) => {
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    cb(list);
  });
}


