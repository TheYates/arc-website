"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  conditions: string[]
  careLevel: "low" | "medium" | "high" | "critical"
  status: "stable" | "improving" | "declining" | "critical"
  assignedDate: string
  lastVisit: string
  nextVisit: string
  address: string
  phone: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  vitals: {
    bloodPressure: string
    heartRate: string
    temperature: string
    oxygenSaturation: string
    recordedDate: string
  }
  medications: number
  notes: string
  riskFactors: string[]
  allergies: string[]
}

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
  patients: Patient[]
  setPatients: (patients: Patient[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  getPatientById: (id: string) => Patient | undefined
  updatePatient: (id: string, updates: Partial<Patient>) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function usePatientContext() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider')
  }
  return context
}

interface PatientProviderProps {
  children: React.ReactNode
}

export function PatientProvider({ children }: PatientProviderProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock patient data - in real app, this would come from API
  const mockPatients: Patient[] = [
    {
      id: "5",
      name: "Akosua Asante",
      age: 67,
      gender: "female",
      conditions: ["Hypertension", "Diabetes Type 2", "Arthritis"],
      careLevel: "medium",
      status: "stable",
      assignedDate: "2024-01-10",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-17",
      address: "123 Accra Street, Accra",
      phone: "+233 24 000 0005",
      emergencyContact: {
        name: "Kwame Asante",
        relationship: "Son",
        phone: "+233 24 111 1111",
      },
      vitals: {
        bloodPressure: "135/85",
        heartRate: "82",
        temperature: "36.7°C",
        oxygenSaturation: "97%",
        recordedDate: "2024-01-15T10:30:00Z",
      },
      medications: 4,
      notes: "Patient is responding well to current treatment plan. Blood pressure slightly elevated but within acceptable range.",
      riskFactors: ["Fall Risk", "Medication Compliance"],
      allergies: ["Penicillin", "Shellfish"],
    },
    {
      id: "6",
      name: "Kofi Mensah",
      age: 72,
      gender: "male",
      conditions: ["Type 2 Diabetes", "Diabetic Neuropathy", "Hypertension"],
      careLevel: "medium",
      status: "stable",
      assignedDate: "2024-01-05",
      lastVisit: "2024-01-16",
      nextVisit: "2024-01-18",
      address: "456 Tema Avenue, Tema",
      phone: "+233 24 000 0006",
      emergencyContact: {
        name: "Ama Mensah",
        relationship: "Wife",
        phone: "+233 24 222 2222",
      },
      vitals: {
        bloodPressure: "140/85",
        heartRate: "78",
        temperature: "36.8°C",
        oxygenSaturation: "98%",
        recordedDate: "2024-01-16T08:15:00Z",
      },
      medications: 3,
      notes: "Blood sugar levels stable. Neuropathy pain managed well with current medications.",
      riskFactors: ["Diabetes", "Neuropathy"],
      allergies: ["Aspirin"],
    },
    {
      id: "7",
      name: "Abena Osei",
      age: 45,
      gender: "female",
      conditions: ["Post-surgical recovery", "Wound healing"],
      careLevel: "medium",
      status: "improving",
      assignedDate: "2024-01-10",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-17",
      address: "789 Kumasi Road, Kumasi",
      phone: "+233 24 000 0007",
      emergencyContact: {
        name: "Yaw Osei",
        relationship: "Husband",
        phone: "+233 24 333 3333",
      },
      vitals: {
        bloodPressure: "118/75",
        heartRate: "72",
        temperature: "36.5°C",
        oxygenSaturation: "99%",
        recordedDate: "2024-01-15T14:20:00Z",
      },
      medications: 2,
      notes: "Surgical wound healing well. Patient recovering as expected.",
      riskFactors: ["Post-surgical infection risk"],
      allergies: [],
    },
    {
      id: "8",
      name: "Kwaku Boateng",
      age: 58,
      gender: "male",
      conditions: ["Stroke recovery", "Mobility issues", "Dementia"],
      careLevel: "high",
      status: "stable",
      assignedDate: "2024-01-08",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-16",
      address: "321 Cape Coast Street, Cape Coast",
      phone: "+233 24 000 0008",
      emergencyContact: {
        name: "Efua Boateng",
        relationship: "Daughter",
        phone: "+233 24 444 4444",
      },
      vitals: {
        bloodPressure: "110/70",
        heartRate: "68",
        temperature: "36.2°C",
        oxygenSaturation: "97%",
        recordedDate: "2024-01-15T21:45:00Z",
      },
      medications: 5,
      notes: "Cognitive function stable. Mobility improving with physical therapy.",
      riskFactors: ["Fall Risk", "Confusion Episodes", "Medication Compliance"],
      allergies: ["Latex"],
    },
  ]

  // Initialize patients on mount
  useEffect(() => {
    setPatients(mockPatients)
  }, [])

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id)
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === id ? { ...patient, ...updates } : patient
      )
    )
    
    // Update selected patient if it's the one being updated
    if (selectedPatient && selectedPatient.id === id) {
      setSelectedPatient({ ...selectedPatient, ...updates })
    }
  }

  const value: PatientContextType = {
    selectedPatient,
    setSelectedPatient,
    patients,
    setPatients,
    isLoading,
    setIsLoading,
    getPatientById,
    updatePatient,
  }

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}

// Hook for easy patient selection and management
export function usePatientSelection() {
  const { selectedPatient, setSelectedPatient, getPatientById } = usePatientContext()

  const selectPatientById = (id: string) => {
    const patient = getPatientById(id)
    if (patient) {
      setSelectedPatient(patient)
    }
  }

  const clearSelection = () => {
    setSelectedPatient(null)
  }

  return {
    selectedPatient,
    selectPatientById,
    clearSelection,
    hasSelection: !!selectedPatient,
  }
}

// Hook for patient data management
export function usePatientData() {
  const { patients, setPatients, isLoading, setIsLoading, updatePatient } = usePatientContext()

  const refreshPatients = async () => {
    setIsLoading(true)
    // In real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const addVitals = (patientId: string, vitals: any) => {
    updatePatient(patientId, {
      vitals: {
        ...vitals,
        recordedDate: new Date().toISOString(),
      }
    })
  }

  const addMedication = (patientId: string, medication: any) => {
    // In real app, this would add to a medications array
    console.log('Adding medication:', medication)
  }

  const addNote = (patientId: string, note: any) => {
    // In real app, this would add to a notes array
    console.log('Adding note:', note)
  }

  return {
    patients,
    isLoading,
    refreshPatients,
    updatePatient,
    addVitals,
    addMedication,
    addNote,
  }
}
