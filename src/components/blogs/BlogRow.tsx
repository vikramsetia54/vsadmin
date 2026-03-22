"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit3, Trash2, ChevronDown, ChevronUp, Clock, User, Save, X } from "lucide-react";

interface BlogRowProps {
  blog: {
    _id: string;
    title?: string;
    shortDescription?: string;
    longDescription?: string;
    image?: string;
    author?: string;
    readTime?: string;
    createdAt?: string;
    date?: string;
    href?: string;
  };
}

export function BlogRow({ blog }: BlogRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editData, setEditData] = useState({
    title: blog.title || "",
    shortDescription: blog.shortDescription || "",
    longDescription: blog.longDescription || "",
    author: blog.author || "Admin",
    readTime: blog.readTime || "",
  });

  const handleDelete = async () => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/blogs/${blog._id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/blogs/${blog._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setIsEditing(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to save blog:", error);
    } finally {
      setSaving(false);
    }
  };

  if (deleting) return null;

  const displayDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : blog.date ?? "—";

  return (
    <>
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors ${expanded || isEditing ? "bg-blue-50/30" : ""}`}>
        {/* Thumbnail */}
        <div className="h-20 w-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden hidden sm:block border border-slate-200">
          {blog.image ? (
            <img src={blog.image} alt={blog.title} className="h-20 w-32 object-cover" />
          ) : (
            <div className="h-20 w-32 bg-slate-200 rounded-lg" />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
             {isEditing ? (
                <input
                  value={editData.author}
                  onChange={(e) => setEditData({ ...editData, author: e.target.value })}
                  placeholder="Author"
                  className="bg-white border border-slate-200 rounded px-1 text-[10px] uppercase w-20"
                />
             ) : (
                <span className="uppercase tracking-wider">{blog.author ?? "Admin"}</span>
             )}
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center gap-1 font-normal">
              <Calendar className="h-3 w-3" />
              {displayDate}
            </span>
            <span className="text-slate-300">•</span>
            {isEditing ? (
                <input
                  value={editData.readTime}
                  onChange={(e) => setEditData({ ...editData, readTime: e.target.value })}
                  placeholder="5 min read"
                  className="bg-white border border-slate-200 rounded px-1 text-[10px] w-20"
                />
             ) : (
                blog.readTime && <span className="text-slate-500 font-normal">{blog.readTime}</span>
             )}
          </div>
          
          {isEditing ? (
            <input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-lg font-bold text-slate-900 w-full mb-1 border-b border-slate-200 outline-none focus:border-blue-500 bg-transparent"
            />
          ) : (
            <h3 className="text-lg font-bold text-slate-900 tracking-tight hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
              {blog.title}
            </h3>
          )}

          {isEditing ? (
            <input
              value={editData.shortDescription}
              onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
              className="text-slate-500 text-sm w-full outline-none bg-transparent"
              placeholder="Short summary..."
            />
          ) : (
            <p className="text-slate-500 text-sm line-clamp-2 mt-1">
              {blog.shortDescription ?? ""}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4 sm:mt-0 ml-auto flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Save"
              >
                <Save className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setExpanded((p) => !p)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit3 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Expanded / Editing detail panel ── */}
      {(expanded || isEditing) && (
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Full image */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cover Image</h4>
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full rounded-xl object-cover border border-slate-200 max-h-56 shadow-sm"
                />
              ) : (
                <div className="w-full h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Content / Edit Long Description */}
            <div className="md:col-span-2 space-y-4">
              {isEditing ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Content</h4>
                  <textarea
                    value={editData.longDescription}
                    onChange={(e) => setEditData({ ...editData, longDescription: e.target.value })}
                    rows={8}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 whitespace-pre-line"
                    placeholder="Write the full blog post content here..."
                  />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{blog.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {blog.author ?? "Admin"}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {displayDate}</span>
                      {blog.readTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readTime}</span>}
                    </div>
                  </div>

                  {blog.shortDescription && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Summary</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{blog.shortDescription}</p>
                    </div>
                  )}

                  {blog.longDescription && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Content</h4>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {blog.longDescription}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
