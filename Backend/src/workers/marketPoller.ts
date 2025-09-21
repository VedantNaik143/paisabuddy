// marketPoller.ts — mock feed, update a few symbols every second
import { setPrice } from "../services/marketService";
import { Server } from "socket.io";

const SYMBOLS = ["RELIANCE", "TCS", "INFY", "HDFCBANK"];

export function startMockMarket(io?: Server) {
  // seed random base prices
  const prices: Record<string, number> = {};
  SYMBOLS.forEach(s => prices[s] = 1000 + Math.random() * 2000);

  setInterval(async () => {
    SYMBOLS.forEach(async (s) => {
      // small random walk
      const delta = (Math.random() - 0.5) * 5;
      prices[s] = Math.max(1, +(prices[s] + delta).toFixed(2));
      await setPrice(s, prices[s]);
      // push via socket if available
      if (io) io.emit("market-update", { symbol: s, price: prices[s], ts: new Date().toISOString() });
    });
  }, 1000); // every second
}
