import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Home,
  Info,
  Stethoscope,
  Users,
  Sparkles,
  RefreshCw,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { uploadImageUnified } from '../../utils/mediaUpload';

type ActiveTab = 'home' | 'about' | 'services' | 'providers' | 'branding';

interface ImageItemCardProps {
  title: string;
  subtitle: string;
  locationLabel: string;
  currentUrl: string;
  defaultFallbackUrl: string;
  aspectRatioLabel: string;
  onSelectImage: (newUrl: string) => Promise<void>;
  onDirectUpload: (file: File) => Promise<void>;
  onResetToDefault: () => Promise<void>;
  uploading: boolean;
}

const ImageItemCard: React.FC<ImageItemCardProps> = ({
  title,
  subtitle,
  locationLabel,
  currentUrl,
  defaultFallbackUrl,
  aspectRatioLabel,
  onSelectImage,
  onDirectUpload,
  onResetToDefault,
  uploading
}) => {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isCustom = Boolean(currentUrl && currentUrl !== defaultFallbackUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onDirectUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            {locationLabel}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isCustom ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}
          >
            {isCustom ? 'Custom Image' : 'Default Asset'}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>

        {/* Image Preview Box */}
        <div className="mt-4 relative aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 group">
          <img
            src={currentUrl || defaultFallbackUrl}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => {
              if (defaultFallbackUrl && e.currentTarget.src !== defaultFallbackUrl) {
                e.currentTarget.src = defaultFallbackUrl;
              }
            }}
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] font-medium text-white rounded-md">
            {aspectRatioLabel}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving image...</span>
            </div>
          )}
        </div>

        {/* Current Path Indicator */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
          <span className="text-slate-500 font-medium">Path:</span>
          <span className="truncate">{currentUrl || defaultFallbackUrl}</span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {/* Direct Upload Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New</span>
        </button>

        <button
          type="button"
          onClick={() => setMediaPickerOpen(true)}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Choose</span>
        </button>

        {isCustom && (
          <button
            type="button"
            onClick={onResetToDefault}
            disabled={uploading}
            title="Reset to default asset image"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={async (selectedUrl) => {
          await onSelectImage(selectedUrl);
          setMediaPickerOpen(false);
        }}
        currentImage={currentUrl}
      />
    </div>
  );
};

export const AdminImagesManager: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { doctors, services, sections, settings, setCustomImage, refreshData } = useClinic();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  // Upload file helper that saves to /api/admin/media/upload and then targets the section/doctor
  const handleDirectUpload = async (
    targetType: 'doctor' | 'service' | 'section' | 'logo',
    targetId: string,
    file: File,
    imageField?: string,
    additionalImages?: string[]
  ) => {
    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setUploadingTarget(`${targetType}_${targetId}_${imageField || 'primary'}`);
      const category = targetType === 'doctor' ? 'doctors' : targetType === 'service' ? 'services' : 'general';
      const newAsset = await uploadImageUnified(file, category, getAuthHeaders());

      await setCustomImage(targetType, targetId, newAsset.url, imageField, additionalImages);
      showSuccess(`Successfully uploaded and set new image for ${targetId}!`);
    } catch (err: any) {
      showError(err.message || 'Image upload failed');
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSelectImage = async (
    targetType: 'doctor' | 'service' | 'section' | 'logo',
    targetId: string,
    newUrl: string,
    imageField?: string,
    additionalImages?: string[]
  ) => {
    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    try {
      setUploadingTarget(`${targetType}_${targetId}_${imageField || 'primary'}`);
      await setCustomImage(targetType, targetId, newUrl, imageField, additionalImages);
      showSuccess('Image updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to update image');
    } finally {
      setUploadingTarget(null);
    }
  };

  // HOME SECTIONS
  const heroSec = sections.find((s) => s.sectionKey === 'hero') || {
    id: 'sec-hero',
    imageUrl: '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg',
    additionalImages: [
      '/src/assets/images/avatar_patient_1_1791532566289.jpg',
      '/src/assets/images/avatar_patient_2_1791532576262.jpg',
      '/src/assets/images/avatar_patient_3_1791532595296.jpg'
    ]
  };
  const servicesSec = sections.find((s) => s.sectionKey === 'services') || {
    id: 'sec-services',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg'
  };
  const aboutSec = sections.find((s) => s.sectionKey === 'about') || {
    id: 'sec-about',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg'
  };
  const diagSec = sections.find((s) => s.sectionKey === 'diagnostics') || {
    id: 'sec-diagnostics',
    imageUrl: '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg'
  };
  const processSec = sections.find((s) => s.sectionKey === 'process') || {
    id: 'sec-process',
    imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg'
  };

  // ABOUT SECTIONS
  const aboutIntroSec = sections.find((s) => s.sectionKey === 'about_intro' || s.id === 'sec-about-intro') || {
    id: 'sec-about-intro',
    imageUrl: '/src/assets/images/gallery_screening_1_1791534688866.jpg',
    secondaryImageUrl: '/src/assets/images/gallery_screening_2_1791534700033.jpg',
    additionalImages: [
      '/src/assets/images/gallery_screening_1_1791534688866.jpg',
      '/src/assets/images/gallery_screening_2_1791534700033.jpg',
      '/src/assets/images/gallery_screening_3_1791534712268.jpg'
    ]
  };
  const aboutMissionSec = sections.find((s) => s.sectionKey === 'about_mission' || s.id === 'sec-about-mission') || {
    id: 'sec-about-mission',
    imageUrl: '/src/assets/images/mission_doctor_capsule_1791534727327.jpg',
    secondaryImageUrl: '/src/assets/images/mission_blood_pressure_1791534804414.jpg'
  };
  const aboutVisionSec = sections.find((s) => s.sectionKey === 'about_vision' || s.id === 'sec-about-vision') || {
    id: 'sec-about-vision',
    imageUrl: '/src/assets/images/vision_consultation_warm_1791534815659.jpg'
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Media &amp; Visual Assets
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Website Images Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Easily update, change, and upload images across the Home, About, Services, and Providers sections of Newark Medical Associates. All uploads are permanently stored with multi-folder backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Notification Toasts */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorToast}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-px">
          {[
            { id: 'home', label: 'Home Page', icon: Home, count: 8 },
            { id: 'about', label: 'About Page', icon: Info, count: 6 },
            { id: 'services', label: 'Services', icon: Stethoscope, count: services.length },
            { id: 'providers', label: 'Providers / Doctors', icon: Users, count: doctors.length },
            { id: 'branding', label: 'Branding & Logo', icon: Sparkles, count: 2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`py-3 px-3 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: HOME PAGE IMAGES
          ========================================================================= */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Hero Consultation Image */}
            <ImageItemCard
              title="Hero Section Consultation"
              subtitle="Prominently featured right column image in the top hero banner with rounded soft-teal overlay."
              locationLabel="Home: Hero Banner"
              currentUrl={heroSec.imageUrl || '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg'}
              defaultFallbackUrl="/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg"
              aspectRatioLabel="Landscape (16:10)"
              uploading={uploadingTarget === 'section_sec-hero_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-hero', file)}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-hero', newUrl)}
              onResetToDefault={() => handleSelectImage('section', 'sec-hero', '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg')}
            />

            {/* 2. Services Overview Banner */}
            <ImageItemCard
              title="Services Section Visual"
              subtitle="Featured image representing outpatient primary care and specialized facilities."
              locationLabel="Home: Services Section"
              currentUrl={servicesSec.imageUrl || '/src/assets/images/nma_about_clinic_1791527274487.jpg'}
              defaultFallbackUrl="/src/assets/images/nma_about_clinic_1791527274487.jpg"
              aspectRatioLabel="Landscape (16:9)"
              uploading={uploadingTarget === 'section_sec-services_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-services', file)}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-services', newUrl)}
              onResetToDefault={() => handleSelectImage('section', 'sec-services', '/src/assets/images/nma_about_clinic_1791527274487.jpg')}
            />

            {/* 3. About Us Preview Banner */}
            <ImageItemCard
              title="About Clinic Preview"
              subtitle="Reception and consultation clinic visual displayed on the homepage preview block."
              locationLabel="Home: About Preview"
              currentUrl={aboutSec.imageUrl || '/src/assets/images/nma_about_clinic_1791527274487.jpg'}
              defaultFallbackUrl="/src/assets/images/nma_about_clinic_1791527274487.jpg"
              aspectRatioLabel="Landscape (16:9)"
              uploading={uploadingTarget === 'section_sec-about_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-about', file)}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-about', newUrl)}
              onResetToDefault={() => handleSelectImage('section', 'sec-about', '/src/assets/images/nma_about_clinic_1791527274487.jpg')}
            />

            {/* 4. Diagnostics Laboratory */}
            <ImageItemCard
              title="On-Site Diagnostics Suite"
              subtitle="EKG, blood draw, and diagnostic laboratory testing room visual."
              locationLabel="Home: Diagnostics"
              currentUrl={diagSec.imageUrl || '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg'}
              defaultFallbackUrl="/src/assets/images/nma_diagnostic_lab_1791527285928.jpg"
              aspectRatioLabel="Landscape (16:9)"
              uploading={uploadingTarget === 'section_sec-diagnostics_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-diagnostics', file)}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-diagnostics', newUrl)}
              onResetToDefault={() => handleSelectImage('section', 'sec-diagnostics', '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg')}
            />

            {/* 5. Process / How It Works */}
            <ImageItemCard
              title="Care Philosophy & Consultation"
              subtitle="Doctor consulting with patient demonstrating patient-first listening approach."
              locationLabel="Home: Process Section"
              currentUrl={processSec.imageUrl || '/src/assets/images/nma_hero_consultation_1791527202023.jpg'}
              defaultFallbackUrl="/src/assets/images/nma_hero_consultation_1791527202023.jpg"
              aspectRatioLabel="Landscape (16:9)"
              uploading={uploadingTarget === 'section_sec-process_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-process', file)}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-process', newUrl)}
              onResetToDefault={() => handleSelectImage('section', 'sec-process', '/src/assets/images/nma_hero_consultation_1791527202023.jpg')}
            />

            {/* 6. Hero Patient Avatar 1 */}
            <ImageItemCard
              title="Hero Indicator: Patient Avatar 1"
              subtitle="First circular avatar in the '1000+ Appointments' badge under the hero CTA buttons."
              locationLabel="Home: Hero Avatar 1"
              currentUrl={heroSec.additionalImages?.[0] || '/src/assets/images/avatar_patient_1_1791532566289.jpg'}
              defaultFallbackUrl="/src/assets/images/avatar_patient_1_1791532566289.jpg"
              aspectRatioLabel="Circular Avatar (1:1)"
              uploading={uploadingTarget === 'section_sec-hero_avatar1'}
              onDirectUpload={async (file) => {
                const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [asset.url, cur[1], cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 1!');
              }}
              onSelectImage={async (newUrl) => {
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [newUrl, cur[1], cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 1!');
              }}
              onResetToDefault={async () => {
                const cur = heroSec.additionalImages || [];
                const updated = ['/src/assets/images/avatar_patient_1_1791532566289.jpg', cur[1], cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
              }}
            />

            {/* 7. Hero Patient Avatar 2 */}
            <ImageItemCard
              title="Hero Indicator: Patient Avatar 2"
              subtitle="Center circular avatar in the '1000+ Appointments' badge under the hero CTA buttons."
              locationLabel="Home: Hero Avatar 2"
              currentUrl={heroSec.additionalImages?.[1] || '/src/assets/images/avatar_patient_2_1791532576262.jpg'}
              defaultFallbackUrl="/src/assets/images/avatar_patient_2_1791532576262.jpg"
              aspectRatioLabel="Circular Avatar (1:1)"
              uploading={uploadingTarget === 'section_sec-hero_avatar2'}
              onDirectUpload={async (file) => {
                const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [cur[0], asset.url, cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 2!');
              }}
              onSelectImage={async (newUrl) => {
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [cur[0], newUrl, cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 2!');
              }}
              onResetToDefault={async () => {
                const cur = heroSec.additionalImages || [];
                const updated = [cur[0], '/src/assets/images/avatar_patient_2_1791532576262.jpg', cur[2]];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
              }}
            />

            {/* 8. Hero Patient Avatar 3 */}
            <ImageItemCard
              title="Hero Indicator: Patient Avatar 3"
              subtitle="Right circular avatar in the '1000+ Appointments' badge under the hero CTA buttons."
              locationLabel="Home: Hero Avatar 3"
              currentUrl={heroSec.additionalImages?.[2] || '/src/assets/images/avatar_patient_3_1791532595296.jpg'}
              defaultFallbackUrl="/src/assets/images/avatar_patient_3_1791532595296.jpg"
              aspectRatioLabel="Circular Avatar (1:1)"
              uploading={uploadingTarget === 'section_sec-hero_avatar3'}
              onDirectUpload={async (file) => {
                const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [cur[0], cur[1], asset.url];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 3!');
              }}
              onSelectImage={async (newUrl) => {
                const cur = heroSec.additionalImages || [
                  '/src/assets/images/avatar_patient_1_1791532566289.jpg',
                  '/src/assets/images/avatar_patient_2_1791532576262.jpg',
                  '/src/assets/images/avatar_patient_3_1791532595296.jpg'
                ];
                const updated = [cur[0], cur[1], newUrl];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
                showSuccess('Updated Patient Avatar 3!');
              }}
              onResetToDefault={async () => {
                const cur = heroSec.additionalImages || [];
                const updated = [cur[0], cur[1], '/src/assets/images/avatar_patient_3_1791532595296.jpg'];
                await setCustomImage('section', 'sec-hero', heroSec.imageUrl || '', 'imageUrl', updated);
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ABOUT PAGE IMAGES
          ========================================================================= */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gallery 1: Screening */}
            <ImageItemCard
              title="Intro Gallery 1: Screening Consultation"
              subtitle="First card in the 3-image gallery showing healthcare professionals interacting with patients."
              locationLabel="About: Gallery Card 1"
              currentUrl={aboutIntroSec.additionalImages?.[0] || aboutIntroSec.imageUrl || '/src/assets/images/gallery_screening_1_1791534688866.jpg'}
              defaultFallbackUrl="/src/assets/images/gallery_screening_1_1791534688866.jpg"
              aspectRatioLabel="Vertical (3:4)"
              uploading={uploadingTarget === 'section_sec-about-intro_primary'}
              onDirectUpload={async (file) => {
                try {
                  setUploadingTarget('section_sec-about-intro_primary');
                  const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                  const currentImgs = aboutIntroSec.additionalImages || [
                    '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                    '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                    '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                  ];
                  const updated = [asset.url, currentImgs[1], currentImgs[2]];
                  await setCustomImage('section', 'sec-about-intro', asset.url, 'imageUrl', updated);
                  showSuccess('Updated Gallery Image 1!');
                } catch (err: any) {
                  showError(err?.message || 'Upload failed');
                } finally {
                  setUploadingTarget(null);
                }
              }}
              onSelectImage={async (newUrl) => {
                const currentImgs = aboutIntroSec.additionalImages || [
                  '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                  '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                  '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                ];
                const updated = [newUrl, currentImgs[1], currentImgs[2]];
                await setCustomImage('section', 'sec-about-intro', newUrl, 'imageUrl', updated);
              }}
              onResetToDefault={async () => {
                const currentImgs = aboutIntroSec.additionalImages || [];
                const updated = ['/src/assets/images/gallery_screening_1_1791534688866.jpg', currentImgs[1], currentImgs[2]];
                await setCustomImage('section', 'sec-about-intro', '/src/assets/images/gallery_screening_1_1791534688866.jpg', 'imageUrl', updated);
              }}
            />

            {/* Gallery 2: Diagnostic Exam */}
            <ImageItemCard
              title="Intro Gallery 2: Diagnostic Exam"
              subtitle="Second card in the 3-image gallery showing medical professional performing clinical test."
              locationLabel="About: Gallery Card 2"
              currentUrl={aboutIntroSec.additionalImages?.[1] || aboutIntroSec.secondaryImageUrl || '/src/assets/images/gallery_screening_2_1791534700033.jpg'}
              defaultFallbackUrl="/src/assets/images/gallery_screening_2_1791534700033.jpg"
              aspectRatioLabel="Vertical (3:4)"
              uploading={uploadingTarget === 'section_sec-about-intro_secondaryImageUrl'}
              onDirectUpload={async (file) => {
                try {
                  setUploadingTarget('section_sec-about-intro_secondaryImageUrl');
                  const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                  const currentImgs = aboutIntroSec.additionalImages || [
                    '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                    '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                    '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                  ];
                  const updated = [currentImgs[0], asset.url, currentImgs[2]];
                  await setCustomImage('section', 'sec-about-intro', asset.url, 'secondaryImageUrl', updated);
                  showSuccess('Updated Gallery Image 2!');
                } catch (err: any) {
                  showError(err?.message || 'Upload failed');
                } finally {
                  setUploadingTarget(null);
                }
              }}
              onSelectImage={async (newUrl) => {
                const currentImgs = aboutIntroSec.additionalImages || [
                  '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                  '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                  '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                ];
                const updated = [currentImgs[0], newUrl, currentImgs[2]];
                await setCustomImage('section', 'sec-about-intro', newUrl, 'secondaryImageUrl', updated);
              }}
              onResetToDefault={async () => {
                const currentImgs = aboutIntroSec.additionalImages || [];
                const updated = [currentImgs[0], '/src/assets/images/gallery_screening_2_1791534700033.jpg', currentImgs[2]];
                await setCustomImage('section', 'sec-about-intro', '/src/assets/images/gallery_screening_2_1791534700033.jpg', 'secondaryImageUrl', updated);
              }}
            />

            {/* Gallery 3: Community Health Outreach */}
            <ImageItemCard
              title="Intro Gallery 3: Community Outreach"
              subtitle="Third card in the 3-image gallery showing medical professionals and community screening."
              locationLabel="About: Gallery Card 3"
              currentUrl={aboutIntroSec.additionalImages?.[2] || '/src/assets/images/gallery_screening_3_1791534712268.jpg'}
              defaultFallbackUrl="/src/assets/images/gallery_screening_3_1791534712268.jpg"
              aspectRatioLabel="Vertical (3:4)"
              uploading={uploadingTarget === 'section_sec-about-intro_img3'}
              onDirectUpload={async (file) => {
                try {
                  setUploadingTarget('section_sec-about-intro_img3');
                  const asset = await uploadImageUnified(file, 'general', getAuthHeaders());
                  const currentImgs = aboutIntroSec.additionalImages || [
                    '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                    '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                    '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                  ];
                  const updated = [currentImgs[0], currentImgs[1], asset.url];
                  await setCustomImage('section', 'sec-about-intro', currentImgs[0], 'imageUrl', updated);
                  showSuccess('Updated Gallery Image 3!');
                } catch (err: any) {
                  showError(err?.message || 'Upload failed');
                } finally {
                  setUploadingTarget(null);
                }
              }}
              onSelectImage={async (newUrl) => {
                const currentImgs = aboutIntroSec.additionalImages || [
                  '/src/assets/images/gallery_screening_1_1791534688866.jpg',
                  '/src/assets/images/gallery_screening_2_1791534700033.jpg',
                  '/src/assets/images/gallery_screening_3_1791534712268.jpg'
                ];
                const updated = [currentImgs[0], currentImgs[1], newUrl];
                await setCustomImage('section', 'sec-about-intro', currentImgs[0], 'imageUrl', updated);
              }}
              onResetToDefault={async () => {
                const currentImgs = aboutIntroSec.additionalImages || [];
                const updated = [currentImgs[0], currentImgs[1], '/src/assets/images/gallery_screening_3_1791534712268.jpg'];
                await setCustomImage('section', 'sec-about-intro', currentImgs[0], 'imageUrl', updated);
              }}
            />

            {/* Mission: Doctor Main Capsule */}
            <ImageItemCard
              title="Our Mission: Lead Clinician Capsule"
              subtitle="Tall rounded pill-capsule portrait visual representing healthcare excellence."
              locationLabel="About: Mission Pill 1"
              currentUrl={aboutMissionSec.imageUrl || '/src/assets/images/mission_doctor_capsule_1791534727327.jpg'}
              defaultFallbackUrl="/src/assets/images/mission_doctor_capsule_1791534727327.jpg"
              aspectRatioLabel="Capsule (Pill)"
              uploading={uploadingTarget === 'section_sec-about-mission_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-about-mission', file, 'imageUrl')}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-about-mission', newUrl, 'imageUrl')}
              onResetToDefault={() => handleSelectImage('section', 'sec-about-mission', '/src/assets/images/mission_doctor_capsule_1791534727327.jpg', 'imageUrl')}
            />

            {/* Mission: Blood Pressure Capsule */}
            <ImageItemCard
              title="Our Mission: Blood Pressure Capsule"
              subtitle="Overlapping rounded bottom capsule visual showing diagnostic blood pressure monitoring."
              locationLabel="About: Mission Pill 2"
              currentUrl={aboutMissionSec.secondaryImageUrl || '/src/assets/images/mission_blood_pressure_1791534804414.jpg'}
              defaultFallbackUrl="/src/assets/images/mission_blood_pressure_1791534804414.jpg"
              aspectRatioLabel="Capsule (Small Pill)"
              uploading={uploadingTarget === 'section_sec-about-mission_secondaryImageUrl'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-about-mission', file, 'secondaryImageUrl')}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-about-mission', newUrl, 'secondaryImageUrl')}
              onResetToDefault={() => handleSelectImage('section', 'sec-about-mission', '/src/assets/images/mission_blood_pressure_1791534804414.jpg', 'secondaryImageUrl')}
            />

            {/* Vision: Consultation Image */}
            <ImageItemCard
              title="Our Vision: Patient Consultation"
              subtitle="Warm clinical consultation visual displayed in the rounded right column of Our Vision section."
              locationLabel="About: Vision Block"
              currentUrl={aboutVisionSec.imageUrl || '/src/assets/images/vision_consultation_warm_1791534815659.jpg'}
              defaultFallbackUrl="/src/assets/images/vision_consultation_warm_1791534815659.jpg"
              aspectRatioLabel="Landscape / Curved"
              uploading={uploadingTarget === 'section_sec-about-vision_primary'}
              onDirectUpload={(file) => handleDirectUpload('section', 'sec-about-vision', file, 'imageUrl')}
              onSelectImage={(newUrl) => handleSelectImage('section', 'sec-about-vision', newUrl, 'imageUrl')}
              onResetToDefault={() => handleSelectImage('section', 'sec-about-vision', '/src/assets/images/vision_consultation_warm_1791534815659.jpg', 'imageUrl')}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SERVICES IMAGES
          ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ImageItemCard
                key={service.id}
                title={service.name}
                subtitle={service.shortDesc}
                locationLabel={`Service: ${service.slug}`}
                currentUrl={service.imageUrl || '/src/assets/images/nma_hero_consultation_1791527202023.jpg'}
                defaultFallbackUrl="/src/assets/images/nma_hero_consultation_1791527202023.jpg"
                aspectRatioLabel="Landscape (16:10)"
                uploading={uploadingTarget === `service_${service.id}_primary`}
                onDirectUpload={(file) => handleDirectUpload('service', service.id, file)}
                onSelectImage={(newUrl) => handleSelectImage('service', service.id, newUrl)}
                onResetToDefault={() => handleSelectImage('service', service.id, '/src/assets/images/nma_hero_consultation_1791527202023.jpg')}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROVIDERS / DOCTORS IMAGES
          ========================================================================= */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Provider Portraits Persistence:</span> Uploaded photos for Dr. Prahlad Gadhavi, Dr. Deval Gadhvi, Dr. Sankalp Pathak, and Dr. Disha Patel are safely backed up across physical storage folders and browser cache. They will never disappear or revert automatically.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => {
              // Default fallback asset based on doctor id
              const fallbackMap: Record<string, string> = {
                'doc-1': '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
                'doc-2': '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
                'doc-3': '/src/assets/images/dr_sankalp_pathak_1791527235581.jpg',
                'doc-4': '/src/assets/images/dr_disha_patel_1791527246009.jpg'
              };
              const defaultAsset = fallbackMap[doctor.id] || '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg';

              return (
                <ImageItemCard
                  key={doctor.id}
                  title={doctor.name}
                  subtitle={`${doctor.title} · ${doctor.qualifications}`}
                  locationLabel="Doctor Portrait"
                  currentUrl={doctor.imageUrl}
                  defaultFallbackUrl={defaultAsset}
                  aspectRatioLabel="Portrait (4:5)"
                  uploading={uploadingTarget === `doctor_${doctor.id}_primary`}
                  onDirectUpload={(file) => handleDirectUpload('doctor', doctor.id, file)}
                  onSelectImage={(newUrl) => handleSelectImage('doctor', doctor.id, newUrl)}
                  onResetToDefault={() => handleSelectImage('doctor', doctor.id, defaultAsset)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BRANDING & LOGO
          ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-blue-950">Website Logo &amp; Identity Assets</h3>
              <p className="text-xs text-blue-700 mt-0.5">
                Update the primary logo displayed on light headers, or configure an optional dark-background logo for the footer and admin sidebar.
              </p>
            </div>
            <Link
              to="/admin/settings"
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Practice Settings &amp; Full Options</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Logo */}
            <ImageItemCard
              title="Primary Website Logo"
              subtitle="Displayed in the top navigation bar and mobile drawer on light backgrounds. Transparent PNG, SVG, or high-res WebP recommended."
              locationLabel="Header &amp; Navigation"
              currentUrl={settings?.logoUrl || ''}
              defaultFallbackUrl=""
              aspectRatioLabel="Horizontal Logo (4:1 or 3:1)"
              uploading={uploadingTarget === 'logo_main_primary'}
              onDirectUpload={(file) => handleDirectUpload('logo', 'main', file, 'logoUrl')}
              onSelectImage={(newUrl) => handleSelectImage('logo', 'main', newUrl, 'logoUrl')}
              onResetToDefault={() => handleSelectImage('logo', 'main', '__RESET__', 'logoUrl')}
            />

            {/* Footer / Dark Mode Logo */}
            <ImageItemCard
              title="Footer &amp; Dark Theme Logo"
              subtitle="Displayed in the dark navy footer and CMS admin sidebar. If unassigned, automatically falls back to your primary logo."
              locationLabel="Footer &amp; Dark Backgrounds"
              currentUrl={settings?.logoDarkUrl || ''}
              defaultFallbackUrl=""
              aspectRatioLabel="Horizontal Logo (4:1 or 3:1)"
              uploading={uploadingTarget === 'logo_dark_logoDarkUrl'}
              onDirectUpload={(file) => handleDirectUpload('logo', 'dark', file, 'logoDarkUrl')}
              onSelectImage={(newUrl) => handleSelectImage('logo', 'dark', newUrl, 'logoDarkUrl')}
              onResetToDefault={() => handleSelectImage('logo', 'dark', '__RESET__', 'logoDarkUrl')}
            />
          </div>
        </div>
      )}
    </div>
  );
};
