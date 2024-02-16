/**
 * Handicap index calculation:
 *
 * Calc differs based on # of rounds w/ a score differential
 * posted.
 *
 * When more than 20 rounds, always take the most recent 20.
 *
 * Less than 3 rounds: no handicap
 *
 * 3 rounds: Lowest score, minus 3 strokes
 *
 * 4 rounds: Lowest score, minus 1 stroke
 *
 * 5 rounds: Lowest score
 *
 * 6 rounds: Avg of lowest 2 scores, minus 1 stroke
 *
 * 7-8 rounds: Avg of lowest 2 scores
 *
 * 9-11 rounds: Avg of lowest 3 scores
 *
 * 12-14 rounds: Avg of lowest 4 scores
 *
 * 15-16 rounds: Avg of lowest 5 scores
 *
 * 17-18 rounds: Avg of lowest 6 scores
 *
 * 19 rounds: Avg of lowest 7 scores
 *
 * 20 rounds: Avg of lowest 8 scores
 */

export const calculateHandicapIndex = () => {
	// @todo do this :)
};
