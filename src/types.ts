export type AdminRole = 'super_admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  qualifications: string;
  experienceYears: string;
  specialties: string[];
  education: string;
  hospitalAffiliations: string;
  bio: string;
  clinicLocation: string;
  phone: string;
  email: string;
  availability: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  treatments: string[];
  doctorId?: string;
  iconName: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface DiagnosticService {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  turnaroundTime: string;
  requirements: string[];
  displayOrder: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  patientName: string;
  location: string;
  quote: string;
  rating: number;
  doctorCredited?: string;
  verified: boolean;
  displayOrder: number;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  alt: string;
  category: 'doctors' | 'hero' | 'clinic' | 'services' | 'general';
  fileSize: number;
  dimensions?: string;
  uploadedAt: string;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  submittedAt: string;
  adminNotes?: string;
}

export interface GlobalSettings {
  practiceName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  googleMapsUrl: string;
  emergencyNotice: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  footerDescription: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  showLogoText?: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SectionContent {
  id: string;
  pageSlug: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  bodyText?: string;
  primaryButtonLabel?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  additionalImages?: string[];
  isVisible: boolean;
  displayOrder: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface BootstrapData {
  settings: GlobalSettings;
  theme: ThemeSettings;
  doctors: Doctor[];
  services: Service[];
  diagnostics: DiagnosticService[];
  testimonials: Testimonial[];
  sections: SectionContent[];
  allSections: SectionContent[];
}
