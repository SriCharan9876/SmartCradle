import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { X, Loader2, Save, Key } from "lucide-react";

export default function EditCradleModal({ isOpen, onClose, onUpdated, cradle }) {
    const [formData, setFormData] = useState({
        cradle_name: "",
        baby_name: "",
        location: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && cradle) {
            setFormData({
                cradle_name: cradle.cradle_name || "",
                baby_name: cradle.baby_name || "",
                location: cradle.location || "",
            });
            setError(null);
        }
    }, [isOpen, cradle]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiFetch(`/api/cradles/${cradle.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            onUpdated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !cradle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Edit Cradle</h2>
                    <p className="text-sm text-neutral-400 mb-6">
                        Update details for <strong>{cradle.cradle_name}</strong>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                Cradle Name (Required)
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                placeholder="e.g. Living Room Cradle"
                                value={formData.cradle_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, cradle_name: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Baby Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g. Alice"
                                    value={formData.baby_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, baby_name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g. Bedroom"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50">
                            <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                                DEVICE ID (READ ONLY)
                            </label>
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
                                <Key size={12} />
                                {cradle.id}
                            </div>
                        </div>

                        {error && (
                            <div className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
