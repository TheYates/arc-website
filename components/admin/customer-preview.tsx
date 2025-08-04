"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Star } from "lucide-react"
import type { PricingItem } from "@/lib/types/packages"
import { calculateTotalPrice } from "@/utils/pricing-utils"

interface CustomerPreviewProps {
  isOpen: boolean
  onClose: () => void
  services: PricingItem[]
}

export const CustomerPreview = ({ isOpen, onClose, services = [] }: CustomerPreviewProps) => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const handlePlanSelection = (planId: string, isMutuallyExclusive: boolean, serviceId?: string) => {
    if (isMutuallyExclusive && serviceId) {
      // Remove other plans from the same service
      const siblingPlans = getAllPlansFromService(serviceId)
      setSelectedPlans((prev) => prev.filter((id) => !siblingPlans.includes(id)))
      setSelectedPlans((prev) => [...prev, planId])
    } else {
      setSelectedPlans((prev) => (prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]))
    }
  }

  const handleFeatureSelection = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId],
    )
  }

  const getAllPlansFromService = (serviceId: string): string[] => {
    const plans: string[] = []
    const findPlans = (items: PricingItem[]) => {
      items.forEach((item) => {
        if (item.id === serviceId && item.children) {
          item.children.forEach((child) => {
            if (child.type === "plan") {
              plans.push(child.id)
            }
          })
        }
        if (item.children) {
          findPlans(item.children)
        }
      })
    }
    findPlans(services)
    return plans
  }

  const getSelectedPlanForService = (serviceId: string): string | null => {
    const servicePlans = getAllPlansFromService(serviceId)
    return selectedPlans.find((planId) => servicePlans.includes(planId)) || null
  }

  const renderService = (service: PricingItem) => {
    const selectedPlanId = getSelectedPlanForService(service.id)
    const totalPrice = calculateTotalPrice(service, selectedPlans, selectedFeatures)

    return (
      <div key={service.id} className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{service.name}</h2>
          {service.description && <p className="text-xl text-muted-foreground">{service.description}</p>}
        </div>

        {/* Plans Grid */}
        {service.children && service.children.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {service.children.map((plan, index) => renderPlan(plan, service.id, index === 1))}
          </div>
        )}

        {/* Selected Plan Features */}
        {selectedPlanId && (
          <div className="mt-8">
            {service.children?.find((p) => p.id === selectedPlanId)?.children && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Customize Your Plan</h4>
                <div className="space-y-6">
                  {service.children
                    .find((p) => p.id === selectedPlanId)
                    ?.children?.map((feature) => renderFeatureWithAddons(feature))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Total Price Display */}
        {selectedPlanId && (
          <div className="mt-6 text-center">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total Price</div>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("en-GH", {
                  style: "currency",
                  currency: "GHS",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalPrice)}
              </div>
              <Button className="mt-2" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPlan = (plan: PricingItem, serviceId: string, isPopular = false) => {
    const isSelected = selectedPlans.includes(plan.id)

    return (
      <Card
        key={plan.id}
        className={`relative ${isSelected ? "ring-2 ring-blue-500" : ""} ${isPopular ? "border-blue-500 shadow-lg" : ""}`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}

          <div className="mt-4">
            <span className="text-3xl font-bold">
              {new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: "GHS",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(plan.basePrice || 0)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 mb-6">
            {plan.children?.slice(0, 5).map((feature) => (
              <div key={feature.id} className="space-y-2">
                {/* Main Feature */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  {!feature.isRequired && (
                    <span className="text-xs text-muted-foreground">
                      +${(feature.basePrice || 0).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add-ons under this feature */}
                {feature.children && feature.children.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {feature.children.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          <span>{addon.name}</span>
                        </div>
                        <span>+${(addon.basePrice || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {plan.children && plan.children.length > 5 && (
              <div className="text-sm text-muted-foreground">+{plan.children.length - 5} more features</div>
            )}
          </div>

          {plan.isMutuallyExclusive ? (
            <RadioGroup
              value={isSelected ? plan.id : ""}
              onValueChange={() => handlePlanSelection(plan.id, true, serviceId)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={plan.id} id={plan.id} />
                <Label htmlFor={plan.id} className="w-full">
                  <Button variant={isSelected ? "default" : "outline"} className="w-full">
                    {isSelected ? "Selected" : "Select Plan"}
                  </Button>
                </Label>
              </div>
            </RadioGroup>
          ) : (
            <Button
              variant={isSelected ? "default" : "outline"}
              className="w-full"
              onClick={() => handlePlanSelection(plan.id, false)}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderFeatureWithAddons = (feature: PricingItem) => {
    const isSelected = selectedFeatures.includes(feature.id)

    return (
      <div key={feature.id} className="space-y-3">
        {/* Main Feature */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
          <div className="flex items-center gap-3">
            <Checkbox
              id={feature.id}
              checked={isSelected || feature.isRequired}
              disabled={feature.isRequired}
              onCheckedChange={() => handleFeatureSelection(feature.id)}
            />
            <div>
              <Label htmlFor={feature.id} className="font-medium">
                {feature.name}
              </Label>
              {feature.description && <p className="text-xs text-muted-foreground">{feature.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {feature.isRequired ? (
              <span className="text-xs text-green-600 font-medium">
                Included
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                +${(feature.basePrice || 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Addons for this feature */}
        {feature.children && feature.children.length > 0 && (
          <div className="ml-6 space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">Add-ons:</h5>
            <div className="grid md:grid-cols-2 gap-3">
              {feature.children.map((addon) => renderAddon(addon))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderAddon = (addon: PricingItem) => {
    const isSelected = selectedFeatures.includes(addon.id)

    return (
      <div key={addon.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
        <div className="flex items-center gap-2">
          <Checkbox
            id={addon.id}
            checked={isSelected || addon.isRequired}
            disabled={addon.isRequired}
            onCheckedChange={() => handleFeatureSelection(addon.id)}
          />
          <div>
            <Label htmlFor={addon.id} className="text-sm font-medium">
              {addon.name}
            </Label>
            {addon.description && <p className="text-xs text-muted-foreground">{addon.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {addon.isRequired ? (
            <span className="text-xs text-green-600 font-medium">
              Included
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              +${(addon.basePrice || 0).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderFeature = (feature: PricingItem) => {
    const isSelected = selectedFeatures.includes(feature.id)

    return (
      <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Checkbox
            id={feature.id}
            checked={isSelected || feature.isRequired}
            disabled={feature.isRequired}
            onCheckedChange={() => handleFeatureSelection(feature.id)}
          />
          <div>
            <Label htmlFor={feature.id} className="font-medium">
              {feature.name}
            </Label>
            {feature.description && <p className="text-xs text-muted-foreground">{feature.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feature.isRequired ? (
            <span className="text-xs text-green-600 font-medium">
              Included
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              +${(feature.basePrice || 0).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Our Pricing Plans</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {services.length > 0 ? (
            services.map((service) => renderService(service))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Pricing Plans Available</h3>
              <p className="text-muted-foreground">Add some services and plans to see your pricing page preview.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
