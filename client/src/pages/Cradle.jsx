import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useParams, Link } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  Mic,
  Activity,
  AlertTriangle,
  Wind,
  History,
  BrainCircuit,
  Baby,
  ArrowLeft,
  Clock,
  MapPin
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Cradle() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Optional: Setup polling every 5 seconds for live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = () => {
    apiFetch(`/api/cradles/${id}/latest`).then(setData).catch(console.error);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading cradle status...</p>
        </div>
      </div>
    );
  }

  // Helper for confidence bars
  const ConfidenceBar = ({ label, value, colorClass = "bg-emerald-500" }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-400">{label}</span>
        <span className="font-medium text-white">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-neutral-700/50 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
        ></div>
      </div>
    </div>
  );

  // Helper to format uptime seconds into "Xd Yh Zm"
  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.length > 0 ? parts.join(" ") : `${seconds}s`;
  };

  const isOffline = data && (new Date() - new Date(data.created_at) > 60 * 1000);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-5 mb-2">
              <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
                <ArrowLeft size={26} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {data.cradle_name || "Smart Cradle"}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Baby size={16} />
                    {data.baby_name || "Unknown Baby"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {data.location || "Unknown Location"}
                  </span>
                  {isOffline ? (
                    <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <Clock size={14} />
                      Last active {formatDistanceToNow(new Date(data.created_at))} ago
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Clock size={14} />
                      Device Uptime: {formatUptime(data.uptime_seconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/cradle/${id}/history`}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg shadow-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            >
              <History size={18} />
              <span>View History</span>
            </Link>
            <Link
              to={`/cradle/${id}/analytics`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Activity size={18} />
              <span>Analytics</span>
            </Link>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${data.anomaly_overall ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              <div className={`w-2 h-2 rounded-full ${data.anomaly_overall ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="font-medium">{data.anomaly_overall ? 'Anomaly Detected' : 'System Normal'}</span>
            </div>
          </div>
        </div>

        {/* Anomaly Alerts */}
        {data.anomaly_overall && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.anomaly_temperature && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400">
                <Thermometer className="text-rose-500" />
                <span className="font-medium">Abnormal Temperature</span>
              </div>
            )}
            {data.anomaly_humidity && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400">
                <Droplets className="text-rose-500" />
                <span className="font-medium">Abnormal Humidity</span>
              </div>
            )}
            {data.anomaly_motion && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400">
                <Activity className="text-rose-500" />
                <span className="font-medium">Unusual Motion</span>
              </div>
            )}
            {data.anomaly_noise && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400">
                <Mic className="text-rose-500" />
                <span className="font-medium">Loud Noise Detected</span>
              </div>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Environment Card */}
          <div className="bg-neutral-800/50 rounded-2xl shadow-sm border border-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Wind size={20} className="text-emerald-500" />
              Environment
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-700/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Thermometer size={18} />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.temperature?.toFixed(1)}°C
                </div>
              </div>
              <div className="bg-neutral-700/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-primary-400">
                  <Droplets size={18} className="text-sky-400" />
                  <span className="text-sm font-medium text-sky-400">Humidity</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.humidity?.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-400 mb-3 ml-1">Sound Analysis</h3>
              <div className="flex items-center gap-4 bg-neutral-700/30 rounded-xl p-4 border border-white/5">
                <div className="p-2 bg-neutral-800 rounded-full shadow-sm">
                  <Mic size={20} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-tighter">Current Level</div>
                  <div className="text-lg font-bold text-white">{data.sound_level?.toFixed(2)} dB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Status */}
          <div className="bg-neutral-800/50 rounded-2xl shadow-sm border border-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Baby size={20} className="text-pink-500" />
              Activity Status
            </h2>

            <div className="mb-6 text-center py-6 bg-pink-500/10 rounded-xl border border-pink-500/20">
              <div className="text-sm text-pink-400 mb-1 font-medium">Current Motion</div>
              <div className="text-3xl font-bold text-white">{data.motion_state || "Unknown"}</div>
            </div>

            <h3 className="text-sm font-medium text-neutral-400 mb-3">Accelerometer Data (g)</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-neutral-700/30 rounded-lg border border-white/5">
                <div className="text-xs text-neutral-500 mb-1">X-Axis</div>
                <div className="font-mono font-medium text-neutral-300">{data.acc_x?.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-neutral-700/30 rounded-lg border border-white/5">
                <div className="text-xs text-neutral-500 mb-1">Y-Axis</div>
                <div className="font-mono font-medium text-neutral-300">{data.acc_y?.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-neutral-700/30 rounded-lg border border-white/5">
                <div className="text-xs text-neutral-500 mb-1">Z-Axis</div>
                <div className="font-mono font-medium text-neutral-300">{data.acc_z?.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-neutral-800/50 rounded-2xl shadow-sm border border-white/5 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BrainCircuit size={20} className="text-purple-500" />
              AI Insights
            </h2>

            <div className="space-y-4">
              <ConfidenceBar
                label="Idle Probability"
                value={data.confidence_idle}
                colorClass="bg-neutral-500"
              />
              <ConfidenceBar
                label="Normal Movement"
                value={data.confidence_normal}
                colorClass="bg-emerald-500"
              />
              <ConfidenceBar
                label="Shake Detected"
                value={data.confidence_shake}
                colorClass="bg-rose-500"
              />
              <ConfidenceBar
                label="Tilt Detected"
                value={data.confidence_tilt}
                colorClass="bg-orange-500"
              />
            </div>

            <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-300">System Note</h4>
                  <p className="text-xs text-purple-400/80 mt-1 leading-relaxed">
                    Confidence scores indicate the likelihood of specific events based on sensor fusion algorithms.
                    High shake/tilt confidence requires immediate attention.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

