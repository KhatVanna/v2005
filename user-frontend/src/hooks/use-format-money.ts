"use client";

import { useCallback } from "react";
import {
  formatMoneyForRegion,
  useRegionStore,
} from "@/stores/region-store";

export function useFormatMoney() {
  const regionId = useRegionStore((state) => state.regionId);
  const region = useRegionStore((state) => state.region);

  return useCallback(
    (amount: number) => formatMoneyForRegion(amount, region()),
    [region, regionId]
  );
}
