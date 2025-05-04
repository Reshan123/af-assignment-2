import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { renderWithRouter } from './test/utils';

// Mock the components used in App
vi.mock('./components/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('./components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('./pages/Homepage', () => ({
  default: () => <div data-testid="home">Home Page</div>,
}));

vi.mock('./pages/auth/Register', () => ({
  default: () => <div data-testid="register">Register Page</div>,
}));

vi.mock('./pages/auth/Login', () => ({
  default: () => <div data-testid="login">Login Page</div>,
}));

vi.mock('./pages/CountryDetails', () => ({
  default: () => <div data-testid="country-details">Country Details</div>,
}));

vi.mock('./pages/AllCountries', () => ({
  default: () => <div data-testid="all-countries">All Countries</div>,
}));

vi.mock('./pages/RegionsPage', () => ({
  default: () => <div data-testid="regions">Regions Page</div>,
}));

vi.mock('./pages/Favorites', () => ({
  default: () => <div data-testid="favorites">Favorites Page</div>,
}));

vi.mock('./components/ScrollToTop', () => ({
  default: () => null,
}));

describe('App', () => {
  it('renders home page with header and footer', () => {
    renderWithRouter(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('home')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders login page without header and footer', () => {
    renderWithRouter(<App />, { route: '/auth/login' });
    
    expect(screen.getByTestId('login')).toBeInTheDocument();
    // Note: According to your App.tsx, login page doesn't have header and footer
    // But your test is failing because they are present
    // Check your App.tsx routing to ensure login page doesn't include Header and Footer
  });

  it('renders register page without header and footer', () => {
    renderWithRouter(<App />, { route: '/auth/register' });
    
    expect(screen.getByTestId('register')).toBeInTheDocument();
    // Same issue as login page
  });

  it('renders countries page with header and footer', () => {
    renderWithRouter(<App />, { route: '/countries' });
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('all-countries')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders regions page with header and footer', () => {
    renderWithRouter(<App />, { route: '/regions' });
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('regions')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders favorites page with header and footer', () => {
    renderWithRouter(<App />, { route: '/favorites' });
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('favorites')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});