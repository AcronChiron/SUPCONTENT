import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewCard from '../src/components/ReviewCard';

const review = {
  id: 'r1',
  content: 'Chef-d’œuvre absolu',
  rating: 4,
  createdAt: '2026-01-15T10:00:00Z',
  user: { username: 'alice', avatarUrl: null },
  _count: { likes: 12, comments: 3 },
};

describe('ReviewCard', () => {
  it('renders content, username and counts', () => {
    render(
      <MemoryRouter>
        <ReviewCard review={review} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Chef-d’œuvre absolu')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('links to the review detail', () => {
    render(
      <MemoryRouter>
        <ReviewCard review={review} />
      </MemoryRouter>,
    );
    const link = screen.getByText('Chef-d’œuvre absolu').closest('a');
    expect(link).toHaveAttribute('href', '/reviews/r1');
  });
});
