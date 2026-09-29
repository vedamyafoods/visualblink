import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, MessageSquare, Upload } from 'lucide-react';
import { uploadToCloudinary } from '../../../services/cloudinary';
import {
    subscribeToHomepageTestimonials,
    saveHomepageTestimonial,
    deleteHomepageTestimonial
} from '../../../services/firebase';

export const TestimonialsManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploadingObj, setUploadingObj] = useState(null);

    useEffect(() => {
        const unsub = subscribeToHomepageTestimonials((data) => {
            if (data && data.length > 0) {
                setTestimonials(data);
            } else {
                setTestimonials([
                    {
                        name: 'Sarah Jenkins',
                        role: 'Design Studio Director',
                        quote: 'The print quality is unmatched. What sets them apart is their attention to detail and color accuracy. Absolutely recommend for professional bulk orders.',
                        rating: 5,
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                        id: 'testi_1'
                    },
                    {
                        name: 'David Chen',
                        role: 'Startup Founder',
                        quote: 'Fast turnaround time and the premium finishes (like spot UV) were exactly what our branding needed. The customer service team was also very helpful.',
                        rating: 5,
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
                        id: 'testi_2'
                    },
                    {
                        name: 'Emily Rodriguez',
                        role: 'Event Coordinator',
                        quote: 'Ordered 5,000 flyers and 200 posters for a major conference. Everything arrived two days early and looked stunning. Will definitely use them again.',
                        rating: 4.5,
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
                        id: 'testi_3'
                    }
                ]);
            }
        });
        return () => unsub();
    }, []);

    const handleUpdate = (index, field, value) => {
        const newData = [...testimonials];
        newData[index][field] = value;
        setTestimonials(newData);
    };

    const handleAdd = () => {
        setTestimonials([...testimonials, { name: 'New Customer', role: 'Role', quote: 'Great service!', rating: 5, avatar: '' }]);
    };

    const handleDelete = async (index, id) => {
        if (id) await deleteHomepageTestimonial(id);
        else setTestimonials(testimonials.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        for (const item of testimonials) {
            await saveHomepageTestimonial(item);
        }
        setSaving(false);
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingObj(index);
        const res = await uploadToCloudinary(file, 'homepage_testimonials');
        if (res.success) handleUpdate(index, 'avatar', res.url);
        setUploadingObj(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Testimonials & Reviews
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm border border-blue-200">
                            <Plus className="w-4 h-4 inline-block" /> Add Testimonial
                        </button>
                        <button onClick={handleSaveAll} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 inline-block" /> Save All</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((item, i) => (
                        <div key={item.id || i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Testimonial #{i + 1}</span>
                                <button onClick={() => handleDelete(i, item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-20 h-20 rounded-full border border-slate-200 overflow-hidden bg-slate-200 shrink-0 relative group">
                                    <img src={item.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    <label className="absolute inset-0 bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[9px] font-bold p-1 text-center">
                                        <Upload className="w-4 h-4 mb-0.5" />
                                        {uploadingObj === i ? 'Uploading...' : 'Avatar'}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, i)} className="hidden" />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-600">Name</label>
                                            <input type="text" value={item.name || ''} onChange={(e) => handleUpdate(i, 'name', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-600">Role / Company</label>
                                            <input type="text" value={item.role || ''} onChange={(e) => handleUpdate(i, 'role', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-600 w-full flex justify-between">Quote <span>Rating: {item.rating}</span></label>
                                        <textarea value={item.quote || ''} rows={2} onChange={(e) => handleUpdate(i, 'quote', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
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
