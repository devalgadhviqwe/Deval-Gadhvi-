import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseState, AdminUser, Doctor, Service, DiagnosticService, Testimonial, MediaAsset, ContactSubmission, SectionContent, GlobalSettings, ThemeSettings, AuditLog, BlogPost } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic_data.json');

const INITIAL_SETTINGS: GlobalSettings = {
  practiceName: 'Newark Medical Associates',
  tagline: 'Primary & Preventative Care in Newark',
  phone: '(973) 412-9404',
  email: 'medicalnewark@gmail.com',
  address: '337 Bloomfield Avenue, Newark, NJ 07107',
  workingHours: 'Monday – Friday: 8:30 AM – 6:00 PM | Saturday: 9:00 AM – 2:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=337+Bloomfield+Avenue+Newark+NJ+07107',
  emergencyNotice: 'If you are experiencing a medical emergency, please call 911 immediately or proceed to the nearest emergency department.',
  primaryCtaLabel: 'Contact Us',
  primaryCtaUrl: '/contact',
  secondaryCtaLabel: 'Our Providers',
  secondaryCtaUrl: '/providers',
  footerDescription: 'Dedicated to compassionate, high-quality primary and preventative healthcare in Newark. Our board-certified clinicians provide personalized care, diagnostics, cardiology, and rehabilitation under one roof.',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com'
};

