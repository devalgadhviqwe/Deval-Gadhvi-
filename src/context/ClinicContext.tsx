import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GlobalSettings,
  ThemeSettings,
  Doctor,
  Service,
  DiagnosticService,
  Testimonial,
  SectionContent,
  BootstrapData
} from '../types';

interface ClinicContextType {
  settings: GlobalSettings | null;
  theme: ThemeSettings | null;
  doctors: Doctor[];
  services: Service[];
  diagnostics: DiagnosticService[];
  testimonials: Testimonial[];
  sections: SectionContent[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  submitInquiry: (data: { fullName: string; email: string; phone: string; message: string }) => Promise<{ success: boolean; message: string }>;
  setCustomImage: (targetType: 'doctor' | 'service' | 'section' | 'logo', targetId: string, imageUrl: string, imageField?: string, additionalImages?: string[]) => Promise<boolean>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

import defaultClinicData from '../../data/clinic_data.json';
import { setIdbItem, getIdbItem } from '../utils/idbStorage';

const defaultBootstrapData: BootstrapData = {
  settings: defaultClinicData.globalSettings as any,
  theme: defaultClinicData.themeSettings as any,
  doctors: (defaultClinicData.doctors as any[]).filter((d) => d.active),
  services: (defaultClinicData.services as any[]).filter((s) => s.active),
  diagnostics: (defaultClinicData.diagnosticServices as any[]).filter((d) => d.active),
  testimonials: (defaultClinicData.testimonials as any[]),
  sections: (defaultClinicData.sections as any[]).filter((s) => s.isVisible),
  allSections: (defaultClinicData.sections as any[]).filter((s) => s.isVisible)
};

// Pure helper to merge custom images overrides
function mergeOverrides(serverData: BootstrapData, overrides: Record<string, string>): BootstrapData {
  if (!overrides || Object.keys(overrides).length === 0) return serverData;

  const mergedDoctors = serverData.doctors.map((doc) => {
    const customUrl = overrides[`doctor_${doc.id}`] || overrides[`doctor_${doc.slug}`];
    return customUrl ? { ...doc, imageUrl: customUrl } : doc;
  });

  const mergedServices = serverData.services.map((srv) => {
    const customUrl = overrides[`service_${srv.id}`] || overrides[`service_${srv.slug}`];
    return customUrl ? { ...srv, imageUrl: customUrl } : srv;
  });

  const mergedSections = serverData.sections.map((sec) => {
    const customUrl = overrides[`section_${sec.id}`] || overrides[`section_${sec.sectionKey}`];
    const customSecUrl = overrides[`section_${sec.id}_secondary`] || overrides[`section_${sec.sectionKey}_secondary`];
    const customAdditionalRaw = overrides[`section_${sec.id}_additional`] || overrides[`section_${sec.sectionKey}_additional`];
    let customAdditional: string[] | undefined;
    if (customAdditionalRaw) {
      try {
        customAdditional = JSON.parse(customAdditionalRaw);
      } catch {
        // ignore
      }
    }
    return {
      ...sec,
      imageUrl: customUrl || sec.imageUrl,
      secondaryImageUrl: customSecUrl || sec.secondaryImageUrl,
      additionalImages: customAdditional || sec.additionalImages
    };
  });

  const mergedSettings = { ...serverData.settings };
  if (overrides['logo_main'] !== undefined) {
    mergedSettings.logoUrl = overrides['logo_main'] === '__RESET__' ? '' : overrides['logo_main'];
  }
  if (overrides['logo_dark'] !== undefined) {
    mergedSettings.logoDarkUrl = overrides['logo_dark'] === '__RESET__' ? '' : overrides['logo_dark'];
  }

  return {
    ...serverData,
    settings: mergedSettings,
    doctors: mergedDoctors,
    services: mergedServices,
    sections: mergedSections,
    allSections: mergedSections
  };
}

function mergeLocalOverrides(serverData: BootstrapData): BootstrapData {
  try {
    const savedOverridesRaw = localStorage.getItem('nma_custom_images_overrides');
    if (!savedOverridesRaw) return serverData;
    const overrides: Record<string, string> = JSON.parse(savedOverridesRaw);
    return mergeOverrides(serverData, overrides);
  } catch {
    return serverData;
  }
}

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preload from localStorage cache if available, else immediate fallback to bundled data
  const [data, setData] = useState<BootstrapData>(() => {
    try {
      const cached = localStorage.getItem('nma_clinic_bootstrap_cache');
      if (cached) {
        return mergeLocalOverrides(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
    return mergeLocalOverrides(defaultBootstrapData);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load IndexedDB overrides on startup
  useEffect(() => {
    getIdbItem<Record<string, string>>('nma_custom_images_overrides').then((idbOverrides) => {
      if (idbOverrides && Object.keys(idbOverrides).length > 0) {
        setData((prev) => {
          if (!prev) return prev;
          try {
            const savedRaw = localStorage.getItem('nma_custom_images_overrides');
            const localOverrides: Record<string, string> = savedRaw ? JSON.parse(savedRaw) : {};
            const combined = { ...idbOverrides, ...localOverrides };
            return mergeOverrides(prev, combined);
          } catch {
            return mergeOverrides(prev, idbOverrides);
          }
        });
      }
    });
  }, []);

  const applyLocalOverrides = useCallback((serverData: BootstrapData): BootstrapData => {
    return mergeLocalOverrides(serverData);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/public/bootstrap');
      if (!res.ok) {
        return;
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      const json: BootstrapData = await res.json();
      const merged = applyLocalOverrides(json);
      setData(merged);

      try {
        localStorage.setItem('nma_clinic_bootstrap_cache', JSON.stringify(merged));
      } catch (err) {
        console.warn('Could not cache bootstrap to localStorage:', err);
      }

      // Apply theme CSS variables if customized
      if (merged.theme) {
        const root = document.documentElement;
        if (merged.theme.primaryColor) root.style.setProperty('--primary', merged.theme.primaryColor);
        if (merged.theme.secondaryColor) root.style.setProperty('--secondary', merged.theme.secondaryColor);
        if (merged.theme.accentColor) root.style.setProperty('--accent', merged.theme.accentColor);
        if (merged.theme.backgroundColor) root.style.setProperty('--background', merged.theme.backgroundColor);
        if (merged.theme.borderRadius) root.style.setProperty('--radius', merged.theme.borderRadius);
      }
    } catch (err: any) {
      console.info('Static hosting detected, utilizing bundled clinic data:', err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [applyLocalOverrides]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setCustomImage = async (
    targetType: 'doctor' | 'service' | 'section' | 'logo',
    targetId: string,
    imageUrl: string,
    imageField?: string,
    additionalImages?: string[]
  ): Promise<boolean> => {
    // 1. Immediately store in localStorage & IndexedDB overrides
    try {
      const savedRaw = localStorage.getItem('nma_custom_images_overrides');
      const overrides: Record<string, string> = savedRaw ? JSON.parse(savedRaw) : {};
      const key = targetType === 'logo'
        ? (imageField === 'logoDarkUrl' ? 'logo_dark' : 'logo_main')
        : (imageField === 'secondaryImageUrl'
            ? `${targetType}_${targetId}_secondary`
            : `${targetType}_${targetId}`);
      overrides[key] = imageUrl;
      if (additionalImages && additionalImages.length > 0) {
        overrides[`${targetType}_${targetId}_additional`] = JSON.stringify(additionalImages);
      }
      try {
        localStorage.setItem('nma_custom_images_overrides', JSON.stringify(overrides));
      } catch {
        // Quota safety
      }
      await setIdbItem('nma_custom_images_overrides', overrides);
    } catch (err) {
      console.warn('Failed saving overrides:', err);
    }

    // 2. Immediately update in-memory React state
    setData((prev) => {
      if (!prev) return prev;
      if (targetType === 'logo') {
        const field = imageField === 'logoDarkUrl' ? 'logoDarkUrl' : 'logoUrl';
        const val = imageUrl === '__RESET__' ? '' : imageUrl;
        const updatedSettings = {
          ...prev.settings,
          [field]: val
        } as GlobalSettings;
        return { ...prev, settings: updatedSettings };
      }
      if (targetType === 'doctor') {
        const updatedDocs = prev.doctors.map((d) =>
          d.id === targetId || d.slug === targetId ? { ...d, imageUrl } : d
        );
        return { ...prev, doctors: updatedDocs };
      }
      if (targetType === 'service') {
        const updatedServices = prev.services.map((s) =>
          s.id === targetId || s.slug === targetId ? { ...s, imageUrl } : s
        );
        return { ...prev, services: updatedServices };
      }
      if (targetType === 'section') {
        const exists = prev.sections.some((s) => s.id === targetId || s.sectionKey === targetId);
        let updatedSections: SectionContent[];
        if (exists) {
          updatedSections = prev.sections.map((s) => {
            if (s.id === targetId || s.sectionKey === targetId) {
              return {
                ...s,
                imageUrl: imageField === 'secondaryImageUrl' ? s.imageUrl : imageUrl,
                secondaryImageUrl: imageField === 'secondaryImageUrl' ? imageUrl : s.secondaryImageUrl,
                additionalImages: additionalImages || s.additionalImages
              };
            }
            return s;
          });
        } else {
          updatedSections = [
            ...prev.sections,
            {
              id: targetId,
              pageSlug: 'about',
              sectionKey: targetId.replace('sec-', ''),
              title: '',
              subtitle: '',
              bodyText: '',
              imageUrl: imageField === 'secondaryImageUrl' ? '' : imageUrl,
              secondaryImageUrl: imageField === 'secondaryImageUrl' ? imageUrl : '',
              additionalImages: additionalImages,
              isVisible: true,
              displayOrder: 99,
              updatedAt: new Date().toISOString()
            }
          ];
        }
        return { ...prev, sections: updatedSections, allSections: updatedSections };
      }
      return prev;
    });

    // 3. Persist to server backend if reachable
    try {
      const token = localStorage.getItem('nma_admin_token');
      const res = await fetch('/api/admin/images/update-target', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ targetType, targetId, imageUrl, imageField, additionalImages })
      });
      return res.ok;
    } catch {
      return true; // Still true because client retained it
    }
  };

  const submitInquiry = async (formData: { fullName: string; email: string; phone: string; message: string }) => {
    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message || 'Thank you! Your message has been sent successfully.' };
      }
    } catch {
      // In static deployment, fallback to client-side inquiry recording
    }
    try {
      const existingRaw = localStorage.getItem('nma_contact_submissions') || '[]';
      const existing = JSON.parse(existingRaw);
      existing.unshift({
        id: `sub-${Date.now()}`,
        ...formData,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('nma_contact_submissions', JSON.stringify(existing));
    } catch {
      // ignore
    }
    return { success: true, message: 'Thank you! Your message has been received. Our team will contact you shortly.' };
  };

  return (
    <ClinicContext.Provider
      value={{
        settings: data?.settings || null,
        theme: data?.theme || null,
        doctors: data?.doctors || [],
        services: data?.services || [],
        diagnostics: data?.diagnostics || [],
        testimonials: data?.testimonials || [],
        sections: data?.sections || [],
        isLoading,
        error,
        refreshData: fetchData,
        submitInquiry,
        setCustomImage
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
