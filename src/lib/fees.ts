const PLATFORM_FEE_PERCENTAGE = 0.1; // 10%

/**
 * Calculates the platform fee for a given amount.
 * @param amount The total amount of the transaction.
 * @returns The calculated platform fee.
 */
export function calculatePlatformFee(amount: number): number {
  return amount * PLATFORM_FEE_PERCENTAGE;
}
