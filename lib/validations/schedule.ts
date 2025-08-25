import { z } from "zod"

export const scheduleTypeEnum = z.enum([
  "ROUTINE_VISIT",
  "EMERGENCY_VISIT", 
  "FOLLOW_UP",
  "MEDICATION_ADMINISTRATION",
  "VITAL_SIGNS_CHECK",
  "WOUND_CARE",
  "PHYSICAL_THERAPY",
  "CONSULTATION"
])

export const createScheduleSchema = z.object({
  patientId: z
    .string()
    .min(1, "Patient is required")
    .uuid("Invalid patient ID format"),
  
  scheduleType: scheduleTypeEnum
    .refine((type) => type !== undefined, {
      message: "Schedule type is required"
    }),
  
  scheduledDate: z
    .date({
      required_error: "Scheduled date is required",
      invalid_type_error: "Please select a valid date"
    })
    .refine((date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    }, {
      message: "Scheduled date must be today or in the future"
    }),
  
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .optional(),
    
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .optional()
    .default(60)
})

export const updateScheduleSchema = createScheduleSchema.partial()

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
export type ScheduleType = z.infer<typeof scheduleTypeEnum>

// Validation helpers
export const validateScheduleForm = (data: unknown) => {
  return createScheduleSchema.safeParse(data)
}

export const getScheduleValidationErrors = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const field = err.path[0] as string
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = err.message
    }
  })
  
  return fieldErrors
}
