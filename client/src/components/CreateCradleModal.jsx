import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { X, Copy, Check, Loader2 } from "lucide-react";

export default function CreateCradleModal({ isOpen, onClose, onCreated }) {
    const [formData, setFormData] = useState({
        cradle_name: "",
        baby_name: "",
        location: "",
        device_key: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Generate a comprehensive random key
            // Format: CRADLE-[random_hex_8chars]-[timestamp] to ensure uniqueness and readability
            const randomPart = Math.random().toString(16).substring(2, 10).toUpperCase();
            const timestamp = Date.now().toString(36).toUpperCase();
            const key = `CRADLE-${randomPart}-${timestamp}`;
            setFormData((prev) => ({ ...prev, device_key: key }));
            setError(null);
            setLoading(false);
            setCopied(false);
        }
    }, [isOpen]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formData.device_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiFetch("/api/cradles", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            onCreated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                    <h2 className="text-xl font-bold text-white mb-2">Setup New Cradle</h2>
                    <p className="text-sm text-neutral-400 mb-6">
                        Enter details and secure your unique device key.
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

                        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
                            <label className="block text-xs font-medium text-emerald-400 mb-1.5">
                                Device Secret Key
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-black/30 rounded px-2.5 py-1.5 text-xs text-neutral-300 font-mono break-all border border-neutral-800">
                                    {formData.device_key}
                                </code>
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md transition-all"
                                    title="Copy Key"
                                >
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-2">
                                ⚠️ IMPORTANT: Use this key in your IoT device firmware to authenticate logs. Keep it secret.
                            </p>
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
                                Create Cradle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
