import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { generateToken, requireAuth, AuthenticatedRequest } from './auth';
import { MediaAsset } from './types';
import { uploadImageToStorage, savePersistentOverride, getPersistentOverrides } from './storageProvider';
import { getStore } from '@netlify/blobs';

const router = express.Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/avif',
      'image/heic',
      'image/heif',
      'image/bmp',
      'image/tiff',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    ];
    const allowedExts = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.svg',
      '.gif',
      '.avif',
      '.heic',
      '.heif',
      '.bmp',
      '.tiff',
      '.ico'
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeAllowed = allowedMimes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/');
    const isExtAllowed = allowedExts.includes(ext);

    if (isMimeAllowed || isExtAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only standard image files (JPEG, PNG, WebP, SVG, GIF, AVIF) are permitted'));
    }
  }
});

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// Unified Public Data Bootstrap (Returns all sections & merges persistent cloud overrides)
router.get('/public/bootstrap', async (_req: Request, res: Response) => {
  const overrides = await getPersistentOverrides();
  let doctors = db.getDoctors().filter((d) => d.active);
  let services = db.getServices().filter((s) => s.active);
  let sections = db.getSections().filter((s) => s.isVisible);
  let settings = db.getGlobalSettings();

  // Merge durable cloud overrides
  if (overrides && Object.keys(overrides).length > 0) {
    doctors = doctors.map((doc) => {
      const customUrl = overrides[`doctor_${doc.id}`] || overrides[`doctor_${doc.slug}`];
      return customUrl ? { ...doc, imageUrl: customUrl } : doc;
    });

    services = services.map((srv) => {
      const customUrl = overrides[`service_${srv.id}`] || overrides[`service_${srv.slug}`];
      return customUrl ? { ...srv, imageUrl: customUrl } : srv;
    });

    sections = sections.map((sec) => {
      const isAboutSec = sec.id === 'sec-about' || sec.id === 'sec-about-intro' || sec.sectionKey === 'about' || sec.sectionKey === 'about_intro';
      const customUrl = overrides[`section_${sec.id}`]
        || overrides[`section_${sec.sectionKey}`]
        || (isAboutSec ? (overrides['section_sec-about-intro'] || overrides['section_sec-about']) : undefined);
      const customSecUrl = overrides[`section_${sec.id}_secondary`]
        || overrides[`section_${sec.sectionKey}_secondary`]
        || (isAboutSec ? (overrides['section_sec-about-intro_secondary'] || overrides['section_sec-about_secondary']) : undefined);
      const customAdditionalRaw = overrides[`section_${sec.id}_additional`]
        || overrides[`section_${sec.sectionKey}_additional`]
        || (isAboutSec ? (overrides['section_sec-about-intro_additional'] || overrides['section_sec-about_additional']) : undefined);
      let customAdditional: string[] | undefined;
      if (customAdditionalRaw) {
        try { customAdditional = JSON.parse(customAdditionalRaw); } catch {}
      }
      return {
        ...sec,
        imageUrl: customUrl || sec.imageUrl,
        secondaryImageUrl: customSecUrl || sec.secondaryImageUrl,
        additionalImages: customAdditional || sec.additionalImages
      };
    });

    if (overrides['logo_main'] !== undefined) {
      settings.logoUrl = overrides['logo_main'] === '__RESET__' ? '' : overrides['logo_main'];
    }
    if (overrides['logo_dark'] !== undefined) {
      settings.logoDarkUrl = overrides['logo_dark'] === '__RESET__' ? '' : overrides['logo_dark'];
    }
  }

  res.json({
    settings,
    theme: db.getThemeSettings(),
    doctors,
    services,
    diagnostics: db.getDiagnostics().filter((d) => d.active),
    testimonials: db.getTestimonials(),
    sections,
    allSections: sections,
    blogs: db.getBlogs({ status: 'published' })
  });
});

// Public Blogs Endpoints
router.get('/public/blogs', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const blogs = db.getBlogs({ status: 'published', category });
  res.json(blogs);
});

