import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Activity } from 'lucide-react';
import {
    subscribeToHomepageStats,
    saveHomepageStat,
    deleteHomepageStat
} from '../../../services/firebase';

export const StatsManager = () => {
    const [stats, setStats] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsub = subscribeToHomepageStats((data) => {
            if (data && data.length > 0) {
                setStats(data.sort((a, b) => a.value - b.value));
            } else {
                setStats([
                    { label: 'Happy Customers', value: 50000, suffix: '+', decimals: 0, id: 'stat_1' },
                    { label: 'Orders Completed', value: 1.2, suffix: 'M+', decimals: 1, id: 'stat_2' },
                    { label: 'Corporate Clients', value: 500, suffix: '+', decimals: 0, id: 'stat_3' },
                    { label: 'Years Experience', value: 15, suffix: '+', decimals: 0, id: 'stat_4' }
                ]);
            }
        });
        return () => unsub();
    }, []);

    const handleUpdate = (index, field, value) => {
        const newStats = [...stats];
        newStats[index][field] = value;
        setStats(newStats);
    };

    const handleAdd = () => {
        setStats([...stats, { value: 0, suffix: '+', label: 'New Stat', decimals: 0 }]);
    };

    const handleDelete = async (index, id) => {
        if (id) {
            await deleteHomepageStat(id);
        } else {
            setStats(stats.filter((_, i) => i !== index));
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        for (const stat of stats) {
            await saveHomepageStat(stat);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Built for Your Business (Stats Data)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm border border-blue-200">
                            <Plus className="w-4 h-4 inline-block" /> Add Stat
                        </button>
                        <button onClick={handleSaveAll} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">
                            {saving ? 'Saving...' : <><Save className="w-4 h-4 inline-block" /> Save All</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <div key={stat.id || i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Stat #{i + 1}</span>
                                <button onClick={() => handleDelete(i, stat.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-600">Label (e.g. Customers)</label>
                                    <input type="text" value={stat.label || ''} onChange={(e) => handleUpdate(i, 'label', e.target.value)} className="w-full p-2 border rounded-lg" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold uppercase text-slate-600">Value</label>
                                        <input type="number" value={stat.value || 0} onChange={(e) => handleUpdate(i, 'value', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold uppercase text-slate-600">Suffix</label>
                                        <input type="text" value={stat.suffix || ''} onChange={(e) => handleUpdate(i, 'suffix', e.target.value)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold uppercase text-slate-600">Decimals</label>
                                        <input type="number" value={stat.decimals || 0} onChange={(e) => handleUpdate(i, 'decimals', Number(e.target.value))} className="w-full p-2 border rounded-lg" />
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