const INITIAL_THEME: ThemeSettings = {
  primaryColor: '#1e3a8a',
  secondaryColor: '#0284c7',
  accentColor: '#0d9488',
  backgroundColor: '#f8fafc',
  fontFamily: 'Plus Jakarta Sans',
  borderRadius: '0.5rem'
};

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    slug: 'dr-prahlad-gadhavi',
    name: 'Dr. Prahlad Gadhavi',
    title: 'Primary Care Physician & Founder',
    qualifications: 'MD, Board Certified Internal Medicine Specialist',
    experienceYears: '25+ Years Experience',
    specialties: ['Internal Medicine', 'Preventative Care', 'Chronic Disease Management', 'Geriatric Care', 'Health Screenings'],
    education: 'B.J. Medical College (MBBS); Mount Sinai and Beth Israel Medical Centers, NYC (Residency)',
    hospitalAffiliations: 'Jersey City Medical Center, RWJBarnabas Health',
    bio: 'Dr. Prahlad Gadhavi is an esteemed board-certified Internal Medicine specialist and founder of Newark Medical Associates. With over 25 years of extensive clinical practice in New Jersey, Dr. Gadhavi takes a holistic and compassionate approach to health. Known for his attentive listening and thorough diagnostic evaluations, he partners with patients to build proactive wellness plans that prevent illness and manage complex chronic health conditions.',
    clinicLocation: '337 Bloomfield Avenue, Newark, NJ 07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    availability: 'Mon, Tue, Thu, Fri: 9:00 AM – 5:00 PM',
    imageUrl: '/uploads/aU1QUlSKO9mpYg2rCyxW7d2q0_1791973543258_5455.avif',
    displayOrder: 1,
    active: true,
    metaTitle: 'Dr. Prahlad Gadhavi, MD | Primary Care Physician in Newark, NJ',
    metaDescription: 'Consult Dr. Prahlad Gadhavi, board-certified Internal Medicine specialist and primary care physician at Newark Medical Associates.'
  },
  {
    id: 'doc-2',
    slug: 'dr-deval-gadhvi',
    name: 'Dr. Deval Gadhvi',
    title: 'Medical Director — Primary Care Physician',
    qualifications: 'MD, Board Certified by the American Board of Internal Medicine',
    experienceYears: '18+ Years Experience',
    specialties: ['Primary Care', "Women's Health", 'Holistic Wellness', 'Weight Management & Nutrition', 'Preventative Screenings'],
    education: 'M.P. Shah Medical College (MD); Beth Israel Medical Center, NYC (Residency)',
    hospitalAffiliations: 'RWJBarnabas Health, Jersey City Medical Center',
    bio: 'Dr. Deval Gadhvi is the Medical Director and Primary Care Physician at Newark Medical Associates. Board-certified in Internal Medicine, Dr. Gadhvi combines modern evidence-based clinical science with lifestyle medicine, focusing on nutrition, movement, stress reduction, and early detection. As a breast cancer survivor and global health advocate (initiator of "Let’s Save Maa"), Dr. Gadhvi provides a deeply empathetic, patient-centered atmosphere where every patient is heard and respected.',
    clinicLocation: '337 Bloomfield Avenue, Newark, NJ 07107',
    phone: '(973) 412-9404',
    email: 'medicalnewark@gmail.com',
    availability: 'Monday – Friday: 9:00 AM – 5:00 PM',
    imageUrl: '/uploads/SiRK7DEBXDBaO1d4R9uqpEvLUg_1791973553041_9635.avif',
    displayOrder: 2,
    active: true,
    metaTitle: 'Dr. Deval Gadhvi, MD | Medical Director & Primary Care in Newark, NJ',
    metaDescription: 'Dr. Deval Gadhvi is Medical Director at Newark Medical Associates, offering comprehensive primary care and holistic preventative medicine.'
  },
  {
    id: 'doc-3',
    slug: 'dr-sankalp-pathak',
    name: 'Dr. Sankalp Pathak',
    title: 'Interventional Cardiologist',
    qualifications: 'MD, FACC, FSCAI, Board Certified in Interventional Cardiology & Cardiovascular Disease',
    experienceYears: '15+ Years Experience',
    specialties: ['Interventional Cardiology', 'Cardiovascular Disease', 'Structural Heart Disease', 'Endovascular Treatments', 'Advanced EKG & ECHO'],
    education: 'Interventional Cardiology Fellowship; Board Certified Interventional Cardiologist',
    hospitalAffiliations: 'Morristown Medical Center, MyCardioVascular Clinic',
    bio: 'Dr. Sankalp Pathak is a premier board-certified interventional cardiologist providing specialized cardiovascular care at Newark Medical Associates. Dr. Pathak provides comprehensive outpatient cardiac consultations, diagnostic testing including echocardiography, stress testing, and cardiac monitoring, as well as hospital-based interventional coronary procedures. He emphasizes preventive cardiovascular screening to safeguard long-term vascular health.',
    clinicLocation: '337 Bloomfield Avenue, Newark, NJ 07107',
    phone: '(973) 370-5259',
    email: 'mycardiovascularclinic@mycardiovascularclinic.com',
    availability: 'Mon, Wed, Fri, Sat: 9:00 AM – 5:00 PM',
    imageUrl: '/uploads/llBwa8qqHJ0lkN1qwePotRnzyg_1791973561605_204.avif',
    displayOrder: 3,
    active: true,
    metaTitle: 'Dr. Sankalp Pathak, MD | Interventional Cardiologist in Newark, NJ',
    metaDescription: 'Board-certified cardiologist Dr. Sankalp Pathak provides advanced cardiovascular consultations, EKGs, and diagnostics at Newark Medical Associates.'
  },
  {
    id: 'doc-4',
    slug: 'dr-disha-patel',
    name: 'Dr. Disha Patel',
    title: 'Physical Therapist',
    qualifications: 'PT, DPT, Doctor of Physical Therapy',
    experienceYears: '10+ Years Experience',
    specialties: ['Musculoskeletal Rehabilitation', 'Post-Operative Therapy', 'Sports Injury Recovery', 'Joint & Spine Mobility', 'Pain Management'],
    education: 'Doctor of Physical Therapy (DPT); Licensed Physical Therapist (State of New Jersey)',
    hospitalAffiliations: 'Newark Medical Associates Physical Therapy & Rehabilitation Suite',
    bio: 'Dr. Disha Patel is an accomplished physical therapist dedicated to helping patients recover mobility, rebuild physical resilience, and overcome chronic pain. Collaborating closely with our primary care doctors and cardiologists, Dr. Patel develops customized therapeutic exercise routines, manual therapies, and functional restoration plans tailored to each individual\'s daily life.',
    clinicLocation: '337 Bloomfield Avenue, Newark, NJ 07107',
    phone: '(862) 285-4400',
    email: 'info@motionrehabpt.com',
    availability: 'Tue, Thu, Sat: 8:30 AM – 4:30 PM',
    imageUrl: '/uploads/tnrxNiojdNLKiHtHPyMhvxIsQM0_1791973570730_3593.avif',
    displayOrder: 4,
    active: true,
    metaTitle: 'Dr. Disha Patel, PT, DPT | Physical Therapy in Newark, NJ',
    metaDescription: 'Dr. Disha Patel leads physical therapy and personalized rehabilitation services at Newark Medical Associates.'
  }
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    slug: 'primary-urgent-care',
    name: 'Primary & Urgent Care',
    shortDesc: 'Immediate evaluation and ongoing treatment for acute illnesses, minor injuries, infections, and routine medical needs.',
    fullDesc: 'Our Primary & Urgent Care service offers convenient, same-day and scheduled appointments for common health concerns. From acute respiratory infections, flu symptoms, and minor cuts to routine wellness visits, our team delivers timely diagnostics, prompt prescriptions, and continuous follow-up care.',
    features: ['Same-day acute illness visits', 'Minor injury evaluations', 'Flu & COVID-19 screenings', 'Prescription management', 'Referrals to specialists'],
    treatments: ['Respiratory infections & bronchitis', 'Strep throat & sinus infections', 'Urinary tract infections', 'Minor sprains & burns', 'High fever & headache assessments'],
    doctorId: 'doc-1',
    iconName: 'Stethoscope',
    imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
    displayOrder: 1,
    active: true,
    metaTitle: 'Primary & Urgent Care Services | Newark Medical Associates',
    metaDescription: 'Compassionate primary and urgent care for adults in Newark, NJ. Same-day appointments and preventative medical care.'
  },
  {
    id: 'srv-2',
    slug: 'wellness-prevention',
    name: 'Wellness & Prevention',
    shortDesc: 'Comprehensive health assessments, routine screenings, and personalized lifestyle counseling to keep you ahead of health issues.',
    fullDesc: 'Prevention is at the core of Newark Medical Associates. Our wellness program encompasses thorough annual checkups, risk factor assessments, age-appropriate cancer screenings, blood work panels, and nutritional guidance to support long-term vitality.',
    features: ['Annual physical exams', 'Cardiovascular risk stratification', 'Diabetes & metabolic screening', 'Immunizations & booster shots', 'Lifestyle & dietary guidance'],
    treatments: ['Biometric health checkups', 'Routine blood chemistry panels', 'Blood pressure monitoring', 'Cancer prevention counseling', 'Wellness coaching'],
    doctorId: 'doc-2',
    iconName: 'ShieldCheck',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    displayOrder: 2,
    active: true,
    metaTitle: 'Wellness & Preventative Medicine | Newark Medical Associates',
    metaDescription: 'Proactive wellness and preventive medicine in Newark, NJ to safeguard long-term health and wellbeing.'
  },
  {
    id: 'srv-3',
    slug: 'disease-management',
    name: 'Disease Management',
    shortDesc: 'Long-term coordinated care for hypertension, diabetes, asthma, thyroid disorders, and complex chronic conditions.',
    fullDesc: 'Living with a chronic medical condition requires continuous, expert guidance. Our physicians craft structured management protocols, conduct routine lab monitoring, optimize medication regimens, and educate patients on lifestyle adjustments that stabilize chronic conditions.',
    features: ['Personalized care plans', 'Regular lab tracking & A1C tests', 'Medication titration & reviews', 'Coordinated specialist referrals', 'Patient education & monitoring'],
    treatments: ['Type 2 diabetes & prediabetes', 'Hypertension (high blood pressure)', 'Hyperlipidemia (cholesterol)', 'Asthma & COPD', 'Thyroid disorders'],
    doctorId: 'doc-1',
    iconName: 'Activity',
    imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
    displayOrder: 3,
    active: true,
    metaTitle: 'Chronic Disease Management | Newark Medical Associates',
    metaDescription: 'Expert management of hypertension, diabetes, high cholesterol, and chronic conditions in Newark, NJ.'
  },
  {
    id: 'srv-4',
    slug: 'weight-loss',
    name: 'Weight Loss',
    shortDesc: 'Clinically supervised weight loss protocols, metabolic evaluation, and sustainable nutrition plans tailored to your body.',
    fullDesc: 'Sustainable weight management is a medical journey rooted in biology, metabolism, and individualized lifestyle support. Under Dr. Deval Gadhvi’s guidance, our clinic offers evidence-based medical weight loss programs combining metabolic labs, nutritional counseling, and medication when clinically appropriate.',
    features: ['Metabolic & hormonal lab evaluation', 'Physician-monitored weight loss', 'Nutritional planning & meal guidance', 'Body composition tracking', 'Long-term maintenance support'],
    treatments: ['Medical weight loss protocols', 'Insulin resistance management', 'Lifestyle & behavioral coaching', 'Cardiovascular health alignment', 'Continuous progress check-ins'],
    doctorId: 'doc-2',
    iconName: 'Flame',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    displayOrder: 4,
    active: true,
    metaTitle: 'Physician-Supervised Weight Loss | Newark Medical Associates',
    metaDescription: 'Doctor-guided weight loss programs in Newark, NJ tailored to your metabolic profile and health goals.'
  },
  {
    id: 'srv-5',
    slug: 'sexual-health',
    name: 'Sexual Health',
    shortDesc: 'Confidential consultations, preventative testing, STI screening, and reproductive wellness in a safe, nonjudgmental setting.',
    fullDesc: 'We provide confidential, compassionate care for all aspects of sexual and reproductive health. Our physicians offer comprehensive screenings, preventative therapies, hormone evaluations, and prompt discreet treatments.',
    features: ['100% confidential consultations', 'On-site rapid STI/STD screenings', 'PrEP and preventative counseling', 'Hormone & vitality checks', 'Gentle nonjudgmental care'],
    treatments: ['Comprehensive STD/STI panel', 'PrEP / PEP consultation & monitoring', 'Erectile dysfunction evaluation', 'Menopause & hormonal balance', 'Reproductive wellness reviews'],
    doctorId: 'doc-2',
    iconName: 'HeartHandshake',
    imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
    displayOrder: 5,
    active: true,
    metaTitle: 'Confidential Sexual Health & STI Testing | Newark Medical Associates',
    metaDescription: 'Private, compassionate sexual health exams, confidential STI testing, and preventative care in Newark, NJ.'
  },
  {
    id: 'srv-6',
    slug: 'travel-medicine',
    name: 'Travel Medicine',
    shortDesc: 'Destination-specific immunizations, malaria prophylaxis, traveler health guidance, and pre-departure medical clearances.',
    fullDesc: 'Before departing internationally, ensure your health is protected against destination-specific pathogens and travel illnesses. Our clinicians review your itinerary, provide necessary CDC-recommended travel vaccines, and prescribe prophylactic medications.',
    features: ['Itinerary-specific vaccination plans', 'CDC guidelines adherence', 'Malaria prophylaxis prescriptions', 'Traveler diarrhea emergency kits', 'Official immunization records'],
    treatments: ['Typhoid & Hepatitis vaccinations', 'Yellow fever guidance & referrals', 'Altitude sickness prescriptions', 'Water & food safety counseling', 'Pre-travel fitness clearances'],
    doctorId: 'doc-1',
    iconName: 'Plane',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    displayOrder: 6,
    active: true,
    metaTitle: 'Travel Medicine & Vaccinations | Newark Medical Associates',
    metaDescription: 'Pre-travel consultations, destination-specific vaccinations, and travel health prescriptions in Newark, NJ.'
  },
  {
    id: 'srv-7',
    slug: 'cardiology',
    name: 'Cardiology',
    shortDesc: 'Board-certified cardiovascular evaluations, on-site EKG, echocardiography, and vascular disease prevention.',
    fullDesc: 'Led by board-certified interventional cardiologist Dr. Sankalp Pathak, our cardiology service provides advanced diagnostics and outpatient heart health care. We evaluate chest pain, palpitations, shortness of breath, and cardiovascular risk factors with high-accuracy testing.',
    features: ['Board-certified cardiologist consultations', 'On-site EKG & Echocardiography', 'Stress testing & rhythm monitoring', 'Coronary artery disease evaluation', 'Hypertension & lipid control'],
    treatments: ['Comprehensive cardiac examinations', 'Echocardiograms (ECHO)', 'Resting 12-lead EKGs', 'Cardiac stress tests', 'Arrhythmia & palpitations assessments'],
    doctorId: 'doc-3',
    iconName: 'HeartPulse',
    imageUrl: '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg',
    displayOrder: 7,
    active: true,
    metaTitle: 'Cardiovascular Care & Heart Health | Newark Medical Associates',
    metaDescription: 'Expert cardiology consultations, on-site EKG and echocardiography with Dr. Sankalp Pathak in Newark, NJ.'
  },
  {
    id: 'srv-8',
    slug: 'physical-therapy',
    name: 'Physical Therapy',
    shortDesc: 'Targeted musculoskeletal therapy, post-surgical rehabilitation, spine care, and mobility restoration.',
    fullDesc: 'Under the guidance of Dr. Disha Patel, PT, DPT, our Physical Therapy department offers personalized treatment regimens designed to restore functional movement, alleviate joint pain, and rehabilitate injuries.',
    features: ['One-on-one doctoral therapy sessions', 'Modern clinical equipment', 'Custom home exercise prescriptions', 'Manual therapy techniques', 'Post-surgical recovery protocols'],
    treatments: ['Lower back and neck pain relief', 'Knee, hip, & shoulder rehabilitation', 'Post-operative recovery plans', 'Sports injury therapy', 'Balance & gait training'],
    doctorId: 'doc-4',
    iconName: 'Dumbbell',
    imageUrl: '/src/assets/images/dr_disha_patel_1791527246009.jpg',
    displayOrder: 8,
    active: true,
    metaTitle: 'Physical Therapy & Rehabilitation | Newark Medical Associates',
    metaDescription: 'Doctor of physical therapy-led rehabilitation, mobility restoration, and pain management in Newark, NJ.'
  }
];

