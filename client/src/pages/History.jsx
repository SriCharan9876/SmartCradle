import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Thermometer,
  Droplets,
  Activity,
  Mic,
  ChartBar,
  MonitorPlay,
  CheckCircle,
  Vibrate,
  Clock,
  ArrowLeft
} from "lucide-react";

export default function History() {
  const { id } = useParams();
  const { socket } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(100);
  const [cradleName, setCradleName] = useState("");

  useEffect(() => {
    // Parallel fetch for history and cradle details
    const fetchData = async () => {
      try {
        const [historyData, latestData] = await Promise.all([
          apiFetch(`/api/cradles/${id}/history?limit=${limit}`),
          apiFetch(`/api/cradles/${id}/latest`)
        ]);

        setRows(historyData);
        if (latestData && latestData.cradle_name) {
          setCradleName(latestData.cradle_name);
        }
      } catch (error) {
        console.error("Failed to fetch history data", error);
      }
    };

    fetchData();
  }, [id, limit]);

  useEffect(() => {
    console.log("[History] Effect running. Socket:", !!socket, "ID:", id);
    if (!socket || !id) return;

    console.log("[History] Emitting join_cradle for", id);
    socket.emit("join_cradle", id);

    const handleNewData = (newData) => {
      console.log("[History] Received new_data:", newData);
      setRows((prev) => {
        console.log("[History] Updating rows. Current count:", prev.length);
        return [newData, ...prev];
      });
    };

    socket.on("new_data", handleNewData);

    return () => {
      console.log("[History] Cleaning up");
      socket.off("new_data", handleNewData);
    };
  }, [socket, id]);

  const getMotionIcon = (state) => {
    switch (state) {
      case 'idle': return <MonitorPlay className="w-4 h-4 text-gray-400" />;
      case 'normal': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'shake': return <Vibrate className="w-4 h-4 text-rose-500" />;
      case 'tilt': return <Activity className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAnomalyBadges = (row) => {
    const anomalies = [];
    if (row.anomaly_temperature) anomalies.push({ label: 'Temp', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' });
    if (row.anomaly_humidity) anomalies.push({ label: 'Hum', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' });
    if (row.anomaly_motion) anomalies.push({ label: 'Motion', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' });
    if (row.anomaly_noise) anomalies.push({ label: 'Noise', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' });

    if (anomalies.length === 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Normal</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {anomalies.map((a, i) => (
          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${a.color}`}>
            {a.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6 text-emerald-400" />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {cradleName ? `${cradleName} History` : 'Data History'}
                </span>
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Viewing past monitoring events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-800/50 p-1.5 rounded-lg border border-white/5">
            <label htmlFor="limit-select" className="text-sm text-neutral-400 pl-2">Show:</label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-md focus:ring-emerald-500 focus:border-emerald-500 block p-1.5"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-neutral-800/40 backdrop-blur-sm shadow-xl overflow-hidden sm:rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Environment
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Motion
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Sound
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-neutral-600 mt-1 font-mono">
                        Up: {Math.floor(Number(r.uptime_seconds) / 60)}m
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <Thermometer className="w-4 h-4 text-rose-400" />
                          <span>{Number(r.temperature || 0).toFixed(1)}°C</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <Droplets className="w-4 h-4 text-sky-400" />
                          <span>{Number(r.humidity || 0).toFixed(0)}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-full bg-white/5">
                          {getMotionIcon(r.motion_state)}
                        </div>
                        <span className="text-sm text-neutral-300 capitalize">
                          {r.motion_state || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-full bg-white/5 ${r.sound_level > 50 ? 'animate-pulse' : ''}`}>
                          <Mic className={`w-4 h-4 ${Number(r.sound_level) > 50 ? 'text-purple-400' : 'text-neutral-500'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-neutral-300">
                            {Number(r.sound_level || 0).toFixed(1)} dB
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAnomalyBadges(r)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 mb-4">
                <ChartBar className="w-6 h-6 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No data points found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Data will appear here once your cradle starts monitoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