router.get('/public/blogs/:slug', (req: Request, res: Response) => {
  const blog = db.getBlogByIdOrSlug(req.params.slug);
  if (!blog || blog.status !== 'published') {
    return res.status(404).json({ error: 'Blog article not found' });
  }
  res.json(blog);
});


// Submit Contact Form Inquiry
router.post('/public/inquiries', (req: Request, res: Response) => {
  const { fullName, email, phone, message } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your full name' });
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    return res.status(400).json({ error: 'Please enter a valid telephone number' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a message or inquiry detail' });
  }

  const submission = db.addInquiry({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    message: message.trim()
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out to Newark Medical Associates. Our patient coordination team will contact you promptly.',
    inquiryId: submission.id
  });
});

/* ==========================================================================
   AUTH ENDPOINTS
   ========================================================================== */

router.post('/auth/login', (req: Request, res: Response) => {
  const identifier = (req.body.username || req.body.email || '').trim();
  const password = (req.body.password || '').trim();
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const user = db.findUserByEmail(identifier) ||
    db.getState().users.find((u) =>
      u.email.toLowerCase() === identifier.toLowerCase() ||
      (identifier.toLowerCase() === 'newarkmedicalassociates' && u.role === 'super_admin')
    );
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  db.logAudit(user.email, 'LOGIN', 'auth', user.id, `User signed in successfully: ${user.email}`);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.get('/auth/me', requireAuth(), (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

/* ==========================================================================
   ADMIN MANAGEMENT ENDPOINTS
   ========================================================================== */

// Dashboard Stats
router.get('/admin/dashboard-stats', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  const state = db.getState();
  const unreadInquiries = state.contactSubmissions.filter((s) => s.status === 'new').length;

  res.json({
    totalDoctors: state.doctors.length,
    activeDoctors: state.doctors.filter((d) => d.active).length,
    totalServices: state.services.length,
    activeServices: state.services.filter((s) => s.active).length,
    totalDiagnostics: state.diagnosticServices.length,
    totalMedia: state.mediaAssets.length,
    totalInquiries: state.contactSubmissions.length,
    unreadInquiries,
    totalBlogs: (state.blogs || []).length,
    publishedBlogs: (state.blogs || []).filter((b) => b.status === 'published').length,
    recentInquiries: state.contactSubmissions.slice(0, 5),
    recentAudits: state.auditLogs.slice(0, 8)
  });
});

// Doctor Management
router.get('/admin/doctors', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getDoctors());
});

router.post('/admin/doctors', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.name || !data.title) {
    return res.status(400).json({ error: 'Doctor name and title are required' });
  }

  const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `doc-${Date.now()}`;
  const newDoctor = {
    ...data,
    id: data.id || `doc-${Date.now()}`,
    slug,
    displayOrder: Number(data.displayOrder) || db.getDoctors().length + 1,
    active: data.active !== false
  };

  const saved = db.saveDoctor(newDoctor, req.user!.email);
  res.status(201).json(saved);
});

router.put('/admin/doctors/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const existing = db.getDoctors().find((d) => d.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id
  };

  const saved = db.saveDoctor(updated, req.user!.email);
  res.json(saved);
});

router.delete('/admin/doctors/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteDoctor(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Doctor not found' });
  res.json({ success: true });
});

// Services Management
router.get('/admin/services', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getServices());
});

router.post('/admin/services', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.name || !data.shortDesc) {
    return res.status(400).json({ error: 'Service name and short description are required' });
  }

  const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `srv-${Date.now()}`;
  const newService = {
    ...data,
    id: data.id || `srv-${Date.now()}`,
    slug,
    features: Array.isArray(data.features) ? data.features : [],
    treatments: Array.isArray(data.treatments) ? data.treatments : [],
    displayOrder: Number(data.displayOrder) || db.getServices().length + 1,
    active: data.active !== false
  };

  const saved = db.saveService(newService, req.user!.email);
  res.status(201).json(saved);
});