const INITIAL_DIAGNOSTICS: DiagnosticService[] = [
  {
    id: 'diag-1',
    slug: 'annual-work-physical',
    name: 'Annual/Work Physical',
    shortDesc: 'Comprehensive physical exams for overall wellness, employment clearances, school certifications, and insurance compliance.',
    fullDesc: 'Thorough head-to-toe examination reviewing vital signs, organ systems, medical history, and necessary regulatory forms.',
    iconName: 'ClipboardCheck',
    turnaroundTime: 'Same-day completion',
    requirements: ['Photo ID', 'Medical history records', 'Employer/school forms if applicable'],
    displayOrder: 1,
    active: true
  },
  {
    id: 'diag-2',
    slug: 'ekg-testing',
    name: 'EKG Testing',
    shortDesc: 'Fast, painless 12-lead electrocardiograms to assess heart rhythm, electrical conduction, and detect abnormalities.',
    fullDesc: 'Records electrical signals of your heart to quickly evaluate chest pain, irregular palpitations, or pre-operative clearances.',
    iconName: 'Activity',
    turnaroundTime: 'Immediate results on-site',
    requirements: ['Comfortable clothing', 'Avoid heavy lotions on chest before test'],
    displayOrder: 2,
    active: true
  },
  {
    id: 'diag-3',
    slug: 'blood-testing',
    name: 'Blood Testing',
    shortDesc: 'Routine and comprehensive blood draws including CBC, lipid panel, metabolic panel, hemoglobin A1C, and thyroid levels.',
    fullDesc: 'Convenient on-site clinical phlebotomy with accurate processing for preventative screenings and chronic condition tracking.',
    iconName: 'Droplet',
    turnaroundTime: '24–48 hours for standard panels',
    requirements: ['Fasting may be required for glucose and lipid panels (8-12 hours)'],
    displayOrder: 3,
    active: true
  },
  {
    id: 'diag-4',
    slug: 'allergy-testing',
    name: 'Allergy Testing',
    shortDesc: 'Accurate clinical diagnostics to identify environmental, seasonal, and food sensitivities causing distress.',
    fullDesc: 'Identifies specific triggers causing chronic congestion, skin flare-ups, or respiratory symptoms to formulate immunotherapy plans.',
    iconName: 'Sparkles',
    turnaroundTime: '24–72 hours',
    requirements: ['Discontinue antihistamines 5-7 days prior if indicated by doctor'],
    displayOrder: 4,
    active: true
  },
  {
    id: 'diag-5',
    slug: 'std-testing',
    name: 'STD Testing',
    shortDesc: 'Confidential, discreet screenings for HIV, syphilis, hepatitis, chlamydia, gonorrhea, and herpes.',
    fullDesc: 'Safe, private testing with prompt communication of results and immediate access to treatment or prevention options.',
    iconName: 'ShieldAlert',
    turnaroundTime: '24–48 hours',
    requirements: ['Strictly confidential, no special preparation required'],
    displayOrder: 5,
    active: true
  },
  {
    id: 'diag-6',
    slug: 'pre-operative-exams',
    name: 'Pre-Operative Exams',
    shortDesc: 'Medical clearances required before scheduled surgical procedures to ensure surgical safety.',
    fullDesc: 'Complete clearance protocols combining physical assessment, EKG, required labs, and official surgical clearance documentation.',
    iconName: 'FileCheck',
    turnaroundTime: '24–48 hours',
    requirements: ['Surgeon clearance packet & surgery date', 'Current medication list'],
    displayOrder: 6,
    active: true
  },
  {
    id: 'diag-7',
    slug: 'echo',
    name: 'ECHO (Echocardiogram)',
    shortDesc: 'Non-invasive high-resolution ultrasound imaging of the heart chambers, valves, and blood pumping strength.',
    fullDesc: 'Evaluates cardiac muscle function, heart valve health, wall motion, and detects murmurs or heart failure signs.',
    iconName: 'Heart',
    turnaroundTime: '24–48 hours with cardiologist review',
    requirements: ['Wear comfortable two-piece clothing'],
    displayOrder: 7,
    active: true
  },
  {
    id: 'diag-8',
    slug: 'stress-test',
    name: 'Stress Test',
    shortDesc: 'Cardiac exercise testing under supervision to evaluate heart response to physical exertion and detect artery blockages.',
    fullDesc: 'Monitors heart rhythm, blood pressure, and oxygen levels while walking on a treadmill to reveal cardiovascular health under demand.',
    iconName: 'Zap',
    turnaroundTime: 'Same-day consultation review',
    requirements: ['Wear running or walking sneakers and comfortable athletic clothes', 'Avoid caffeine for 12 hours prior'],
    displayOrder: 8,
    active: true
  }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'Maria R.',
    location: 'Newark, NJ',
    quote: 'Dr. Prahlad Gadhavi and the team at Newark Medical Associates provide exceptional care. Dr. Gadhavi is very attentive, listens patiently to every concern, and his holistic approach gives me total peace of mind. The staff is always kind, polite, and there is never a long wait.',
    rating: 5,
    doctorCredited: 'Dr. Prahlad Gadhavi',
    verified: true,
    displayOrder: 1
  },
  {
    id: 'test-2',
    patientName: 'Carlos M.',
    location: 'Bloomfield, NJ',
    quote: 'Dr. Deval Gadhvi is wonderful. She is thorough, professional, and genuinely cares about helping you improve your daily lifestyle alongside medicine. Having primary care, blood work, and physical therapy all in the same location at 337 Bloomfield Ave makes everything so easy.',
    rating: 5,
    doctorCredited: 'Dr. Deval Gadhvi',
    verified: true,
    displayOrder: 2
  },
  {
    id: 'test-3',
    patientName: 'David K.',
    location: 'Essex County, NJ',
    quote: 'I had cardiac concerns and was able to see Dr. Sankalp Pathak quickly. The EKG and testing was done right in the clinic with zero hassle. Dr. Pathak explained my results clearly and put together a preventative plan that has me feeling great again.',
    rating: 5,
    doctorCredited: 'Dr. Sankalp Pathak',
    verified: true,
    displayOrder: 3
  },
  {
    id: 'test-4',
    patientName: 'Elena S.',
    location: 'Newark, NJ',
    quote: 'After my knee injury, Dr. Disha Patel worked with me through dedicated physical therapy sessions. Her encouragement, expertise, and personalized exercises got me back to walking pain-free within weeks. Truly grateful to Newark Medical Associates!',
    rating: 5,
    doctorCredited: 'Dr. Disha Patel',
    verified: true,
    displayOrder: 4
  }
];

