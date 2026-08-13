import { afriFinanceFetch } from "./client";
import type { SectorRef } from "./types";

export const sectorsApi = {
  list() {
    return afriFinanceFetch<SectorRef[]>("/sectors");
  },
};