import React from 'react';
import { render } from '@testing-library/react';

describe('App Tests', () => {
  test('Jest funciona correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  test('React Testing Library funciona correctamente', () => {
    const { container } = render(<div>Test</div>);
    expect(container).toBeInTheDocument();
  });
});