const INITIAL_SECTIONS: SectionContent[] = [
  {
    id: 'sec-hero',
    pageSlug: 'home',
    sectionKey: 'hero',
    title: 'Primary & Preventative Care in Newark',
    subtitle: 'At Newark Medical Associates provides compassionate, high-quality care focused on prevention, early detection, and patient comfort in a professional, nonjudgmental environment.',
    bodyText: '',
    primaryButtonLabel: 'Contact Us',
    primaryButtonUrl: '/contact',
    secondaryButtonLabel: 'Our Providers',
    secondaryButtonUrl: '/providers',
    imageUrl: '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg',
    isVisible: true,
    displayOrder: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-services',
    pageSlug: 'home',
    sectionKey: 'services',
    title: 'Personalized solutions for better health',
    subtitle: 'From annual checkups to specialized cardiology and physical therapy, discover comprehensive medical care tailored to your specific health journey.',
    bodyText: 'We integrate primary wellness, diagnostics, and specialty treatments under one trusted roof.',
    primaryButtonLabel: 'View All Services',
    primaryButtonUrl: '/services',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    isVisible: true,
    displayOrder: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-about',
    pageSlug: 'home',
    sectionKey: 'about',
    title: 'Vision for a healthier and brighter tomorrow',
    subtitle: 'Our Mission: To keep Newark healthy through accessible, preventive care that empowers every patient to live their best life.',
    bodyText: 'Newark Medical Associates is rooted in community trust and clinical excellence. We provide compassionate, high-quality care focused on prevention, early detection, and patient comfort in a professional, nonjudgmental environment.',
    primaryButtonLabel: 'Learn More About Us',
    primaryButtonUrl: '/about-us',
    imageUrl: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    isVisible: true,
    displayOrder: 3,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-diagnostics',
    pageSlug: 'home',
    sectionKey: 'diagnostics',
    title: 'Diagnostic Solutions',
    subtitle: 'Fast, reliable on-site diagnostic testing utilizing modern medical technology for rapid results and accurate answers.',
    bodyText: 'We eliminate the delay of multiple facility visits by providing comprehensive testing on site at 337 Bloomfield Avenue.',
    primaryButtonLabel: 'Book a Test',
    primaryButtonUrl: '/contact',
    imageUrl: '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg',
    isVisible: true,
    displayOrder: 4,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-process',
    pageSlug: 'home',
    sectionKey: 'process',
    title: 'How It Works',
    subtitle: 'A thoughtful, patient-first approach to care in three straightforward steps.',
    bodyText: '01. Listen: We begin by discussing your symptoms, medical history, and daily concerns without rushing.\n02. Understand: We ensure every nuance of your health situation is thoroughly analyzed and understood.\n03. Personalize: Together, we design a customized treatment, diagnostic, and wellness plan for optimal recovery and lifelong health.',
    primaryButtonLabel: 'Get Started Today',
    primaryButtonUrl: '/contact',
    imageUrl: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
    isVisible: true,
    displayOrder: 5,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-testimonials',
    pageSlug: 'home',
    sectionKey: 'testimonials',
    title: 'What Our Patients Say',
    subtitle: 'Real experiences from patients who trust Newark Medical Associates for their healthcare.',
    bodyText: 'Read verified testimonials from Newark and Essex County residents.',
    isVisible: true,
    displayOrder: 6,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-about-intro',
    pageSlug: 'about',
    sectionKey: 'about_intro',
    title: 'Vision for a healthier and brighter tomorrow',
    subtitle: 'Our Mission: To keep Newark healthy through accessible, preventive care that empowers every patient to live their best life.',
    primaryButtonLabel: 'Get Started',
    primaryButtonUrl: '/contact',
    imageUrl: '/src/assets/images/gallery_screening_1_1791534688866.jpg',
    secondaryImageUrl: '/src/assets/images/gallery_screening_2_1791534700033.jpg',
    additionalImages: [
      '/src/assets/images/gallery_screening_1_1791534688866.jpg',
      '/src/assets/images/gallery_screening_2_1791534700033.jpg',
      '/src/assets/images/gallery_screening_3_1791534712268.jpg'
    ],
    isVisible: true,
    displayOrder: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-about-mission',
    pageSlug: 'about',
    sectionKey: 'about_mission',
    title: 'Committed to community wellness.',
    subtitle: 'At Newark Medical Associates, our mission is to deliver accessible, high-quality, and preventive-focused clinical care.',
    primaryButtonLabel: 'Learn More',
    primaryButtonUrl: '/services',
    imageUrl: '/src/assets/images/mission_doctor_capsule_1791534727327.jpg',
    secondaryImageUrl: '/src/assets/images/mission_blood_pressure_1791534804414.jpg',
    isVisible: true,
    displayOrder: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sec-about-vision',
    pageSlug: 'about',
    sectionKey: 'about_vision',
    title: 'Transforming healthcare into a proactive partnership.',
    subtitle: 'We envision a community where quality healthcare is proactive rather than reactive.',
    primaryButtonLabel: 'Meet Our Providers',
    primaryButtonUrl: '/providers',
    imageUrl: '/src/assets/images/vision_consultation_warm_1791534815659.jpg',
    isVisible: true,
    displayOrder: 3,
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'med-upload-1',
    filename: 'aU1QUlSKO9mpYg2rCyxW7d2q0_1791973543258_5455.avif',
    url: '/uploads/aU1QUlSKO9mpYg2rCyxW7d2q0_1791973543258_5455.avif',
    alt: 'Dr. Prahlad Gadhavi Portrait',
    category: 'doctors',
    fileSize: 20162,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-upload-2',
    filename: 'SiRK7DEBXDBaO1d4R9uqpEvLUg_1791973553041_9635.avif',
    url: '/uploads/SiRK7DEBXDBaO1d4R9uqpEvLUg_1791973553041_9635.avif',
    alt: 'Dr. Deval Gadhvi Portrait',
    category: 'doctors',
    fileSize: 20697,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-upload-3',
    filename: 'llBwa8qqHJ0lkN1qwePotRnzyg_1791973561605_204.avif',
    url: '/uploads/llBwa8qqHJ0lkN1qwePotRnzyg_1791973561605_204.avif',
    alt: 'Dr. Sankalp Pathak Portrait',
    category: 'doctors',
    fileSize: 60788,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-upload-4',
    filename: 'tnrxNiojdNLKiHtHPyMhvxIsQM0_1791973570730_3593.avif',
    url: '/uploads/tnrxNiojdNLKiHtHPyMhvxIsQM0_1791973570730_3593.avif',
    alt: 'Dr. Disha Patel Portrait',
    category: 'doctors',
    fileSize: 5446,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-hero-1',
    filename: 'nma_hero_consultation.jpg',
    url: '/src/assets/images/nma_hero_consultation_1791527202023.jpg',
    alt: 'Doctor consulting with patient at Newark Medical Associates',
    category: 'hero',
    fileSize: 420000,
    dimensions: '1920x1080',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-doc-1',
    filename: 'dr_prahlad_gadhavi.jpg',
    url: '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
    alt: 'Dr. Prahlad Gadhavi, Primary Care Physician',
    category: 'doctors',
    fileSize: 310000,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-doc-2',
    filename: 'dr_deval_gadhvi.jpg',
    url: '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
    alt: 'Dr. Deval Gadhvi, Medical Director and Primary Care Physician',
    category: 'doctors',
    fileSize: 320000,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-doc-3',
    filename: 'dr_sankalp_pathak.jpg',
    url: '/src/assets/images/dr_sankalp_pathak_1791527235581.jpg',
    alt: 'Dr. Sankalp Pathak, Interventional Cardiologist',
    category: 'doctors',
    fileSize: 305000,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-doc-4',
    filename: 'dr_disha_patel.jpg',
    url: '/src/assets/images/dr_disha_patel_1791527246009.jpg',
    alt: 'Dr. Disha Patel, Physical Therapist',
    category: 'doctors',
    fileSize: 315000,
    dimensions: '768x1024',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-clinic-1',
    filename: 'nma_about_clinic.jpg',
    url: '/src/assets/images/nma_about_clinic_1791527274487.jpg',
    alt: 'Reception desk and waiting area at Newark Medical Associates',
    category: 'clinic',
    fileSize: 450000,
    dimensions: '1920x1080',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'med-diag-1',
    filename: 'nma_diagnostic_lab.jpg',
    url: '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg',
    alt: 'Diagnostic EKG and cardiovascular testing room',
    category: 'services',
    fileSize: 440000,
    dimensions: '1920x1080',
    uploadedAt: new Date().toISOString()
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'preventative-cardiology-early-warning-signs',
    title: 'Preventative Cardiology: Recognizing Early Cardiovascular Warning Signs',
    excerpt: 'Cardiovascular disease remains the leading health complication in New Jersey. Learn the subtle early symptoms often dismissed, key diagnostic tests like EKG and Echocardiography, and actionable daily steps to preserve arterial health.',
    content: `## Why Early Cardiovascular Detection Saves Lives

Heart disease often develops quietly over years or even decades before causing an acute cardiac event. At Newark Medical Associates, our cardiology department—guided by board-certified interventional cardiologist **Dr. Sankalp Pathak**—emphasizes proactive, preventative cardiology designed to detect arterial stiffness, arrhythmias, and coronary narrowing long before an emergency occurs.

> "Preventative cardiology is not just about reacting to a heart attack; it is about examining cardiovascular biometrics and reversing risk markers through early lifestyle and medical intervention." — *Dr. Sankalp Pathak, MD, FACC*

---

### Subtle Symptoms You Should Never Dismiss

Many individuals expect cardiac distress to appear only as dramatic, crushing chest pain. In clinical practice, cardiovascular insufficiency frequently presents with much more nuanced symptoms:

* **Unexplained Shortness of Breath (Dyspnea):** Experiencing breathless fatigue during routine activities—such as climbing stairs or carrying groceries—that previously caused no strain.
* **Atypical Discomfort:** Pressure, squeezing, or dull heaviness extending into the left shoulder, jaw, neck, or upper back.
* **Sudden Exercise Intolerance:** A noticeable drop in stamina accompanied by unexplained cold sweats or lightheadedness.
* **Palpitations & Fluttering:** Sensation of skipped beats, racing heart rates while resting, or erratic pounding.
* **Peripheral Edema:** Persistent swelling in the ankles, feet, or lower calves that worsens toward evening.

---

### Essential Diagnostic Screenings Available On-Site

Early detection relies on accurate, clinical-grade diagnostics. During a cardiovascular assessment at our Newark clinic, patients have access to:

1. **12-Lead Resting Electrocardiogram (EKG/ECG):** Quickly measures electrical conductivity, identifying prior silent ischemia, conduction blocks, or arrhythmias.
2. **Comprehensive Transthoracic Echocardiogram (ECHO):** Utilizes sound waves to visualize chamber dimensions, valve functionality, and overall ejection fraction.
3. **Advanced Lipid Fractionation & Inflammatory Markers:** Beyond standard cholesterol tests, we evaluate ApoB, Lipoprotein(a), and high-sensitivity C-reactive protein (hs-CRP) for accurate vascular risk stratification.

---

### Five Evidence-Based Habits for Long-Term Arterial Health

1. **Prioritize 150 Minutes of Moderate Aerobic Movement:** Brisk walking, cycling, or swimming strengthens the myocardium and stimulates endothelial nitric oxide production.
2. **Target Blood Pressure Below 120/80 mmHg:** Chronic hypertension silently damages delicate endothelial cell linings.
3. **Embrace an Anti-Inflammatory Dietary Pattern:** Incorporate extra virgin olive oil, wild fatty fish, leafy greens, walnuts, and fiber-rich legumes.
4. **Optimize Restful Sleep:** Aim for 7–8 hours nightly. Untreated sleep apnea significantly elevates nocturnal blood pressure and arrhythmia risks.
5. **Manage Chronic Stress Responsively:** Sustained sympathetic nervous system overdrive elevates cortisol and vascular inflammation.

---

### When to Schedule Your Cardiac Consultation

If you have a family history of premature heart disease, elevated cholesterol, high blood pressure, or are experiencing subtle chest or breathing changes, scheduling a specialized outpatient cardiology evaluation is your best next step. Our team is dedicated to safeguarding your cardiovascular vitality right here in Newark.`,
    category: 'Cardiology & Heart Health',
    authorName: 'Dr. Sankalp Pathak, MD',
    authorRole: 'Interventional Cardiologist',
    authorAvatar: '/src/assets/images/dr_sankalp_pathak_1791527235581.jpg',
    imageUrl: '/src/assets/images/nma_diagnostic_lab_1791527285928.jpg',
    readingTime: '5 min read',
    tags: ['Cardiology', 'Heart Health', 'Hypertension', 'EKG', 'Prevention'],
    publishedAt: '2026-10-12T09:00:00.000Z',
    updatedAt: '2026-10-12T09:00:00.000Z',
    status: 'published',
    featured: true,
    displayOrder: 1,
    metaTitle: 'Preventative Cardiology: Early Warning Signs | Newark Medical Associates',
    metaDescription: 'Learn about early cardiovascular symptoms, diagnostic screenings, and heart health prevention from cardiologist Dr. Sankalp Pathak in Newark, NJ.'
  },
  {
    id: 'blog-2',
    slug: 'the-annual-physical-exam-preventative-health-guide',
    title: 'The Annual Physical Exam: Your Most Powerful Preventative Health Tool',
    excerpt: 'Why waiting until you feel unwell is the biggest healthcare mistake. Discover key biometrics, metabolic lab panels, and cancer screenings covered during your comprehensive checkup at Newark Medical Associates.',
    content: `## The True Purpose of an Annual Comprehensive Exam

Many adults only seek medical attention when acute symptoms strike—a stubborn cough, severe back ache, or sudden fatigue. However, true health preservation happens when you feel entirely well. 

At Newark Medical Associates, our founder **Dr. Prahlad Gadhavi, MD** has championed preventative internal medicine for over 25 years in Essex County. The annual physical serves as your clinical baseline, detecting early-stage hypertension, pre-diabetes, renal changes, and lipid imbalances before irreversible tissue damage occurs.

---

### What a Thorough Physical Exam Evaluates

A high-caliber preventative examination goes well beyond a quick stethoscope check. Here is what our physicians thoroughly assess:

#### 1. Baseline Vital Signs & Cardiovascular Biometrics
* Accurate blood pressure checks across both arms
* Resting pulse rate, heart rhythm, and oxygen saturation
* Body Mass Index (BMI), waist circumference, and visceral fat trends

#### 2. Head-to-Toe Clinical Examination
* **Ear, Nose & Throat:** Thyroid gland palpation, lymph node inspection, and oral mucosa evaluation
* **Cardiopulmonary:** Auscultation for heart murmurs, carotid bruits, and lung adventitious sounds
* **Abdominal & Organ Exam:** Hepatic and splenic span, aorta assessment, and gastrointestinal tenderness checks
* **Dermatological Scan:** Identifying suspicious dysplastic moles or precancerous skin lesions
* **Musculoskeletal & Neurological:** Reflexes, gait stability, spinal alignment, and peripheral sensation

---

### Vital Laboratory Panels Included

Routine lab work ordered during your annual physical uncovers hidden metabolic patterns:

* **Complete Blood Count (CBC):** Screens for anemia, immune deficiencies, and infection markers.
* **Comprehensive Metabolic Panel (CMP):** Evaluates kidney filtration (eGFR, BUN, Creatinine), liver enzymes (ALT, AST), and electrolytes.
* **Fasting Lipid Profile:** Measures total cholesterol, HDL, LDL, and triglycerides.
* **Hemoglobin A1c:** Measures average blood glucose regulation over the previous 90 days.
* **Thyroid Stimulating Hormone (TSH):** Evaluates metabolic rate and thyroid balance.

---

### Age-Appropriate Screenings You Must Not Skip

Depending on your age, biological sex, and personal history, your physician coordinates essential preventative cancer screenings:
* **Colorectal Screening:** Recommended starting at age 45 via colonoscopy or non-invasive stool DNA tests.
* **Breast Cancer Screening:** Annual screening mammograms recommended for women beginning at age 40.
* **Cervical Health:** Pap smear and high-risk HPV testing according to guideline intervals.
* **Bone Density (DEXA):** Screening for osteopenia and osteoporosis in post-menopausal women and at-risk older adults.

---

### Partner With Your Primary Care Doctor

Your health journey is an ongoing partnership. An annual physical provides the dedicated time needed to review personal health goals, medication tolerances, mental wellness, and nutritional habits. Take control of your future by scheduling your annual evaluation today.`,
    category: 'Primary Care & Prevention',
    authorName: 'Dr. Prahlad Gadhavi, MD',
    authorRole: 'Primary Care Physician & Founder',
    authorAvatar: '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
    imageUrl: '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg',
    readingTime: '4 min read',
    tags: ['Annual Physical', 'Primary Care', 'Screenings', 'Blood Work', 'Wellness'],
    publishedAt: '2026-10-08T10:30:00.000Z',
    updatedAt: '2026-10-08T10:30:00.000Z',
    status: 'published',
    featured: true,
    displayOrder: 2,
    metaTitle: 'The Annual Physical Exam Guide | Newark Medical Associates',
    metaDescription: 'Discover what is included in an annual physical exam with Dr. Prahlad Gadhavi at Newark Medical Associates in Newark, NJ.'
  },
  {
    id: 'blog-3',
    slug: 'holistic-womens-wellness-hormones-nutrition-longevity',
    title: "Holistic Women's Wellness: Balancing Hormones, Nutrition & Longevity",
    excerpt: 'Comprehensive women’s healthcare goes beyond routine checkups. Explore how hormone equilibrium, plant-forward Mediterranean nutrition, circadian rhythm alignment, and stress reduction create lifelong vitality.',
    content: `## Beyond Standard Medicine: An Integrative Approach to Women’s Health

Women navigate distinct physiological transitions throughout life—from reproductive maturity and postpartum adaptations to perimenopause and post-menopausal longevity. Yet too often, fatigue, brain fog, metabolic deceleration, and sleep disruptions are dismissed as inevitable consequences of aging or stress.

At Newark Medical Associates, Medical Director **Dr. Deval Gadhvi, MD** takes an empathetic, evidence-based integrative approach. By marrying traditional internal medicine with functional lifestyle science, we help women achieve sustained vitality, metabolic resilience, and hormonal harmony.

---

### The Three Pillars of Women's Vitality

#### 1. Hormonal Balance & Metabolic Health
Hormones do not operate in silos; thyroid, cortisol, estrogen, progesterone, and insulin continuously influence each other:
* **Insulin Sensitivity:** Maintaining stable blood sugar prevents energy crashes and mitigates visceral adiposity.
* **Thyroid Function:** Subtle hypothyroidism often accounts for cold sensitivity, brittle hair, sluggish digestion, and persistent fatigue.
* **Perimenopausal Support:** Personalized evaluations for symptom relief, bone density protection, and cardiovascular resilience.

#### 2. Anti-Inflammatory, Whole-Food Nutrition
Nutrition is biological information for your cellular machinery. Our clinical recommendations emphasize:
* **High-Density Micronutrients:** Colorful brassicas (broccoli, kale, cauliflower) support hepatic hormone clearance.
* **Adequate High-Quality Protein:** Essential for preserving lean muscle mass, especially after age 35 (aim for 25–30g per meal).
* **Healthy Lipids:** Wild salmon, avocados, flaxseeds, and walnuts supply essential omega-3 fatty acids that dampen systemic inflammation.
* **Phytoestrogens:** Fermented organic soy and ground flaxseeds provide gentle receptor-modulating effects.

#### 3. Stress Regulation & Cortisol Management
Chronic multitasking and sympathetic overload lead to elevated evening cortisol, which depletes restorative deep sleep and elevates inflammatory cytokines. Practices such as daily 10-minute breathwork, restorative yoga, and boundary-setting are genuine clinical interventions.

---

### Proactive Breast & Pelvic Health

As an active global health advocate and initiator of the *"Let’s Save Maa"* cervical and breast cancer awareness initiative, Dr. Deval Gadhvi underscores that early detection remains our strongest medical ally:
* Perform routine monthly self-breast awareness checks.
* Never delay recommended mammography or gynecological screenings.
* Discuss any family history of breast, ovarian, or colon cancers to evaluate genetic screening indicators.

---

### Your Wellness Journey Begins with Being Heard

At our Newark clinic, we dedicate the time to listen to your story, examine your complete lab profile, and build a sustainable wellness roadmap customized to your life stage. You deserve compassionate, world-class healthcare designed just for you.`,
    category: "Women's Health & Wellness",
    authorName: 'Dr. Deval Gadhvi, MD',
    authorRole: 'Medical Director — Primary Care Physician',
    authorAvatar: '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
    imageUrl: '/src/assets/images/gallery_screening_1_1791534688866.jpg',
    readingTime: '6 min read',
    tags: ["Women's Health", 'Hormones', 'Nutrition', 'Longevity', 'Lifestyle Medicine'],
    publishedAt: '2026-10-04T14:15:00.000Z',
    updatedAt: '2026-10-04T14:15:00.000Z',
    status: 'published',
    featured: true,
    displayOrder: 3,
    metaTitle: "Women's Wellness & Hormonal Health | Dr. Deval Gadhvi Newark",
    metaDescription: 'Holistic women’s healthcare, hormone balance, and preventative medicine with Dr. Deval Gadhvi at Newark Medical Associates.'
  },
  {
    id: 'blog-4',
    slug: 'managing-high-blood-pressure-cholesterol-guide',
    title: 'Managing High Blood Pressure & Cholesterol in Daily Urban Life',
    excerpt: 'High blood pressure is termed the silent killer because it exhibits zero symptoms. Learn how our clinic helps Newark patients maintain optimal BP and lipid numbers without overwhelming lifestyle disruption.',
    content: `## The Reality of Silent Cardiovascular Threats

High blood pressure (hypertension) and elevated low-density lipoprotein (LDL) cholesterol rarely cause headaches, dizziness, or chest sensations in their early phases. Millions of Americans live with these conditions completely unaware—until an annual checkup or an emergency awakens them to the danger.

Living in a bustling metropolitan area like Newark brings unique stressors: fast-paced schedules, processed convenience foods, and demanding work commitments. Fortunately, achieving excellent blood pressure and cholesterol control is entirely achievable with strategic, evidence-based adjustments.

---

### Target Numbers Every Patient Should Know

| Diagnostic Metric | Optimal Clinical Target | Borderline / At-Risk | Stage 1 / Elevated |
| :--- | :--- | :--- | :--- |
| **Systolic BP** | Under 120 mmHg | 120 – 129 mmHg | 130 – 139 mmHg |
| **Diastolic BP** | Under 80 mmHg | Under 80 mmHg | 80 – 89 mmHg |
| **LDL Cholesterol** | Under 100 mg/dL (<70 for high risk) | 100 – 129 mg/dL | 130 – 159 mg/dL |
| **Triglycerides** | Under 150 mg/dL | 150 – 199 mg/dL | 200 – 499 mg/dL |

---

### Four Pragmatic Urban Lifestyle Tweaks

1. **Beware of Hidden Dietary Sodium:** Over 70% of dietary sodium comes from packaged deli meats, canned soups, breads, and takeout meals. Read nutritional labels and aim for under 2,000 mg of sodium daily.
2. **Increase Potassium-Rich Foods:** Potassium naturally offsets sodium by relaxing arterial walls. Add avocados, sweet potatoes, bananas, and spinach to your daily meals.
3. **Incorporate Soluble Fiber:** Soluble fiber binds to cholesterol precursors in the digestive tract, carrying them out before absorption. Oatmeal, beans, Brussels sprouts, and chia seeds are outstanding additions.
4. **Monitor at Home:** Utilize a validated upper-arm digital cuff. Take readings at the same time each morning and evening, keeping a log for your doctor.

---

### When Medications Play a Protective Role

When lifestyle measures alone are insufficient to reach safe targets, modern antihypertensive and lipid-lowering therapies (such as ACE inhibitors, ARBs, and statins) are exceptionally safe, well-tolerated, and proven to reduce heart attacks and strokes. At Newark Medical Associates, we collaborate closely with every patient to find the gentlest, most effective regimen suited to your biological profile.`,
    category: 'Chronic Disease Management',
    authorName: 'Dr. Deval Gadhvi, MD',
    authorRole: 'Medical Director — Primary Care Physician',
    authorAvatar: '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
    imageUrl: '/src/assets/images/mission_blood_pressure_1791534804414.jpg',
    readingTime: '5 min read',
    tags: ['Hypertension', 'Cholesterol', 'Diet', 'Medication', 'Newark Healthcare'],
    publishedAt: '2026-09-28T11:00:00.000Z',
    updatedAt: '2026-09-28T11:00:00.000Z',
    status: 'published',
    featured: false,
    displayOrder: 4,
    metaTitle: 'Managing Blood Pressure & Cholesterol | Newark Medical Associates',
    metaDescription: 'Practical tips for lowering blood pressure and cholesterol in Newark, NJ with guidance from Newark Medical Associates physicians.'
  },
  {
    id: 'blog-5',
    slug: 'recovering-from-joint-back-pain-physical-therapy',
    title: 'Recovering from Joint & Back Pain: Physical Therapy vs Bed Rest',
    excerpt: 'Complete bed rest is no longer the clinical standard for spinal or joint pain. Discover why targeted functional movement and progressive loading speed up recovery and prevent chronic pain recurrence.',
    content: `## The Modern Approach to Musculoskeletal Healing

For decades, the standard folk advice for acute lower back pain or severe knee stiffness was to stay in bed until the pain subsided. Modern clinical biomechanics and rehabilitation medicine have completely disproven this approach. Prolonged bed rest leads to muscular deconditioning, joint stiffness, decreased disc hydration, and prolonged disability.

At Newark Medical Associates, our Physical Therapy department—spearheaded by **Dr. Disha Patel, PT, DPT**—uses evidence-based movement science to relieve pain, rebuild core stability, and restore mobility.

---

### Why Active Rehabilitation Outperforms Passive Rest

* **Enhanced Microcirculation:** Gentle, guided movement increases blood flow to ligaments, cartilage, and tendons, which naturally have limited vascularity.
* **Neural Desensitization:** Gradual non-threatening movement calms an overactive nervous system, dialing down central pain signaling.
* **Muscular Re-education:** Targeted exercises strengthen deep postural stabilizers (such as the transversus abdominis and multifidus) to take mechanical pressure off lumbar vertebrae.
* **Prevention of Compensatory Injuries:** When one muscle group is weak or guarded, other joints overcompensate, creating secondary hip, shoulder, or neck problems.

---

### Three Core Steps to Relieve Daily Desk & Commuter Strain

1. **The 30-Minute Posture Reset:** Every 30 minutes of sitting, stand up, perform 5 gentle standing lumbar extensions, and roll your shoulders back.
2. **Hip Flexor Lengthening:** Prolonged sitting keeps the iliopsoas muscles chronically shortened, which pulls the pelvis forward and compresses the lower back. Gentle kneeling lunges restore pelvic balance.
3. **Core Diaphragmatic Breathing:** Expanding the ribcage 360 degrees engages the pelvic floor and deep abdominal wall, supporting intra-abdominal stability.

---

### When to Seek a Professional Physical Therapy Evaluation

If your pain persists past 7–10 days, radiates down the leg or arm, or interferes with your sleep and ability to work, a comprehensive mechanical evaluation is essential. We assess joint range of motion, muscle imbalances, and movement patterns to formulate a one-on-one recovery program that gets you moving comfortably again.`,
    category: 'Physical Therapy & Rehabilitation',
    authorName: 'Dr. Disha Patel, PT, DPT',
    authorRole: 'Doctor of Physical Therapy',
    authorAvatar: '/src/assets/images/dr_disha_patel_1791527246009.jpg',
    imageUrl: '/src/assets/images/vision_consultation_warm_1791534815659.jpg',
    readingTime: '4 min read',
    tags: ['Physical Therapy', 'Back Pain', 'Joint Health', 'Mobility', 'Rehab'],
    publishedAt: '2026-09-20T08:30:00.000Z',
    updatedAt: '2026-09-20T08:30:00.000Z',
    status: 'published',
    featured: false,
    displayOrder: 5,
    metaTitle: 'Physical Therapy for Joint & Back Pain | Newark Medical Associates',
    metaDescription: 'Discover why targeted movement and physical therapy with Dr. Disha Patel heals back pain faster than bed rest at Newark Medical Associates.'
  }
];

