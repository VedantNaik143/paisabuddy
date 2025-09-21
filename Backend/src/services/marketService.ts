// paisabuddy-backend/src/services/marketService.ts
// Simple in-memory price store for dev / hackathon (no Redis required)

type PriceStore = Record<string, number>;

const store: PriceStore = {};

/**
 * Set the current price for a symbol.
 * @param symbol uppercase ticker, e.g. "RELIANCE"
 * @param price latest price number
 */
export async function setPrice(symbol: string, price: number) {
  store[symbol] = price;
}

/**
 * Get latest known price for a symbol. Returns null if unknown.
 * @param symbol uppercase ticker
 */
export async function getPrice(symbol: string) {
  return store[symbol] ?? null;
}

/**
 * Optional helper: list all stored prices (useful for debugging)
 */
export async function listPrices() {
  return { ...store };
}
