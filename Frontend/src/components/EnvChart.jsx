import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function EnvChart({ data }) {
  const chartData = data.map((sample) => ({
    time: new Date(sample.timestamp_unix * 1000).toLocaleTimeString(),
    temp: sample.environment?.temperature ?? 0,
    humidity: sample.environment?.humidity ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#ff7300"
          name="Temperature (°C)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="humidity"
          stroke="#387908"
          name="Humidity (%)"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
