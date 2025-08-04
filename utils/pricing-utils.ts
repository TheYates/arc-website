import type { PricingItem } from "@/lib/types/packages"

export function calculateTotalPrice(
  service: PricingItem,
  selectedFeatures: string[]
): number {
  let total = service.basePrice || 0  // Start with service base price

  // Add selected optional features and addons
  const addFeaturePrices = (items: PricingItem[]) => {
    items.forEach((item) => {
      if ((item.type === "feature" || item.type === "addon") && selectedFeatures.includes(item.id) && !item.isRequired) {
        total += item.basePrice || 0
      }

      if (item.children) {
        addFeaturePrices(item.children)
      }
    })
  }

  if (service.children) {
    addFeaturePrices(service.children)
  }

  return total
}

export function getAllItemsFlat(items: PricingItem[]): PricingItem[] {
  const result: PricingItem[] = []
  
  const flatten = (items: PricingItem[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }
  
  flatten(items)
  return result
}

export function findItemById(items: PricingItem[], id: string): PricingItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item
    }
    if (item.children) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}
