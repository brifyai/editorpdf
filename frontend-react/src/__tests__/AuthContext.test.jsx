import React from 'react';
import { render } from '@testing-library/react';

describe('AuthContext Tests', () => {
  test('Jest funciona correctamente', () => {
    expect(2 + 2).toBe(4);
  });

  test('React Testing Library funciona correctamente', () => {
    const { container } = render(<div>AuthContext Test</div>);
    expect(container).toBeInTheDocument();
  });
});
