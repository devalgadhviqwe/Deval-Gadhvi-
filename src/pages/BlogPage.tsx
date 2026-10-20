import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  User,
  Tag,
  Sparkles,
  Phone,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { BlogPost } from '../types';
import { ScrollPop } from '../components/common/ScrollPop';

export const BlogPage: React.FC = () => {
  const { blogs, settings } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Only show published articles on the public page
  const publishedBlogs = useMemo(() => {
    return (blogs || []).filter((b) => b.status === 'published');
  }, [blogs]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedBlogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [publishedBlogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return publishedBlogs.filter((b) => {
      const matchesSearch =
        searchTerm === '' ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCat =
        selectedCategory === 'All' || b.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [publishedBlogs, searchTerm, selectedCategory]);

  // Featured article (first featured article or first article)
  const featuredBlog = useMemo(() => {
    return publishedBlogs.find((b) => b.featured) || publishedBlogs[0];
  }, [publishedBlogs]);

  // Remaining articles
  const gridBlogs = useMemo(() => {
    if (searchTerm || selectedCategory !== 'All') {
      return filteredBlogs;
    }
    return filteredBlogs.filter((b) => b.id !== featuredBlog?.id);
  }, [filteredBlogs, featuredBlog, searchTerm, selectedCategory]);

  return (
    <div className="bg-white min-h-screen">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white pt-12 pb-16 border-b border-slate-100">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-900 text-xs font-bold tracking-wide uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Clinical Insights &amp; Patient Education</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111111] tracking-tight max-w-3xl mx-auto leading-tight">
            Health &amp; Medical <span className="text-[#4380FF]">Articles</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Evidence-based medical guidance, preventative screenings, cardiology updates, and wellness advice written directly by our board-certified Newark physicians.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medical topics, symptoms, conditions, or doctor advice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-full shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#4380FF] focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4380FF] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED ARTICLE SPOTLIGHT (When no active search/category filter)
          ========================================================================= */}
      {!searchTerm && selectedCategory === 'All' && featuredBlog && (
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4380FF] animate-pulse" />
              <span>Featured Doctor Article</span>
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Cover Image */}
              <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-[380px] overflow-hidden group">
                <Link to={`/blog/${featuredBlog.slug}`}>
                  <img
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4380FF] text-white shadow-xs">
                      {featuredBlog.category}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Content Panel */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {featuredBlog.readingTime || '5 min read'}
                    </span>
                  </div>

                  <Link to={`/blog/${featuredBlog.slug}`} className="group block">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#4380FF] transition-colors leading-snug">
                      {featuredBlog.title}
                    </h2>
                  </Link>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {featuredBlog.authorAvatar ? (
                      <img
                        src={featuredBlog.authorAvatar}
                        alt={featuredBlog.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs">
                        MD
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{featuredBlog.authorName}</div>
                      <div className="text-[11px] text-slate-500">{featuredBlog.authorRole}</div>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${featuredBlog.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4380FF] hover:text-blue-700 transition-colors group"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          ARTICLES GRID
          ========================================================================= */}
      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {searchTerm
                  ? `Search Results for "${searchTerm}"`
                  : selectedCategory !== 'All'
                  ? `${selectedCategory} Articles`
                  : 'All Medical Insights'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing {gridBlogs.length} {gridBlogs.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
          </div>

          {gridBlogs.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No articles found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't find any articles matching your search. Try adjusting keywords or clearing category filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#4380FF] rounded-full shadow-xs hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridBlogs.map((blog, idx) => (
                <ScrollPop
                  key={blog.id}
                  delay={(idx % 3) * 0.08}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Cover Image */}
                    <Link to={`/blog/${blog.slug}`} className="block relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4380FF] text-white shadow-xs">
                          {blog.category}
                        </span>
                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {blog.readingTime || '5 min read'}
                        </span>
                      </div>

                      <Link to={`/blog/${blog.slug}`} className="block">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#4380FF] transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {blog.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Author Footer */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {blog.authorAvatar ? (
                        <img
                          src={blog.authorAvatar}
                          alt={blog.authorName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                          MD
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {blog.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {blog.authorRole}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-xs font-bold text-[#4380FF] group-hover:translate-x-0.5 transition-transform shrink-0"
                      aria-label={`Read ${blog.title}`}
                    >
                      &rarr;
                    </Link>
                  </div>
                </ScrollPop>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM APPOINTMENT CTA STRIP
          ========================================================================= */}
      <section className="bg-slate-950 text-white py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Personalized Preventative Care in Newark</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Have questions about your personal health?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Schedule a thorough consultation or comprehensive physical exam with our board-certified clinical team at Newark Medical Associates.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="px-6 py-3 text-xs font-bold text-white bg-[#4380FF] hover:bg-blue-600 rounded-full transition-all shadow-xs"
            >
              Book an Appointment
            </Link>
            <a
              href={`tel:${(settings?.phone || '973-412-9404').replace(/[^0-9]/g, '')}`}
              className="px-6 py-3 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-all inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Call: {settings?.phone || '(973) 412-9404'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default BlogPage;
