import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, BookOpen, Upload } from 'lucide-react';
import { uploadToCloudinary } from '../../../services/cloudinary';
import {
    subscribeToHomepageBlogs,
    saveHomepageBlog,
    deleteHomepageBlog
} from '../../../services/firebase';

export const BlogsManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploadingObj, setUploadingObj] = useState(null);

    useEffect(() => {
        const unsub = subscribeToHomepageBlogs((data) => {
            if (data && data.length > 0) {
                setBlogs(data);
            } else {
                setBlogs([
                    {
                        title: 'How to Choose the Right Paper for Your Business Cards',
                        category: 'Guides',
                        date: 'Oct 24, 2026',
                        img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=600',
                        url: 'choose-right-paper',
                        id: 'blog_1'
                    },
                    {
                        title: 'Top 5 Branding Trends in 2027',
                        category: 'Trends',
                        date: 'Nov 12, 2026',
                        img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600',
                        url: 'branding-trends-2027',
                        id: 'blog_2'
                    }
                ]);
            }
        });
        return () => unsub();
    }, []);

    const handleUpdate = (index, field, value) => {
        const newData = [...blogs];
        newData[index][field] = value;
        if (field === 'title') {
            newData[index].url = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        setBlogs(newData);
    };

    const handleAdd = () => {
        setBlogs([...blogs, { title: 'New Blog Post', category: 'Tips', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), img: '', url: 'new-blog-post' }]);
    };

    const handleDelete = async (index, id) => {
        if (id) await deleteHomepageBlog(id);
        else setBlogs(blogs.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        for (const item of blogs) {
            await saveHomepageBlog(item);
        }
        setSaving(false);
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingObj(index);
        const res = await uploadToCloudinary(file, 'homepage_blogs');
        if (res.success) handleUpdate(index, 'img', res.url);
        setUploadingObj(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Latest Blog Posts
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm border border-blue-200">
                            <Plus className="w-4 h-4 inline-block" /> Add Post
                        </button>
                        <button onClick={handleSaveAll} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 inline-block" /> Save All</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blogs.map((item, i) => (
                        <div key={item.id || i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Post #{i + 1}</span>
                                <button onClick={() => handleDelete(i, item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-200 shrink-0 relative group">
                                    <img src={item.img} alt="cover" className="w-full h-full object-cover" />
                                    <label className="absolute inset-0 bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[9px] font-bold p-1 text-center">
                                        <Upload className="w-4 h-4 mb-0.5" />
                                        {uploadingObj === i ? 'Uploading...' : 'Cover Image'}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, i)} className="hidden" />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-600">Title</label>
                                        <input type="text" value={item.title || ''} onChange={(e) => handleUpdate(i, 'title', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-600">Category Tag</label>
                                            <input type="text" value={item.category || ''} onChange={(e) => handleUpdate(i, 'category', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-600">Publish Date</label>
                                            <input type="text" value={item.date || ''} onChange={(e) => handleUpdate(i, 'date', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-blue-600">URL / Slug</label>
                                        <input type="text" value={item.url || ''} onChange={(e) => handleUpdate(i, 'url', e.target.value)} className="w-full p-2 border border-blue-300 rounded-lg text-sm text-blue-700 bg-blue-50/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
