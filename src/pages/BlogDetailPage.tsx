import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { BlogPost } from '../types';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { blogs, settings } = useClinic();

  // Find article by slug or id
  const blog = useMemo(() => {
    return (blogs || []).find((b) => b.slug === slug || b.id === slug);
  }, [blogs, slug]);

  // Related articles (same category or latest articles, excluding current)
  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return (blogs || [])
      .filter((b) => b.id !== blog.id && b.status === 'published')
      .slice(0, 3);
  }, [blogs, blog]);

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">Article Not Found</h1>
          <p className="text-xs text-slate-500">
            The requested medical article may have been moved or unpublished.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#4380FF] rounded-full hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Blog Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* =========================================================================
          ARTICLE HEADER & BREADCRUMBS
          ========================================================================= */}
      <div className="bg-slate-50/70 border-b border-slate-100 pt-8 pb-12">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb & Back */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#4380FF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all health articles</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Article</span>
            </button>
          </div>

          {/* Category Tag */}
          <div className="mb-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#4380FF] text-white shadow-2xs">
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#111111] tracking-tight leading-[1.2]">
            {blog.title}
          </h1>

          {/* Subtitle / Excerpt Lead */}
          {blog.excerpt && (
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {blog.excerpt}
            </p>
          )}

          {/* Author Byline Bar */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {blog.authorAvatar ? (
                <img
                  src={blog.authorAvatar}
                  alt={blog.authorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm">
                  MD
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{blog.authorName}</span>
                  <span title="Board-Certified Clinician" className="inline-flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                  </span>
                </div>
                <div className="text-xs text-slate-500">{blog.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {blog.readingTime || '5 min read'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURED IMAGE
          ========================================================================= */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 mb-12">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 aspect-16/9 sm:aspect-21/9 relative">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          ARTICLE CONTENT
          ========================================================================= */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <div className="space-y-6 text-slate-800 leading-relaxed text-base sm:text-[17px]">
          {blog.content.split('\n\n').map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // Headings
            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight pt-6 pb-1 border-b border-slate-100"
                >
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-slate-900 pt-4"
                >
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h4
                  key={idx}
                  className="text-lg font-bold text-slate-800 pt-3 text-[#4380FF]"
                >
                  {trimmed.replace('#### ', '')}
                </h4>
              );
            }

            // Callout quote
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="my-6 p-5 sm:p-6 bg-blue-50/80 rounded-2xl border-l-4 border-[#4380FF] text-slate-800 italic leading-relaxed text-base sm:text-lg shadow-2xs"
                >
                  {trimmed.replace('> ', '').replace(/^"|"$/g, '')}
                </blockquote>
              );
            }

            // Unordered list
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              const listItems = trimmed.split('\n').map((line) => line.replace(/^(\*|-)\s+/, ''));
              return (
                <ul key={idx} className="my-4 space-y-2.5 pl-6 list-disc text-slate-700">
                  {listItems.map((item, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            // Ordered list
            if (/^\d+\.\s/.test(trimmed)) {
              const listItems = trimmed.split('\n').map((line) => line.replace(/^\d+\.\s+/, ''));
              return (
                <ol key={idx} className="my-4 space-y-2.5 pl-6 list-decimal text-slate-700 font-medium">
                  {listItems.map((item, iIdx) => (
                    <li key={iIdx} className="leading-relaxed text-slate-700 font-normal">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }

            // Divider
            if (trimmed === '---') {
              return <hr key={idx} className="my-8 border-slate-200" />;
            }

            // Standard Paragraph
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags Row */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Related Topics:</span>
            </span>
            {blog.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* =========================================================================
            AUTHOR BIO CARD
            ========================================================================= */}
        <div className="mt-12 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {blog.authorAvatar ? (
            <img
              src={blog.authorAvatar}
              alt={blog.authorName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xl shrink-0">
              MD
            </div>
          )}

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-base font-bold text-slate-900">
                About {blog.authorName}
              </h3>
              <span className="text-xs font-medium text-[#4380FF]">
                {blog.authorRole}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Practicing at Newark Medical Associates located at 337 Bloomfield Avenue, Newark, NJ. Dedicated to evidence-based clinical medicine, thorough diagnostics, and patient-first preventative care.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4380FF] hover:text-blue-700 transition-colors"
              >
                <span>Schedule a Consultation with Our Clinical Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900/80 leading-relaxed">
          <strong>Medical Disclaimer:</strong> The information provided in this article is for educational and informational purposes only and does not substitute for professional medical advice, diagnosis, or clinical treatment. Always consult with a qualified healthcare provider regarding personal symptoms or conditions.
        </div>
      </div>

      {/* =========================================================================
          RELATED ARTICLES SECTION
          ========================================================================= */}
      {relatedBlogs.length > 0 && (
        <section className="mt-20 pt-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  More Clinical Guidance
                </span>
                <h2 className="text-2xl font-bold text-slate-900">Related Articles</h2>
              </div>
              <Link
                to="/blog"
                className="text-xs font-bold text-[#4380FF] hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((rBlog) => (
                <div
                  key={rBlog.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <Link to={`/blog/${rBlog.slug}`} className="block relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={rBlog.imageUrl}
                      alt={rBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4380FF] text-white">
                        {rBlog.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{new Date(rBlog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>·</span>
                      <span>{rBlog.readingTime}</span>
                    </div>
                    <Link to={`/blog/${rBlog.slug}`} className="block">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4380FF] transition-colors line-clamp-2">
                        {rBlog.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rBlog.excerpt}
                    </p>
                  </div>

                  <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#4380FF]">
                    <span>Read More</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};
export default BlogDetailPage;
