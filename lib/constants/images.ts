// Centralized image configuration for better maintainability and organization

export const IMAGES = {
  // Hero Images
  hero: {
    main: "/images/hero/main-hero.webp",
    fallback: "/images/hero/main-hero-fallback.jpg",
  },

  // Service Images
  services: {
    ahenefie: {
      hero: "/images/services/ahenefie/hero-wide.webp",
      card: "/images/services/ahenefie/card.webp",
      gallery: [
        "/images/services/ahenefie/gallery-1.webp",
        "/images/services/ahenefie/gallery-2.webp",
      ],
    },
    adamfoPa: {
      hero: "/images/services/adamfo-pa/hero-wide.webp",
      card: "/images/services/adamfo-pa/card.webp",
      gallery: [
        "/images/services/adamfo-pa/gallery-1.webp",
        "/images/services/adamfo-pa/gallery-2.webp",
      ],
    },
    fieNeFie: {
      hero: "/images/services/fie-ne-fie/hero-wide.webp",
      card: "/images/services/fie-ne-fie/card.webp",
      gallery: [
        "/images/services/fie-ne-fie/gallery-1.webp",
        "/images/services/fie-ne-fie/gallery-2.webp",
      ],
    },
    yonkoPa: {
      hero: "/images/services/yonko-pa/hero-wide.webp",
      card: "/images/services/yonko-pa/card.webp",
      gallery: [
        "/images/services/yonko-pa/gallery-1.webp",
        "/images/services/yonko-pa/gallery-2.webp",
      ],
    },
    eventMedical: {
      hero: "/images/services/event-medical-coverage/hero-wide.webp",
      card: "/images/services/event-medical-coverage/card.webp",
      gallery: [
        "/images/services/event-medical-coverage/gallery-1.webp",
        "/images/services/event-medical-coverage/gallery-2.webp",
      ],
    },
    rallyPack: {
      hero: "/images/services/rally-pack/hero.webp",
      card: "/images/services/rally-pack/card.webp",
      gallery: [
        "/images/services/rally-pack/gallery-1.webp",
        "/images/services/rally-pack/gallery-2.webp",
      ],
    },
    conferenceOption: {
      hero: "/images/services/conference-option/hero.webp",
      card: "/images/services/conference-option/card.webp",
      gallery: [
        "/images/services/conference-option/gallery-1.webp",
        "/images/services/conference-option/gallery-2.webp",
      ],
    },
  },

  // General Images
  general: {
    logo: "/images/general/logo.svg",
    logoLight: "/images/general/logo-light.svg",
    placeholder: "/images/general/placeholder.webp",
    teamPhoto: "/images/general/team.webp",
  },

  // Testimonial Images
  testimonials: {
    client1: "/images/testimonials/client-1.webp",
    client2: "/images/testimonials/client-2.webp",
    client3: "/images/testimonials/client-3.webp",
  },
} as const;

// Alt text configuration for accessibility
export const ALT_TEXTS = {
  hero: {
    main: "Professional healthcare team providing compassionate home care and nanny services across Ghana",
  },

  services: {
    ahenefie: {
      hero: "Dedicated nursing professional providing 24/7 live-in home care for elderly patient in comfortable home setting",
      card: "Professional nurse assisting elderly patient with daily activities in home environment",
    },
    adamfoPa: {
      hero: "Healthcare professional conducting comprehensive daily home visit medical assessment and care review",
      card: "Medical professional performing routine health check during home visit",
    },
    fieNeFie: {
      hero: "Professional nanny providing comprehensive live-in childcare and basic nursing support to young children",
      card: "Certified childcare professional engaging in educational activities with children",
    },
    yonkoPa: {
      hero: "Professional nanny providing flexible visit-on-request childcare services for busy families",
      card: "Experienced childcare provider offering on-demand nanny services",
    },
    eventMedical: {
      hero: "Professional medical team providing emergency response and coverage at large outdoor events and gatherings",
      card: "Medical professionals with emergency equipment at public event",
    },
    rallyPack: {
      hero: "Specialized medical team providing rapid response services at high-energy rallies and demonstrations",
      card: "Medical professionals monitoring crowd safety at public rally",
    },
    conferenceOption: {
      hero: "Professional medical team providing continuous on-site coverage for business conferences and corporate events",
      card: "Medical professionals maintaining health and safety at professional conference",
    },
  },

  general: {
    logo: "Alpha Rescue Consult logo - Professional healthcare services in Ghana",
    logoLight: "Alpha Rescue Consult logo - Light version for dark backgrounds",
    placeholder: "Image placeholder - content loading",
    teamPhoto: "Alpha Rescue Consult professional healthcare team",
  },
} as const;

// Image sizing presets for consistent responsive behavior
export const IMAGE_SIZES = {
  hero: "100vw",
  serviceCard: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  gallery: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
  testimonial: "(max-width: 768px) 80px, 100px",
  logo: "(max-width: 768px) 120px, 150px",
} as const;
