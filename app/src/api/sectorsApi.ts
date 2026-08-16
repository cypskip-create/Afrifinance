import { continuaFetch } from "./client";
import type { SectorRef } from "./types";

export const sectorsApi = {
  list() {
    return continuaFetch<SectorRef[]>("/sectors");
  },
};