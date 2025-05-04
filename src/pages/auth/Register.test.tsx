import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './Register';
import { MemoryRouter } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(() => ({}))
}));

// Mock firebase firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => 'mockedDocRef'),
  setDoc: vi.fn()
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock firebase config
vi.mock('../../config/firebase', () => ({
  auth: {}
}));

const renderRegisterPage = () => {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    renderRegisterPage();
    
    expect(screen.getByText('Join GlobeGuide')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    renderRegisterPage();
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles successful registration', async () => {
    // Mock successful user creation
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
      user: { uid: 'test-uid' }
    } as any);
    
    // Mock successful Firestore document creation
    vi.mocked(setDoc).mockResolvedValueOnce(undefined);
    
    renderRegisterPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check if createUserWithEmailAndPassword was called with correct arguments
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
    
    // Check if setDoc was called with correct arguments
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'mockedDocRef',
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          preferences: {
            theme: 'light',
            defaultView: 'grid'
          }
        })
      );
    });
  });

  it('displays error message on registration failure', async () => {
    // Mock failed user creation
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({
      message: 'Firebase: Email already in use.'
    });
    
    renderRegisterPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Email already in use.')).toBeInTheDocument();
    });
  });

  it('shows loading state during registration', async () => {
    // Create a promise that we can resolve later
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    // Mock user creation with our controlled promise
    vi.mocked(createUserWithEmailAndPassword).mockReturnValueOnce(promise as any);
    
    renderRegisterPage();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    
    // Check if loading state is shown
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    
    // Resolve the promise to complete the registration
    resolvePromise!({ user: { uid: 'test-uid' } });
  });
});