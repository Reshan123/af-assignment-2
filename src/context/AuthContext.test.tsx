import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(() => ({}))
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no user'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides loading state initially', () => {
    // Don't call callback immediately to simulate loading state
    vi.mocked(onAuthStateChanged).mockImplementationOnce(() => {
      return () => {}; // Return unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('no user');
  });

  it('updates user state when auth state changes', async () => {
    // Setup mock to call with a user
    vi.mocked(onAuthStateChanged).mockImplementationOnce((auth, callback) => {
      // Use setTimeout to simulate async behavior
      setTimeout(() => {
        act(() => {
          callback({ email: 'test@example.com' } as any);
        });
      }, 0);
      return () => {}; // Return unsubscribe function
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    // Wait for the state to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toContain('test@example.com');
  });
});