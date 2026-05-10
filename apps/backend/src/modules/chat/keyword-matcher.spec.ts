import { detectResponseFromRules } from './keyword-matcher';

describe('detectResponseFromRules', () => {
  it('matches keywords case-insensitively and can return multiple responses ordered by keyword position', () => {
    const rules = [
      { keywords: ['features', 'services'], response: 'Features response' },
      { keywords: ['price', 'cost', 'pricing'], response: 'Pricing response' },
    ];

    expect(
      detectResponseFromRules(
        'what is your services or features ? and how cost ?',
        rules,
      ),
    ).toBe('Features response\n\nPricing response');
  });

  it('prioritizes greeting responses (hello/hi/hey) over other matches', () => {
    const rules = [
      { keywords: ['price', 'cost', 'pricing'], response: 'Pricing response' },
      { keywords: ['hello', 'hi', 'hey'], response: 'Greeting response' },
    ];

    expect(detectResponseFromRules('how cost? hi', rules)).toBe(
      'Greeting response\n\nPricing response',
    );
  });

  it('returns null when no keyword matches (fallback case)', () => {
    const rules = [{ keywords: ['pricing'], response: 'Pricing help' }];

    expect(detectResponseFromRules('hello there', rules)).toBeNull();
  });
});
