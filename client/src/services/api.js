const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://autograph-9cm9.onrender.com' : '');
const API_BASE = `${BASE_URL}/api/signatures`;

export async function fetchSignatures(limit = 20, cursor = null) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch signatures');
  }
  return res.json(); // { items: [...], nextCursor: '...' }
}

export async function getSignatureById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Signature not found');
  }
  return res.json(); // { id, name, style, seed, settings, version, createdAt }
}

export async function createSignature(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to publish signature'));
  }
  return data; // { message: "Signature created successfully", id: "..." }
}
