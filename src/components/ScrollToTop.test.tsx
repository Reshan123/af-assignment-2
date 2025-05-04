import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';
import { MemoryRouter } from 'react-router-dom';

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it('should call window.scrollTo when rendered', () => {
    render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );
    
    // Check if scrollTo was called with the right arguments
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });
});