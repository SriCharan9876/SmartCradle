import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import {
    ArrowLeft,
    Thermometer,
    Droplets,
    Mic,
    Activity,
    Calendar,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    MonitorPlay
} from "lucide-react";
import { format } from "date-fns";

export default function Analytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [cradleName, setCradleName] = useState("");
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [anomalyStats, setAnomalyStats] = useState([]);

    useEffect(() => {
        // Delay chart rendering to ensure DOM is ready
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyData, latestData] = await Promise.all([
                    apiFetch(`/api/cradles/${id}/history?limit=200`),
                    apiFetch(`/api/cradles/${id}/latest`)
                ]);

                // Map motion states to numerical values for charting
                const getMotionValue = (state) => {
                    switch (state?.toLowerCase()) {
                        case 'idle': return 0;
                        case 'normal': return 1;
                        case 'shake': return 2;
                        case 'tilt': return 3;
                        default: return 0;
                    }
                };

                // Process data for charts
                const processedData = historyData.map(item => ({
                    ...item,
                    time: format(new Date(item.created_at), "HH:mm"),
                    fullDate: new Date(item.created_at).toLocaleString(),
                    motionStateValue: getMotionValue(item.motion_state)
                })).reverse();

                // Calculate Anomaly Stats
                let tempCount = 0, humCount = 0, noiseCount = 0, motionCount = 0;
                processedData.forEach(d => {
                    if (d.anomaly_temperature) tempCount++;
                    if (d.anomaly_humidity) humCount++;
                    if (d.anomaly_noise) noiseCount++;
                    if (d.anomaly_motion) motionCount++;
                });

                setAnomalyStats([
                    { name: 'Temperature', value: tempCount, color: '#f43f5e' }, // Rose
                    { name: 'Humidity', value: humCount, color: '#0ea5e9' },    // Sky
                    { name: 'Noise', value: noiseCount, color: '#a855f7' },     // Purple
                    { name: 'Motion', value: motionCount, color: '#f97316' },   // Orange
                ].filter(item => item.value > 0)); // Only show types that have occurrences

                setData(processedData);
                if (latestData) setCradleName(latestData.cradle_name);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading || !mounted) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-neutral-800 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-sm z-50">
                    <p className="text-neutral-400 text-xs mb-2">{label || dataPoint?.fullDate}</p>
                    {payload.map((entry, index) => {
                        // Custom display for Motion State
                        if (entry.name === "Motion State") {
                            return (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-sm font-medium text-white capitalize">
                                        State: {dataPoint.motion_state || 'Unknown'}
                                    </span>
                                </div>
                            )
                        }
                        return (
                            <div key={index} className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></div>
                                <span className="text-sm font-medium text-white">
                                    {entry.name}: {entry.value} {entry.unit}
                                </span>
                            </div>
                        )
                    })}
                </div>
            );
        }
        return null;
    };

    const motionStateFormatter = (value) => {
        const states = ['Idle', 'Normal', 'Shake', 'Tilt'];
        return states[value] || '';
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Activity className="w-6 h-6 text-emerald-500" />
                            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                {cradleName ? `${cradleName} Analytics` : "IoT Analytics"}
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Temperature & Humidity Chart - Spans Full Width on MD */}
                    <div className="bg-neutral-800/50 border border-white/5 p-5 rounded-2xl shadow-sm backdrop-blur-sm md:col-span-2">
                        <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Thermometer className="text-emerald-500" size={16} />
                            Environment Trends
                        </h2>
                        <div className="h-[250px] w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        label={{ value: '%', angle: 90, position: 'insideRight', fill: '#0ea5e9', fontSize: 10 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="temperature"
                                        name="Temperature"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorTemp)"
                                        unit="°C"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="humidity"
                                        name="Humidity"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorHum)"
                                        unit="%"
                                    />
                                    {/* Mark Anomalies with Red Dots */}
                                    {data.map((entry, index) => (
                                        entry.anomaly_temperature && (
                                            <ReferenceDot
                                                key={`temp-${index}`}
                                                yAxisId="left"
                                                x={entry.time}
                                                y={entry.temperature}
                                                r={4}
                                                fill="#f43f5e"
                                                stroke="none"
                                            />
                                        )
                                    ))}
                                    {data.map((entry, index) => (
                                        entry.anomaly_humidity && (
                                            <ReferenceDot
                                                key={`hum-${index}`}
                                                yAxisId="right"
                                                x={entry.time}
                                                y={entry.humidity}
                                                r={4}
                                                fill="#f43f5e"
                                                stroke="none"
                                            />
                                        )
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sound Level Chart */}
                    <div className="bg-neutral-800/50 border border-white/5 p-5 rounded-2xl shadow-sm backdrop-blur-sm">
                        <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Mic className="text-purple-500" size={16} />
                            Noise Levels
                        </h2>
                        <div className="h-[200px] w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSound" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="sound_level"
                                        name="Sound"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#colorSound)"
                                        unit="dB"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Anomaly Distribution (Pie Chart) */}
                    <div className="bg-neutral-800/50 border border-white/5 p-5 rounded-2xl shadow-sm backdrop-blur-sm">
                        <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <PieChartIcon className="text-orange-500" size={16} />
                            Anomaly Distribution
                        </h2>
                        <div className="h-[200px] w-full overflow-hidden relative">
                            {anomalyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                    <PieChart>
                                        <Pie
                                            data={anomalyStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {anomalyStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} layout="vertical" verticalAlign="middle" align="right" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
                                    No anomalies detected
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Motion State Timeline - Spans Full Width on MD */}
                    <div className="bg-neutral-800/50 border border-white/5 p-5 rounded-2xl shadow-sm backdrop-blur-sm md:col-span-2">
                        <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <MonitorPlay className="text-amber-500" size={16} />
                            Cradle State Timeline
                        </h2>
                        <div className="h-[200px] w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMotion" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 10 }}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#525252"
                                        tick={{ fill: '#737373', fontSize: 11 }}
                                        tickLine={false}
                                        ticks={[0, 1, 2, 3]}
                                        tickFormatter={motionStateFormatter}
                                        domain={[0, 3]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="stepAfter"
                                        dataKey="motionStateValue"
                                        name="Motion State"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorMotion)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
