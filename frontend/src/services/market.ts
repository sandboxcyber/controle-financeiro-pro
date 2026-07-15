import { api } from "./api";

export type MarketSearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

export type MarketAsset = {
  ticker: string;
  name: string;
  currency: string;
  price: number;
  exchange_rate: number;
  price_brl: number;
};

export const marketService = {
  search(query: string) {
    return api.get<MarketSearchResult[]>(
      `/market/search/${encodeURIComponent(query)}`
    );
  },

  asset(ticker: string) {
    return api.get<MarketAsset>(
      `/market/asset/${encodeURIComponent(ticker)}`
    );
  },
};
