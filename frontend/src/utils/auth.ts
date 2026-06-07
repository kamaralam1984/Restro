export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('restro-user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restro-token');
}

export function logout() {
  localStorage.removeItem('restro-token');
  localStorage.removeItem('restro-user');
  window.location.href = '/login';
}

export function isLoggedIn() {
  return !!getStoredToken();
}