class Database {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.state = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.blogs || !Array.isArray(parsed.blogs) || parsed.blogs.length === 0) {
          parsed.blogs = INITIAL_BLOGS;
          this.saveState(parsed);
        }
        return parsed;
      } catch (err) {
        console.error('Failed to read db file, recreating initial state:', err);
      }
    }

    const defaultAdminPass = bcrypt.hashSync('Newark$123', 10);
    const defaultEditorPass = bcrypt.hashSync('EditorPassword2026!', 10);
    const defaultViewerPass = bcrypt.hashSync('ViewerPassword2026!', 10);

    const initialUsers: AdminUser[] = [
      {
        id: 'usr-1',
        name: 'Newark Medical Associates Admin',
        email: 'NewarkMedicalAssociates',
        passwordHash: defaultAdminPass,
        role: 'super_admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-2',
        name: 'Clinical Content Editor',
        email: 'editor@newarkmedicalassociates.com',
        passwordHash: defaultEditorPass,
        role: 'editor',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-3',
        name: 'Clinical Auditor',
        email: 'viewer@newarkmedicalassociates.com',
        passwordHash: defaultViewerPass,
        role: 'viewer',
        createdAt: new Date().toISOString()
      }
    ];

    const initialState: DatabaseState = {
      users: initialUsers,
      globalSettings: INITIAL_SETTINGS,
      themeSettings: INITIAL_THEME,
      doctors: INITIAL_DOCTORS,
      services: INITIAL_SERVICES,
      diagnosticServices: INITIAL_DIAGNOSTICS,
      testimonials: INITIAL_TESTIMONIALS,
      mediaAssets: INITIAL_MEDIA,
      contactSubmissions: [
        {
          id: 'sub-1',
          fullName: 'Robert Sterling',
          email: 'robert.sterling@example.com',
          phone: '(973) 555-0192',
          message: 'Hello, I would like to schedule an annual physical exam and preventative cholesterol check with Dr. Gadhavi.',
          status: 'new',
          submittedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'sub-2',
          fullName: 'Anita Chen',
          email: 'anita.chen@example.com',
          phone: '(201) 555-0144',
          message: 'Interested in cardiology consultation with Dr. Pathak for periodic shortness of breath.',
          status: 'in_progress',
          submittedAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      sections: INITIAL_SECTIONS,
      auditLogs: [
        {
          id: 'log-1',
          userEmail: 'system',
          action: 'INITIALIZE_SYSTEM',
          targetType: 'system',
          details: 'Initialized Newark Medical Associates database with verified clinical data and doctors.',
          timestamp: new Date().toISOString()
        }
      ],
      blogs: INITIAL_BLOGS
    };

    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: DatabaseState) {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically write DB:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public logAudit(userEmail: string, action: string, targetType: string, targetId: string | undefined, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userEmail,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.saveState(this.state);
  }

  // Doctors
  public getDoctors(): Doctor[] {
    return this.state.doctors.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getDoctorBySlug(slug: string): Doctor | undefined {
    return this.state.doctors.find((d) => d.slug === slug);
  }

  public saveDoctor(doctor: Doctor, userEmail: string): Doctor {
    const index = this.state.doctors.findIndex((d) => d.id === doctor.id);
    if (index >= 0) {
      this.state.doctors[index] = doctor;
      this.logAudit(userEmail, 'UPDATE_DOCTOR', 'doctor', doctor.id, `Updated profile for ${doctor.name}`);
    } else {
      this.state.doctors.push(doctor);
      this.logAudit(userEmail, 'CREATE_DOCTOR', 'doctor', doctor.id, `Created doctor ${doctor.name}`);
    }
    this.saveState(this.state);
    return doctor;
  }

  public deleteDoctor(id: string, userEmail: string): boolean {
    const doctor = this.state.doctors.find((d) => d.id === id);
    if (!doctor) return false;
    this.state.doctors = this.state.doctors.filter((d) => d.id !== id);
    this.logAudit(userEmail, 'DELETE_DOCTOR', 'doctor', id, `Deleted doctor profile: ${doctor.name}`);
    this.saveState(this.state);
    return true;
  }

  // Services
  public getServices(): Service[] {
    return this.state.services.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getServiceBySlug(slug: string): Service | undefined {
    return this.state.services.find((s) => s.slug === slug);
  }

  public saveService(service: Service, userEmail: string): Service {
    const index = this.state.services.findIndex((s) => s.id === service.id);
    if (index >= 0) {
      this.state.services[index] = service;
      this.logAudit(userEmail, 'UPDATE_SERVICE', 'service', service.id, `Updated service: ${service.name}`);
    } else {
      this.state.services.push(service);
      this.logAudit(userEmail, 'CREATE_SERVICE', 'service', service.id, `Created service: ${service.name}`);
    }
    this.saveState(this.state);
    return service;
  }

  public deleteService(id: string, userEmail: string): boolean {
    const srv = this.state.services.find((s) => s.id === id);
    if (!srv) return false;
    this.state.services = this.state.services.filter((s) => s.id !== id);
    this.logAudit(userEmail, 'DELETE_SERVICE', 'service', id, `Deleted service: ${srv.name}`);
    this.saveState(this.state);
    return true;
  }

  // Diagnostics
  public getDiagnostics(): DiagnosticService[] {
    return this.state.diagnosticServices.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public saveDiagnostic(diag: DiagnosticService, userEmail: string): DiagnosticService {
    const index = this.state.diagnosticServices.findIndex((d) => d.id === diag.id);
    if (index >= 0) {
      this.state.diagnosticServices[index] = diag;
      this.logAudit(userEmail, 'UPDATE_DIAGNOSTIC', 'diagnostic', diag.id, `Updated diagnostic solution: ${diag.name}`);
    } else {
      this.state.diagnosticServices.push(diag);
      this.logAudit(userEmail, 'CREATE_DIAGNOSTIC', 'diagnostic', diag.id, `Created diagnostic: ${diag.name}`);
    }
    this.saveState(this.state);
    return diag;
  }

  public deleteDiagnostic(id: string, userEmail: string): boolean {
    const diag = this.state.diagnosticServices.find((d) => d.id === id);
    if (!diag) return false;
    this.state.diagnosticServices = this.state.diagnosticServices.filter((d) => d.id !== id);
    this.logAudit(userEmail, 'DELETE_DIAGNOSTIC', 'diagnostic', id, `Deleted diagnostic: ${diag.name}`);
    this.saveState(this.state);
    return true;
  }

  // Testimonials
  public getTestimonials(): Testimonial[] {
    return this.state.testimonials.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public saveTestimonial(t: Testimonial, userEmail: string): Testimonial {
    const index = this.state.testimonials.findIndex((item) => item.id === t.id);
    if (index >= 0) {
      this.state.testimonials[index] = t;
      this.logAudit(userEmail, 'UPDATE_TESTIMONIAL', 'testimonial', t.id, `Updated testimonial by ${t.patientName}`);
    } else {
      this.state.testimonials.push(t);
      this.logAudit(userEmail, 'CREATE_TESTIMONIAL', 'testimonial', t.id, `Added testimonial by ${t.patientName}`);
    }
    this.saveState(this.state);
    return t;
  }

  public deleteTestimonial(id: string, userEmail: string): boolean {
    const t = this.state.testimonials.find((item) => item.id === id);
    if (!t) return false;
    this.state.testimonials = this.state.testimonials.filter((item) => item.id !== id);
    this.logAudit(userEmail, 'DELETE_TESTIMONIAL', 'testimonial', id, `Deleted testimonial by ${t.patientName}`);
    this.saveState(this.state);
    return true;
  }

  // Sections
  public getSections(pageSlug?: string): SectionContent[] {
    if (pageSlug) {
      return this.state.sections.filter((s) => s.pageSlug === pageSlug).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return this.state.sections;
  }

  public saveSection(section: SectionContent, userEmail: string): SectionContent {
    const index = this.state.sections.findIndex((s) => s.id === section.id);
    section.updatedAt = new Date().toISOString();
    if (index >= 0) {
      this.state.sections[index] = section;
      this.logAudit(userEmail, 'UPDATE_SECTION', 'section', section.id, `Updated section ${section.sectionKey} on ${section.pageSlug}`);
    } else {
      this.state.sections.push(section);
      this.logAudit(userEmail, 'CREATE_SECTION', 'section', section.id, `Created section ${section.sectionKey}`);
    }
    this.saveState(this.state);
    return section;
  }

  // Media
  public getMediaAssets(): MediaAsset[] {
    return this.state.mediaAssets;
  }

  public addMediaAsset(asset: MediaAsset, userEmail: string): MediaAsset {
    this.state.mediaAssets.unshift(asset);
    this.logAudit(userEmail, 'UPLOAD_MEDIA', 'media', asset.id, `Uploaded asset: ${asset.filename}`);
    this.saveState(this.state);
    return asset;
  }

  public deleteMediaAsset(id: string, userEmail: string): boolean {
    const asset = this.state.mediaAssets.find((a) => a.id === id);
    if (!asset) return false;
    this.state.mediaAssets = this.state.mediaAssets.filter((a) => a.id !== id);
    this.logAudit(userEmail, 'DELETE_MEDIA', 'media', id, `Deleted media asset: ${asset.filename}`);
    this.saveState(this.state);
    return true;
  }

  // Inquiries
  public getInquiries(): ContactSubmission[] {
    return this.state.contactSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public addInquiry(sub: Omit<ContactSubmission, 'id' | 'status' | 'submittedAt'>): ContactSubmission {
    const newSub: ContactSubmission = {
      ...sub,
      id: `sub-${Date.now()}`,
      status: 'new',
      submittedAt: new Date().toISOString()
    };
    this.state.contactSubmissions.unshift(newSub);
    this.saveState(this.state);
    return newSub;
  }

  public updateInquiryStatus(id: string, status: 'new' | 'in_progress' | 'resolved', notes?: string, userEmail?: string): ContactSubmission | undefined {
    const sub = this.state.contactSubmissions.find((s) => s.id === id);
    if (!sub) return undefined;
    sub.status = status;
    if (notes !== undefined) sub.adminNotes = notes;
    if (userEmail) {
      this.logAudit(userEmail, 'UPDATE_INQUIRY', 'inquiry', id, `Updated inquiry status for ${sub.fullName} to ${status}`);
    }
    this.saveState(this.state);
    return sub;
  }

  public deleteInquiry(id: string, userEmail: string): boolean {
    const sub = this.state.contactSubmissions.find((s) => s.id === id);
    if (!sub) return false;
    this.state.contactSubmissions = this.state.contactSubmissions.filter((s) => s.id !== id);
    this.logAudit(userEmail, 'DELETE_INQUIRY', 'inquiry', id, `Deleted inquiry from ${sub.fullName}`);
    this.saveState(this.state);
    return true;
  }

  // Global Settings & Theme
  public getGlobalSettings(): GlobalSettings {
    return this.state.globalSettings;
  }

  public updateGlobalSettings(settings: Partial<GlobalSettings>, userEmail: string): GlobalSettings {
    this.state.globalSettings = { ...this.state.globalSettings, ...settings };
    this.logAudit(userEmail, 'UPDATE_SETTINGS', 'settings', undefined, 'Updated global practice configuration');
    this.saveState(this.state);
    return this.state.globalSettings;
  }

  public getThemeSettings(): ThemeSettings {
    return this.state.themeSettings;
  }

  public updateThemeSettings(theme: Partial<ThemeSettings>, userEmail: string): ThemeSettings {
    this.state.themeSettings = { ...this.state.themeSettings, ...theme };
    this.logAudit(userEmail, 'UPDATE_THEME', 'theme', undefined, 'Updated site theme tokens');
    this.saveState(this.state);
    return this.state.themeSettings;
  }

  // Users
  public getUsers(): Omit<AdminUser, 'passwordHash'>[] {
    return this.state.users.map(({ passwordHash, ...rest }) => rest);
  }

  public findUserByEmail(email: string): AdminUser | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: { name: string; email: string; password: string; role: 'super_admin' | 'editor' | 'viewer' }, userEmail: string): Omit<AdminUser, 'passwordHash'> {
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: bcrypt.hashSync(user.password, 10),
      role: user.role,
      createdAt: new Date().toISOString()
    };
    this.state.users.push(newUser);
    this.logAudit(userEmail, 'CREATE_USER', 'user', newUser.id, `Created admin user: ${newUser.email} (${newUser.role})`);
    this.saveState(this.state);
    const { passwordHash, ...safe } = newUser;
    return safe;
  }

  public deleteUser(id: string, userEmail: string): boolean {
    if (this.state.users.length <= 1) return false;
    const target = this.state.users.find((u) => u.id === id);
    if (!target) return false;
    this.state.users = this.state.users.filter((u) => u.id !== id);
    this.logAudit(userEmail, 'DELETE_USER', 'user', id, `Removed admin user: ${target.email}`);
    this.saveState(this.state);
    return true;
  }

  // Blogs Management
  public getBlogs(filter?: { status?: 'published' | 'draft'; category?: string }): BlogPost[] {
    let list = this.state.blogs || [];
    if (filter?.status) {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((b) => b.category.toLowerCase() === filter.category!.toLowerCase());
    }
    return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public getBlogByIdOrSlug(idOrSlug: string): BlogPost | undefined {
    return (this.state.blogs || []).find((b) => b.id === idOrSlug || b.slug === idOrSlug);
  }

  public saveBlog(blog: BlogPost, userEmail: string): BlogPost {
    if (!this.state.blogs) this.state.blogs = [];
    const index = this.state.blogs.findIndex((b) => b.id === blog.id);
    blog.updatedAt = new Date().toISOString();
    if (index >= 0) {
      this.state.blogs[index] = blog;
      this.logAudit(userEmail, 'UPDATE_BLOG', 'blog', blog.id, `Updated blog article "${blog.title}"`);
    } else {
      this.state.blogs.unshift(blog);
      this.logAudit(userEmail, 'CREATE_BLOG', 'blog', blog.id, `Created blog article "${blog.title}"`);
    }
    this.saveState(this.state);
    return blog;
  }

  public deleteBlog(id: string, userEmail: string): boolean {
    if (!this.state.blogs) return false;
    const blog = this.state.blogs.find((b) => b.id === id);
    if (!blog) return false;
    this.state.blogs = this.state.blogs.filter((b) => b.id !== id);
    this.logAudit(userEmail, 'DELETE_BLOG', 'blog', id, `Deleted blog article "${blog.title}"`);
    this.saveState(this.state);
    return true;
  }
}

export const db = new Database();