router.put('/admin/services/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const existing = db.getServices().find((s) => s.id === id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  const updated = {
    ...existing,
    ...req.body,
    id
  };

  const saved = db.saveService(updated, req.user!.email);
  res.json(saved);
});

router.delete('/admin/services/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteService(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Service not found' });
  res.json({ success: true });
});

// Diagnostic Services Management
router.get('/admin/diagnostics', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getDiagnostics());
});

router.post('/admin/diagnostics', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newDiag = {
    ...data,
    id: data.id || `diag-${Date.now()}`,
    slug,
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    displayOrder: Number(data.displayOrder) || db.getDiagnostics().length + 1,
    active: data.active !== false
  };
  const saved = db.saveDiagnostic(newDiag, req.user!.email);
  res.status(201).json(saved);
});

router.put('/admin/diagnostics/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getDiagnostics().find((d) => d.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Diagnostic not found' });
  const updated = { ...existing, ...req.body, id: req.params.id };
  const saved = db.saveDiagnostic(updated, req.user!.email);
  res.json(saved);
});

router.delete('/admin/diagnostics/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteDiagnostic(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Diagnostic not found' });
  res.json({ success: true });
});

// Testimonials Management
router.get('/admin/testimonials', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getTestimonials());
});

router.post('/admin/testimonials', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const newT = {
    ...req.body,
    id: req.body.id || `test-${Date.now()}`,
    displayOrder: Number(req.body.displayOrder) || db.getTestimonials().length + 1
  };
  const saved = db.saveTestimonial(newT, req.user!.email);
  res.status(201).json(saved);
});

router.put('/admin/testimonials/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getTestimonials().find((t) => t.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });
  const updated = { ...existing, ...req.body, id: req.params.id };
  const saved = db.saveTestimonial(updated, req.user!.email);
  res.json(saved);
});

router.delete('/admin/testimonials/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteTestimonial(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Testimonial not found' });
  res.json({ success: true });
});

// Blog Articles Management
router.get('/admin/blogs', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getBlogs());
});

router.get('/admin/blogs/:id', requireAuth(), (req: AuthenticatedRequest, res: Response) => {
  const blog = db.getBlogByIdOrSlug(req.params.id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

router.post('/admin/blogs', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.title || !data.content) {
    return res.status(400).json({ error: 'Blog title and content are required' });
  }

  const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `blog-${Date.now()}`;
  const readingTime = data.readingTime || `${Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200))} min read`;

  const newBlog = {
    ...data,
    id: data.id || `blog-${Date.now()}`,
    slug,
    category: data.category || 'General Health',
    authorName: data.authorName || 'Newark Medical Associates',
    authorRole: data.authorRole || 'Clinical Staff',
    imageUrl: data.imageUrl || '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg',
    readingTime,
    tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    publishedAt: data.publishedAt || new Date().toISOString(),
    status: data.status || 'published',
    featured: Boolean(data.featured),
    displayOrder: Number(data.displayOrder) || db.getBlogs().length + 1
  };

  const saved = db.saveBlog(newBlog, req.user!.email);
  res.status(201).json(saved);
});

router.put('/admin/blogs/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const existing = db.getBlogByIdOrSlug(id);
  if (!existing) return res.status(404).json({ error: 'Blog article not found' });

  const data = req.body;
  const readingTime = data.readingTime || (data.content ? `${Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200))} min read` : existing.readingTime);

  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    readingTime,
    tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : existing.tags),
    displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : existing.displayOrder
  };

  const saved = db.saveBlog(updated, req.user!.email);
  res.json(saved);
});

router.delete('/admin/blogs/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteBlog(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Blog not found' });
  res.json({ success: true });
});


// Sections Management
router.get('/admin/sections', requireAuth(), (req: AuthenticatedRequest, res: Response) => {
  const pageSlug = req.query.pageSlug as string | undefined;
  res.json(db.getSections(pageSlug));
});

router.put('/admin/sections/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getSections().find((s) => s.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Section not found' });
  const updated = { ...existing, ...req.body, id: req.params.id };
  const saved = db.saveSection(updated, req.user!.email);
  res.json(saved);
});

