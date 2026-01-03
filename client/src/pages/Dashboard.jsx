import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Activity, MapPin, Baby, Calendar, Plus, Edit2 } from "lucide-react";
import CreateCradleModal from "../components/CreateCradleModal";
import EditCradleModal from "../components/EditCradleModal";

export default function Dashboard() {
  const [cradles, setCradles] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCradle, setEditingCradle] = useState(null);

  const fetchCradles = () => {
    apiFetch("/api/cradles").then(setCradles);
  };

  useEffect(() => {
    fetchCradles();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Smart Cradle Monitor
            </h1>
            <p className="text-neutral-400 mt-2">
              Overview of all your connected devices
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Cradle</span>
          </button>
        </header>

        <CreateCradleModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchCradles}
        />

        <EditCradleModal
          isOpen={!!editingCradle}
          cradle={editingCradle}
          onClose={() => setEditingCradle(null)}
          onUpdated={fetchCradles}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cradles.map((c) => {
            const isNormal = c.anomaly_overall === false; // explicitly false means normal, null/true might mean unknown or anomaly
            // If we treat null as "No Data", we can have a gray badge. 
            // Assuming anomaly_overall is boolean: false (normal), true (anomaly). Null (no data).

            let statusColor = "bg-gray-500/20 text-gray-400 border-gray-500/30";
            let statusText = "No Data";

            if (c.anomaly_overall === false) {
              statusColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
              statusText = "Normal";
            } else if (c.anomaly_overall === true) {
              statusColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
              statusText = "Attention Needed";
            }

            return (
              <div key={c.id} className="relative group">
                <Link
                  to={`/cradle/${c.id}`}
                  className="bg-neutral-800/50 hover:bg-neutral-800 border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 block"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {c.cradle_name}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-400">
                        <MapPin size={12} />
                        <span>{c.location || "Unknown Location"}</span>
                      </div>
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusColor} backdrop-blur-sm`}>
                      {statusText}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 flex items-center gap-1.5">
                        <Baby size={14} /> Baby Name
                      </span>
                      <span className="font-medium text-neutral-300">
                        {c.baby_name || "Not Set"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 flex items-center gap-1.5">
                        <Calendar size={14} /> Registered
                      </span>
                      <span className="font-medium text-neutral-300">
                        {c.created_at ? format(new Date(c.created_at), "MMM d, yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                      <Activity size={14} />
                      View Real-time Vitals &rarr;
                    </div>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingCradle(c);
                  }}
                  className="absolute bottom-4 right-4 p-2 text-neutral-500 hover:text-white hover:bg-neutral-700/50 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
                  title="Edit Cradle"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {cradles.length === 0 && (
          <div className="text-center py-20 bg-neutral-800/30 rounded-3xl border border-white/5 border-dashed">
            <p className="text-neutral-500">No cradles found. Add your first device.</p>
          </div>
        )}
      </div>
    </div>
  );
}
