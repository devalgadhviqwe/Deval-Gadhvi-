import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  BookOpen,
  Calendar,
  Clock,
  User,
  Tag,
  Star,
  RefreshCw,
  FileText,
  Check,
  Sparkles,
  Heading,
  List,
  Quote,
  Bold,
  Italic,
  Layout
} from 'lucide-react';
import { BlogPost, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';

export const AdminBlogs: React.FC = () => {
  const { getAuthHeaders, hasRole } = useAuth();
  const { blogs: clinicBlogs, doctors, refreshData } = useClinic();

  const [blogs, setBlogs] = useState<BlogPost[]>(clinicBlogs);
  const [loading, setLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Media Picker Modal
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Editor Tab: 'write' or 'preview'
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Predefined Categories
  const categoryOptions = [
    'Cardiology & Heart Health',
    'Primary Care & Prevention',
    "Women's Health & Wellness",
    'Chronic Disease Management',
    'Physical Therapy & Rehabilitation',
    'Nutrition & Weight Loss',
    'Diagnostics & Lab Testing',
    'Travel Medicine & Immunizations'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (clinicBlogs.length > 0) {
      setBlogs(clinicBlogs);
    }
  }, [clinicBlogs]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setBlogs(data);
          return;
        }
      }
      setBlogs(clinicBlogs);
    } catch {
      setBlogs(clinicBlogs);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    const defaultDoctor = doctors[0];
    const initialPost: BlogPost = {
      id: '',
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Primary Care & Prevention',
      authorName: defaultDoctor ? defaultDoctor.name : 'Dr. Deval Gadhvi, MD',
      authorRole: defaultDoctor ? defaultDoctor.title : 'Medical Director',
      authorAvatar: defaultDoctor?.imageUrl || '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
      imageUrl: '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg',
      readingTime: '4 min read',
      tags: ['Primary Care', 'Prevention', 'Newark Health'],
      publishedAt: new Date().toISOString(),
      status: 'published',
      featured: false,
      displayOrder: blogs.length + 1,
      metaTitle: '',
      metaDescription: ''
    };
    setEditingBlog(initialPost);
    setEditorTab('write');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog({
      ...blog,
      tags: Array.isArray(blog.tags) ? [...blog.tags] : []
    });
    setEditorTab('write');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Helper to auto-generate slug
  const handleTitleChange = (newTitle: string) => {
    if (!editingBlog) return;
    const isNew = !editingBlog.id;
    const currentSlug = editingBlog.slug;
    const expectedOldSlug = editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let newSlug = currentSlug;
    if (isNew || currentSlug === expectedOldSlug || !currentSlug) {
      newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    setEditingBlog({
      ...editingBlog,
      title: newTitle,
      slug: newSlug,
      metaTitle: editingBlog.metaTitle ? editingBlog.metaTitle : (newTitle ? `${newTitle} | Newark Medical Associates` : '')
    });
  };

  // Content change auto calculates reading time
  const handleContentChange = (newContent: string) => {
    if (!editingBlog) return;
    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setEditingBlog({
      ...editingBlog,
      content: newContent,
      readingTime: `${minutes} min read`
    });
  };

  // Author change auto populates doctor role & avatar
  const handleAuthorSelect = (authorName: string) => {
    if (!editingBlog) return;
    const matchedDoc = doctors.find((d) => d.name.toLowerCase() === authorName.toLowerCase());
    if (matchedDoc) {
      setEditingBlog({
        ...editingBlog,
        authorName: matchedDoc.name,
        authorRole: matchedDoc.title,
        authorAvatar: matchedDoc.imageUrl
      });
    } else {
      setEditingBlog({
        ...editingBlog,
        authorName
      });
    }
  };

  // Quick formatting insert helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!editingBlog) return;
    const textarea = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setEditingBlog({
        ...editingBlog,
        content: editingBlog.content + `\n${prefix}text${suffix}\n`
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingBlog.content;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setEditingBlog({
      ...editingBlog,
      content: newContent
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    if (!hasRole(['super_admin', 'editor'])) {
      alert('Viewer accounts have read-only access.');
      return;
    }

    if (!editingBlog.title.trim()) {
      setErrorMsg('Please enter an article title.');
      return;
    }

    if (!editingBlog.content.trim()) {
      setErrorMsg('Please write article content.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const isNew = !editingBlog.id;
      const blogId = editingBlog.id || `blog-${Date.now()}`;
      const slug = editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload: BlogPost = {
        ...editingBlog,
        id: blogId,
        slug,
        excerpt: editingBlog.excerpt || editingBlog.content.substring(0, 160).replace(/[#*`>]/g, '') + '...',
        updatedAt: new Date().toISOString()
      };

      const url = isNew ? '/api/admin/blogs' : `/api/admin/blogs/${blogId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to save blog article on server');
      }

      const savedData = await res.json();

      setBlogs((prev) => {
        const exists = prev.some((b) => b.id === savedData.id);
        if (exists) {
          return prev.map((b) => (b.id === savedData.id ? savedData : b));
        }
        return [savedData, ...prev];
      });

      setIsModalOpen(false);
      showNotification(`Article "${savedData.title}" successfully ${isNew ? 'published' : 'updated'}!`);
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving blog article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!hasRole(['super_admin'])) {
      alert('Only Super Admin accounts can delete articles.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete the article:\n"${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        showNotification(`Article "${title}" deleted.`);
        await refreshData();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to delete article');
      }
    } catch (err: any) {
      alert(err.message || 'Network error deleting article');
    }
  };

  // Quick toggle published status
  const handleToggleStatus = async (blog: BlogPost) => {
    if (!hasRole(['super_admin', 'editor'])) return;

    const nextStatus: 'published' | 'draft' = blog.status === 'published' ? 'draft' : 'published';
    const updated: BlogPost = { ...blog, status: nextStatus, updatedAt: new Date().toISOString() };

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        const saved = await res.json();
        setBlogs((prev) => prev.map((b) => (b.id === blog.id ? saved : b)));
        showNotification(`Status updated to ${nextStatus}.`);
        await refreshData();
      }
    } catch {
      // optimistic fallback
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updated : b)));
    }
  };

  // Quick toggle featured status
  const handleToggleFeatured = async (blog: BlogPost) => {
    if (!hasRole(['super_admin', 'editor'])) return;

    const updated = { ...blog, featured: !blog.featured, updatedAt: new Date().toISOString() };

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updated)
      });

      if (res.ok) {
        const saved = await res.json();
        setBlogs((prev) => prev.map((b) => (b.id === blog.id ? saved : b)));
        showNotification(updated.featured ? 'Article featured on highlights.' : 'Article unfeatured.');
        await refreshData();
      }
    } catch {
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updated : b)));
    }
  };

  // Filtered blogs calculation
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        searchTerm === '' ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesStatus =
        statusFilter === 'all' || b.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'All' || b.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [blogs, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'published').length;
    const drafts = blogs.filter((b) => b.status === 'draft').length;
    const featured = blogs.filter((b) => b.featured).length;
    return { total, published, drafts, featured };
  }, [blogs]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-emerald-100 border border-emerald-700 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Content Management
            </span>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-900" />
            <span>Health &amp; Medical Blog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author and publish clinical health articles, doctor advice, and wellness guides for patients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/blog"
            target="_blank"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>View Public Blog</span>
          </Link>

          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-500">Total Articles</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In database</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-emerald-600">Published</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.published}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live on public site</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-amber-600">Drafts</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats.drafts}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Unpublished</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-blue-600">Featured</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.featured}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Highlighted cards</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, author, keyword, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900 focus:bg-white"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category Dropdown Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
        >
          <option value="All">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Grid / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading articles...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No blog articles match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters, or create your first blog article now.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Article Info & Thumbnail */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
                      }}
                    />
                    {blog.featured && (
                      <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs" title="Featured Article">
                        <Star className="w-2.5 h-2.5 fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
                        {blog.category}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          blog.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="capitalize">{blog.status}</span>
                      </button>

                      <span className="text-[11px] text-slate-400">
                        {blog.readingTime || '5 min read'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-900 transition-colors truncate">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                      {blog.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        {blog.authorName}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {blog.tags && blog.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {blog.tags.slice(0, 2).join(', ')}
                            {blog.tags.length > 2 && ` +${blog.tags.length - 2}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleFeatured(blog)}
                    className={`p-2 rounded-lg border transition-colors ${
                      blog.featured
                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                    title={blog.featured ? 'Featured on Top' : 'Mark as Featured'}
                  >
                    <Star className={`w-3.5 h-3.5 ${blog.featured ? 'fill-amber-400' : ''}`} />
                  </button>

                  <Link
                    to={`/blog/${blog.slug}`}
                    target="_blank"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    title="Preview public page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(blog)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(blog.id, blog.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          FULL EDIT / CREATE ARTICLE MODAL
          ========================================================================= */}
      {isModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  {editingBlog.id ? 'Edit Existing Article' : 'Create New Article'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {editingBlog.title || 'Untitled Health Article'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Preventative Cardiology: Recognizing Early Cardiovascular Signs"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      URL Slug (Auto-generated)
                    </label>
                    <div className="flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-400 font-mono">/blog/</span>
                      <input
                        type="text"
                        value={editingBlog.slug}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                        className="w-full bg-transparent border-0 p-0 text-xs font-mono focus:outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Clinical Category
                    </label>
                    <input
                      list="categories-list"
                      value={editingBlog.category}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      placeholder="Select or enter category..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    />
                    <datalist id="categories-list">
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Author & Credential info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-900" />
                  <span>Author &amp; Clinical Bylines</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Author Doctor / Clinician
                    </label>
                    <select
                      value={editingBlog.authorName}
                      onChange={(e) => handleAuthorSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name}
                        </option>
                      ))}
                      <option value="Newark Medical Associates">Newark Medical Associates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Clinical Role / Title
                    </label>
                    <input
                      type="text"
                      value={editingBlog.authorRole}
                      onChange={(e) => setEditingBlog({ ...editingBlog, authorRole: e.target.value })}
                      placeholder="e.g. Interventional Cardiologist"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Author Avatar Image URL
                    </label>
                    <input
                      type="text"
                      value={editingBlog.authorAvatar || ''}
                      onChange={(e) => setEditingBlog({ ...editingBlog, authorAvatar: e.target.value })}
                      placeholder="/src/assets/images/..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                {/* Cover Image details */}
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Featured Cover Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="text-xs font-bold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={editingBlog.imageUrl}
                    onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                    placeholder="https://... or /src/assets/images/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                  />

                  {/* Summary / Excerpt */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Excerpt (Displayed on Cards & Search)
                    </label>
                    <textarea
                      rows={2}
                      value={editingBlog.excerpt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                      placeholder="Brief 1-2 sentence overview of the article..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Image Thumbnail preview */}
                <div className="sm:col-span-4">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Image Preview</div>
                  <div className="w-full aspect-16/10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                    <img
                      src={editingBlog.imageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="absolute inset-0 bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold gap-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Change Image</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags & Settings Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editingBlog.tags) ? editingBlog.tags.join(', ') : editingBlog.tags || ''}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      })
                    }
                    placeholder="Cardiology, Blood Pressure, EKG"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingBlog.featured}
                      onChange={(e) => setEditingBlog({ ...editingBlog, featured: e.target.checked })}
                      className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Feature on Blog Hero / Highlights
                    </span>
                  </label>
                </div>
              </div>

              {/* Main Content Editor with Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Article Content <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      (Supports Markdown headers, lists, quotes, and links)
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        editorTab === 'write' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        editorTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'write' ? (
                  <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-900 focus-within:border-transparent">
                    {/* Formatting Helpers Bar */}
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-600">
                      <button
                        type="button"
                        onClick={() => insertFormatting('## ')}
                        className="p-1 hover:bg-slate-200 rounded text-xs font-bold"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('### ')}
                        className="p-1 hover:bg-slate-200 rounded text-xs font-bold"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="p-1 hover:bg-slate-200 rounded"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        className="p-1 hover:bg-slate-200 rounded"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => insertFormatting('* ')}
                        className="p-1 hover:bg-slate-200 rounded"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ')}
                        className="p-1 hover:bg-slate-200 rounded"
                        title="Callout Quote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n---\n')}
                        className="p-1 hover:bg-slate-200 rounded text-xs font-bold"
                        title="Divider Line"
                      >
                        HR
                      </button>

                      <div className="ml-auto text-[11px] text-slate-400">
                        {editingBlog.content.split(/\s+/).filter(Boolean).length} words · {editingBlog.readingTime}
                      </div>
                    </div>

                    <textarea
                      id="blog-content-textarea"
                      required
                      rows={14}
                      value={editingBlog.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Write your comprehensive medical article here..."
                      className="w-full p-4 text-xs font-mono leading-relaxed bg-white focus:outline-hidden resize-y"
                    />
                  </div>
                ) : (
                  /* Live Preview Tab */
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-h-[380px] overflow-y-auto space-y-4">
                    <div className="prose prose-slate max-w-none text-xs sm:text-sm">
                      {editingBlog.content.split('\n\n').map((block, idx) => {
                        const trimmed = block.trim();
                        if (trimmed.startsWith('## ')) {
                          return <h2 key={idx} className="text-lg font-bold text-slate-900 mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
                        }
                        if (trimmed.startsWith('### ')) {
                          return <h3 key={idx} className="text-base font-bold text-slate-800 mt-3 mb-1.5">{trimmed.replace('### ', '')}</h3>;
                        }
                        if (trimmed.startsWith('> ')) {
                          return (
                            <blockquote key={idx} className="p-3 my-2 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-lg text-slate-700 italic">
                              {trimmed.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                          const items = trimmed.split('\n').map((i) => i.replace(/^(\*|-)\s+/, ''));
                          return (
                            <ul key={idx} className="list-disc pl-5 my-2 space-y-1 text-slate-700">
                              {items.map((it, iIdx) => (
                                <li key={iIdx}>{it}</li>
                              ))}
                            </ul>
                          );
                        }
                        if (trimmed === '---') {
                          return <hr key={idx} className="my-4 border-slate-200" />;
                        }
                        return <p key={idx} className="text-slate-700 leading-relaxed mb-2">{trimmed}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Settings Dropdown */}
              <details className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 group">
                <summary className="text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-between">
                  <span>Search Engine Optimization (SEO Meta Tags)</span>
                  <span className="text-[11px] text-blue-900 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={editingBlog.metaTitle || ''}
                      onChange={(e) => setEditingBlog({ ...editingBlog, metaTitle: e.target.value })}
                      placeholder="e.g. Preventative Cardiology Guide | Newark Medical Associates"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingBlog.metaDescription || ''}
                      onChange={(e) => setEditingBlog({ ...editingBlog, metaDescription: e.target.value })}
                      placeholder="Brief meta description for Google search results..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              </details>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Article...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingBlog.id ? 'Save & Update Article' : 'Publish Article'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        currentImage={editingBlog?.imageUrl}
        onSelect={(url) => {
          if (editingBlog) {
            setEditingBlog({ ...editingBlog, imageUrl: url });
          }
        }}
      />
    </div>
  );
};
export default AdminBlogs;
