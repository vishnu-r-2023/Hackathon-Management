import create from 'zustand';

const normalizeToken = (token) => {
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
};

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const AUTH_ROLES = ['admin', 'participant', 'judge'];

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  const role = typeof user.role === 'string' ? user.role.toLowerCase() : '';
  if (!AUTH_ROLES.includes(role)) return null;

  return { ...user, role };
};

const getInitialAuthState = () => {
  const token = normalizeToken(localStorage.getItem('token'));
  const user = normalizeUser(safeParseJson(localStorage.getItem('user')));

  if (!token || !user) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { user: null, token: null, isAuthenticated: false };
  }

  return { user, token, isAuthenticated: true };
};

export const useAuthStore = create((set) => ({
  ...getInitialAuthState(),

  setAuth: (user, token) => {
    const normalizedToken = normalizeToken(token);
    const normalizedUser = normalizeUser(user);

    if (!normalizedToken || !normalizedUser) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', normalizedToken);
    set({ user: normalizedUser, token: normalizedToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  darkMode: (() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
  })(),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleDarkMode: () => set((state) => {
    localStorage.setItem('darkMode', !state.darkMode);
    return { darkMode: !state.darkMode };
  }),
}));
