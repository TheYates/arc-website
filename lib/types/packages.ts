// Package Management Types and Interfaces

export interface ServicePackage {
  id: string
  name: string
  displayName: string
  description: string
  category: 'home_care' | 'nanny' | 'emergency' | 'custom'
  basePriceDaily?: number
  basePriceMonthly?: number
  basePriceHourly?: number
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  services?: PackageService[]
  pricingTiers?: PackagePricingTier[]
}

export interface Service {
  id: string
  name: string
  description: string
  category: string
  baseCost: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PackageService {
  id: string
  packageId: string
  serviceId: string
  service?: Service
  inclusionType: 'standard' | 'optional'
  additionalPriceDaily: number
  additionalPriceMonthly: number
  additionalPriceHourly: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PackagePricingTier {
  id: string
  packageId: string
  tierName: string
  tierDescription: string
  priceDaily?: number
  priceMonthly?: number
  priceHourly?: number
  minDurationDays?: number
  maxDurationDays?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Admin forms and UI types
export interface CreatePackageRequest {
  name: string
  displayName: string
  description: string
  category: 'home_care' | 'nanny' | 'emergency' | 'custom'
  basePriceDaily?: number
  basePriceMonthly?: number
  basePriceHourly?: number
  isPopular?: boolean
  services?: CreatePackageServiceRequest[]
}

export interface CreatePackageServiceRequest {
  serviceId: string
  inclusionType: 'standard' | 'optional'
  additionalPriceDaily?: number
  additionalPriceMonthly?: number
  additionalPriceHourly?: number
  sortOrder?: number
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  id: string
  isActive?: boolean
  sortOrder?: number
}

export interface CreateServiceRequest {
  name: string
  description: string
  category: string
  baseCost?: number
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: string
  isActive?: boolean
}

// Package configuration for pricing page
export interface PackageDisplayConfig {
  id: string
  name: string
  displayName: string
  description: string
  price: {
    daily?: string
    monthly?: string
    hourly?: string
  }
  features: string[]
  standardServices: string[]
  optionalServices: Array<{
    name: string
    price: {
      daily?: string
      monthly?: string
      hourly?: string
    }
  }>
  mostPopular: boolean
  category: string
  href: string
}

// Admin package management state
export interface PackageManagementState {
  packages: ServicePackage[]
  services: Service[]
  selectedPackage?: ServicePackage
  selectedService?: Service
  isLoading: boolean
  error?: string
  filters: {
    category?: string
    isActive?: boolean
    search?: string
  }
}

// Package statistics for admin dashboard
export interface PackageStats {
  totalPackages: number
  activePackages: number
  totalServices: number
  activeServices: number
  popularPackages: number
  revenueByPackage: Array<{
    packageId: string
    packageName: string
    revenue: number
    bookings: number
  }>
}

// Pricing calculation utilities
export interface PriceCalculation {
  basePrice: number
  additionalServices: Array<{
    serviceId: string
    serviceName: string
    price: number
  }>
  totalPrice: number
  currency: string
  period: 'daily' | 'monthly' | 'hourly'
}

export interface PackageBookingRequest {
  packageId: string
  selectedServices: string[] // IDs of optional services to include
  duration: number
  period: 'daily' | 'monthly' | 'hourly'
  startDate: string
  specialRequests?: string
}
