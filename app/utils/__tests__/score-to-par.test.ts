import { formatScoreToPar } from '../score-to-par';

describe('formatScoreToPar', () => {
	it('should return "E" when par and score are equal', () => {
		expect(formatScoreToPar({ par: 72, score: 72 })).toBe('E');
		expect(formatScoreToPar({ par: 5, score: 5 })).toBe('E');
	});

	it('should return a string with a leading "+" for scores above par', () => {
		expect(formatScoreToPar({ par: 72, score: 74 })).toBe('+2');
		expect(formatScoreToPar({ par: 4, score: 6 })).toBe('+2');
	});

	it('should return a string without a leading "+" for scores below par', () => {
		expect(formatScoreToPar({ par: 72, score: 70 })).toBe('-2');
		expect(formatScoreToPar({ par: 5, score: 3 })).toBe('-2');
	});

	it('should handle invalid inputs gracefully', () => {
		expect(() => {
			// @ts-expect-error - expected
			formatScoreToPar({ par: '70', score: 74 });
		}).toThrow();
		expect(() => {
			// @ts-expect-error - expected
			formatScoreToPar({ par: 70, score: '12' });
		}).toThrow();
		expect(() => {
			formatScoreToPar({ par: NaN, score: 74 });
		}).toThrow();
		expect(() => {
			formatScoreToPar({ par: 72, score: NaN });
		}).toThrow();
	});
});
