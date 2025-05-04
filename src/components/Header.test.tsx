import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  signOut: vi.fn(() => Promise.resolve()),
  getAuth: vi.fn(() => ({}))
}));

// Mock firebase config
vi.mock('../config/firebase', () => ({
  auth: {}
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when not logged in', () => {
    // Mock the useAuth hook to return no user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Check if logo is rendered
    expect(screen.getByText(/GlobeGuide/i)).toBeInTheDocument();
    
    // Check if login and signup links are rendered
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('renders correctly when logged in', () => {
    // Mock the useAuth hook to return a user
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Check if user initial is displayed (the component shows 'test' instead of full email)
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    // Mock signOut function
    vi.mocked(signOut).mockResolvedValue(undefined);

    // Mock the useAuth hook to return a user
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Find and click the user menu button (using 'test' instead of full email)
    const userButton = screen.getByText('test');
    fireEvent.click(userButton);
    
    // Find and click the logout button
    const logoutButton = screen.getByText(/Sign out/i);
    fireEvent.click(logoutButton);
    
    // Check if signOut was called
    expect(signOut).toHaveBeenCalled();
  });
});