// Media Library Management
router.get('/admin/media', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getMediaAssets());
});

router.post(
  '/admin/media/upload',
  requireAuth(['super_admin', 'editor']),
  (req: AuthenticatedRequest, res: Response, next: any) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 25MB.' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || 'Failed to upload image' });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const category = (req.body.category || 'general') as MediaAsset['category'];
    const alt = req.body.alt || path.basename(req.file.originalname, path.extname(req.file.originalname));

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const storageRes = await uploadImageToStorage(fileBuffer, req.file.originalname, req.file.mimetype, category);

      const asset: MediaAsset = {
        id: `med-${Date.now()}`,
        filename: storageRes.filename,
        url: storageRes.url,
        alt,
        category,
        fileSize: storageRes.fileSize,
        dimensions: storageRes.dimensions,
        uploadedAt: new Date().toISOString()
      };

      const saved = db.addMediaAsset(asset, req.user!.email);
      res.status(201).json(saved);
    } catch (uploadErr: any) {
      console.error('Storage upload failure:', uploadErr);
      res.status(500).json({ error: uploadErr.message || 'Failed to upload image to durable storage' });
    }
  }
);

// Targeted Image Update Endpoint (Home, About, Services, Providers)
router.post(
  '/admin/images/update-target',
  requireAuth(['super_admin', 'editor']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { targetType, targetId, imageUrl, imageField, additionalImages } = req.body;
    if (!targetType || !targetId || !imageUrl) {
      return res.status(400).json({ error: 'targetType, targetId, and imageUrl are required' });
    }

    const userEmail = req.user!.email;

    if (targetType === 'logo') {
      const currentSettings = db.getGlobalSettings();
      const updated = {
        ...currentSettings,
        [imageField === 'logoDarkUrl' ? 'logoDarkUrl' : 'logoUrl']: imageUrl === '__RESET__' ? '' : imageUrl
      };
      db.updateGlobalSettings(updated, userEmail);
      await savePersistentOverride(imageField === 'logoDarkUrl' ? 'logo_dark' : 'logo_main', imageUrl);
      return res.json({ success: true, item: updated });
    }

    if (targetType === 'doctor') {
      const doc = db.getDoctors().find((d) => d.id === targetId || d.slug === targetId);
      if (!doc) return res.status(404).json({ error: 'Doctor not found' });
      doc.imageUrl = imageUrl;
      db.saveDoctor(doc, userEmail);
      await savePersistentOverride(`doctor_${doc.id}`, imageUrl);
      await savePersistentOverride(`doctor_${doc.slug}`, imageUrl);
      return res.json({ success: true, item: doc });
    }

    if (targetType === 'service') {
      const srv = db.getServices().find((s) => s.id === targetId || s.slug === targetId);
      if (!srv) return res.status(404).json({ error: 'Service not found' });
      srv.imageUrl = imageUrl;
      db.saveService(srv, userEmail);
      await savePersistentOverride(`service_${srv.id}`, imageUrl);
      await savePersistentOverride(`service_${srv.slug}`, imageUrl);
      return res.json({ success: true, item: srv });
    }

    if (targetType === 'section') {
      let sec = db.getSections().find((s) => s.id === targetId || s.sectionKey === targetId);
      if (!sec) {
        // If not found, create new section record
        sec = {
          id: targetId,
          pageSlug: req.body.pageSlug || 'about',
          sectionKey: targetId.replace('sec-', ''),
          title: req.body.title || 'Page Section',
          imageUrl,
          isVisible: true,
          displayOrder: 99,
          updatedAt: new Date().toISOString()
        };
      }
      
      const isSecImg = imageField === 'secondaryImageUrl';
      if (isSecImg) {
        sec.secondaryImageUrl = imageUrl;
      } else {
        sec.imageUrl = imageUrl;
      }

      if (additionalImages && Array.isArray(additionalImages)) {
        sec.additionalImages = additionalImages;
      }

      db.saveSection(sec, userEmail);

      const overrideKey = isSecImg ? `section_${sec.id}_secondary` : `section_${sec.id}`;
      await savePersistentOverride(overrideKey, imageUrl);
      if (sec.sectionKey) {
        const secKeyOverride = isSecImg ? `section_${sec.sectionKey}_secondary` : `section_${sec.sectionKey}`;
        await savePersistentOverride(secKeyOverride, imageUrl);
      }
      if (additionalImages && Array.isArray(additionalImages)) {
        await savePersistentOverride(`section_${sec.id}_additional`, JSON.stringify(additionalImages));
        if (sec.sectionKey) {
          await savePersistentOverride(`section_${sec.sectionKey}_additional`, JSON.stringify(additionalImages));
        }
      }

      return res.json({ success: true, item: sec });
    }

    return res.status(400).json({ error: 'Invalid targetType' });
  }
);

