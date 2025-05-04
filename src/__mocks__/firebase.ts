// Mock for Firebase
export const mockAuth = {
  currentUser: null
};

export const mockFirestore = {};

export const mockSignOut = vi.fn(() => Promise.resolve());
export const mockSignIn = vi.fn(() => Promise.resolve({ user: { email: 'test@example.com' } }));
export const mockOnAuthStateChanged = vi.fn((auth, callback) => {
  // Immediately call with null user by default
  callback(null);
  // Return unsubscribe function
  return vi.fn();
});

// Export mock functions
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signOut: mockSignOut,
  signInWithEmailAndPassword: mockSignIn,
  onAuthStateChanged: mockOnAuthStateChanged
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn()
}));

vi.mock('../config/firebase', () => ({
  auth: mockAuth,
  db: mockFirestore
}));