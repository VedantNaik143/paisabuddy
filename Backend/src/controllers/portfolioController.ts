// portfolioController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getPrice } from "../services/marketService";
const prisma = new PrismaClient();

export async function getPortfolio(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "unauth" });
  let portfolio = await prisma.portfolio.findFirst({ where: { userId }, include: { holdings: true } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({ data: { userId } });
    // create wallet if missing
    const existingWallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!existingWallet) {
      await prisma.wallet.create({ data: { userId, initialCash: 100000, cashBalance: 100000 } });
    }
  }
  // attach live prices
  const holdingsWithLive = await Promise.all(portfolio.holdings.map(async h => {
    const last = await getPrice(h.symbol);
    return { ...h, lastPrice: last ?? h.avgPrice };
  }));
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  res.json({ portfolio: { ...portfolio, holdings: holdingsWithLive }, wallet });
}

export async function getPortfolioHistory(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  const portfolio = await prisma.portfolio.findFirst({ where: { userId }});
  if (!portfolio) return res.json({ history: [] });
  const snaps = await prisma.portfolioSnapshot.findMany({ where: { portfolioId: portfolio.id }, orderBy: { timestamp: "asc" }});
  res.json({ history: snaps });
}

export async function postTrade(req: Request, res: Response) {
  // simple market order processor for paper trading
  const userId = (req as any).user?.userId;
  const { symbol, side, qty } = req.body;
  if (!userId) return res.status(401).json({ error: "unauth" });
  if (!symbol || !side || !qty) return res.status(400).json({ error: "missing" });
  const portfolio = await prisma.portfolio.findFirst({ where: { userId }});
  const wallet = await prisma.wallet.findUnique({ where: { userId }});
  if (!portfolio || !wallet) return res.status(400).json({ error: "no portfolio/wallet" });

  const price = await getPrice(symbol);
  if (!price) return res.status(400).json({ error: "no price" });

  const cost = +(price * qty);
  if (side === "BUY") {
    if (wallet.cashBalance < cost) return res.status(400).json({ error: "insufficient funds" });
    // deduct cash
    await prisma.wallet.update({ where: { userId }, data: { cashBalance: wallet.cashBalance - cost } });
    // upsert holding
    const existing = await prisma.holding.findFirst({ where: { portfolioId: portfolio.id, symbol }});
    if (existing) {
      const newQty = existing.qty + qty;
      const newAvg = ((existing.avgPrice * existing.qty) + (price * qty)) / newQty;
      await prisma.holding.update({ where: { id: existing.id }, data: { qty: newQty, avgPrice: newAvg }});
    } else {
      await prisma.holding.create({ data: { portfolioId: portfolio.id, symbol, qty, avgPrice: price }});
    }
    await prisma.transaction.create({ data: { portfolioId: portfolio.id, symbol, side, qty, price }});
  } else if (side === "SELL") {
    const existing = await prisma.holding.findFirst({ where: { portfolioId: portfolio.id, symbol }});
    if (!existing || existing.qty < qty) return res.status(400).json({ error: "insufficient holdings" });
    const newQty = existing.qty - qty;
    if (newQty === 0) await prisma.holding.delete({ where: { id: existing.id }});
    else await prisma.holding.update({ where: { id: existing.id }, data: { qty: newQty }});
    // credit cash
    await prisma.wallet.update({ where: { userId }, data: { cashBalance: wallet.cashBalance + cost }});
    await prisma.transaction.create({ data: { portfolioId: portfolio.id, symbol, side, qty, price }});
  } else return res.status(400).json({ error: "bad side" });

  // snapshot NAV (simple calc)
  const holdings = await prisma.holding.findMany({ where: { portfolioId: portfolio.id }});
  let nav = (await prisma.wallet.findUnique({ where: { userId } }))!.cashBalance;
  for (const h of holdings) {
    const p = await getPrice(h.symbol) || h.avgPrice;
    nav += p * h.qty;
  }
  await prisma.portfolioSnapshot.create({ data: { portfolioId: portfolio.id, nav }});

  // return updated portfolio
  const updated = await prisma.portfolio.findUnique({ where: { id: portfolio.id }, include: { holdings: true }});
  res.json({ ok: true, portfolio: updated, wallet: await prisma.wallet.findUnique({ where: { userId }}) });
}