// Netlify Blobs Proxy Stream
router.get('/blobs/:key', async (req: Request, res: Response) => {
  try {
    const blobStore = getStore('nma-media-blobs');
    const blob = await blobStore.get(`uploads/${req.params.key}`, { type: 'stream' });
    if (!blob) return res.status(404).json({ error: 'Blob not found' });
    const metadata = await blobStore.getMetadata(`uploads/${req.params.key}`);
    if (metadata?.metadata?.contentType) {
      res.setHeader('Content-Type', metadata.metadata.contentType as string);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    (blob as any).pipe(res);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Blob not found' });
  }
});

router.delete('/admin/media/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const asset = db.getMediaAssets().find((m) => m.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Media not found' });

  // If stored in /uploads, optionally delete physical file
  if (asset.url.startsWith('/uploads/')) {
    const filename = path.basename(asset.url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove physical file:', err);
      }
    }
  }

  db.deleteMediaAsset(req.params.id, req.user!.email);
  res.json({ success: true });
});

// Contact Inquiries Management
router.get('/admin/inquiries', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getInquiries());
});

router.put('/admin/inquiries/:id', requireAuth(['super_admin', 'editor']), (req: AuthenticatedRequest, res: Response) => {
  const { status, adminNotes } = req.body;
  const updated = db.updateInquiryStatus(req.params.id, status, adminNotes, req.user!.email);
  if (!updated) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(updated);
});

router.delete('/admin/inquiries/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteInquiry(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'Inquiry not found' });
  res.json({ success: true });
});

router.get('/admin/inquiries/export-csv', requireAuth(['super_admin', 'editor']), (_req: AuthenticatedRequest, res: Response) => {
  const inquiries = db.getInquiries();
  const header = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Status', 'Message'];
  const rows = inquiries.map((i) => [
    i.id,
    new Date(i.submittedAt).toLocaleDateString(),
    `"${i.fullName.replace(/"/g, '""')}"`,
    `"${i.email}"`,
    `"${i.phone}"`,
    i.status,
    `"${i.message.replace(/"/g, '""')}"`
  ]);

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inquiries_export.csv"');
  res.send(csv);
});

// Global Settings & Theme
router.get('/admin/settings', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getGlobalSettings());
});

router.put('/admin/settings', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateGlobalSettings(req.body, req.user!.email);
  res.json(updated);
});

router.get('/admin/theme', requireAuth(), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getThemeSettings());
});

router.put('/admin/theme', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateThemeSettings(req.body, req.user!.email);
  res.json(updated);
});

// Users Management (Super Admin only)
router.get('/admin/users', requireAuth(['super_admin']), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getUsers());
});

router.post('/admin/users', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const created = db.createUser({ name, email, password, role }, req.user!.email);
  res.status(201).json(created);
});

router.delete('/admin/users/:id', requireAuth(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteUser(req.params.id, req.user!.email);
  if (!success) return res.status(400).json({ error: 'Cannot delete primary user or user not found' });
  res.json({ success: true });
});

// Audit Logs
router.get('/admin/audit-logs', requireAuth(['super_admin']), (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getState().auditLogs);
});

export default router;
