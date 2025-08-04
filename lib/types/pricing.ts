export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  type: "service" | "feature" | "addon";
  basePrice?: number;
  isRequired?: boolean;
  isRecurring?: boolean;
  isMutuallyExclusive?: boolean;
  children?: PricingItem[];
}
