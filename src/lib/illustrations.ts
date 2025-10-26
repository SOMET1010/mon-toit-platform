/**
 * URLs des illustrations personnalisées Mon Toit
 * Générées avec IA - Style africain/ivoirien moderne
 * Stockées sur Supabase Storage (bucket: illustrations)
 */

const BASE_URL = 'https://haffcubwactwjpngcpdf.supabase.co/storage/v1/object/public/illustrations';

export const ILLUSTRATIONS = {
  // Empty States - Illustrations cartoon pour états vides
  emptyStates: {
    noProperties: `${BASE_URL}/empty-states/no-properties.png`,
    noFavorites: `${BASE_URL}/empty-states/no-favorites.png`,
    noMessages: `${BASE_URL}/empty-states/no-messages.png`,
    noApplications: `${BASE_URL}/empty-states/no-applications.png`,
    noSearchResults: `${BASE_URL}/empty-states/no-search-results.png`,
  },

  // Features - Illustrations des fonctionnalités
  features: {
    ansutCertification: `${BASE_URL}/features/ansut-certification.png`,
    electronicSignature: `${BASE_URL}/features/electronic-signature.png`,
    identityVerification: `${BASE_URL}/features/identity-verification.png`,
    securePayment: `${BASE_URL}/features/secure-payment.png`,
    virtualVisit: `${BASE_URL}/features/virtual-visit.png`,
  },

  // Sections - Illustrations cartoon pour sections explicatives
  sections: {
    heroHappyFamily: `${BASE_URL}/sections/hero-happy-family.png`,
    howItWorks: `${BASE_URL}/sections/how-it-works.png`,
    testimonials: `${BASE_URL}/sections/testimonials.png`,
    securityTrust: `${BASE_URL}/sections/security-trust.png`,
    customerSupport: `${BASE_URL}/sections/customer-support.png`,
  },

  // Photos réalistes - Pour sections principales
  realistic: {
    heroFamilyReal: `${BASE_URL}/realistic/hero-family-real.jpg`,
    agentProfessional: `${BASE_URL}/realistic/agent-professional.jpg`,
    happyTenantCouple: `${BASE_URL}/realistic/happy-tenant-couple.jpg`,
    customerSupportAgent: `${BASE_URL}/realistic/customer-support-agent.jpg`,
    abidjanModernBuilding: `${BASE_URL}/realistic/abidjan-modern-building.jpg`,
  },
} as const;

// Types pour autocomplétion TypeScript
export type IllustrationCategory = keyof typeof ILLUSTRATIONS;
export type EmptyStateKey = keyof typeof ILLUSTRATIONS.emptyStates;
export type FeatureKey = keyof typeof ILLUSTRATIONS.features;
export type SectionKey = keyof typeof ILLUSTRATIONS.sections;
export type RealisticKey = keyof typeof ILLUSTRATIONS.realistic;
