import React, { useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MotionConfidenceChart({ data }) {
  // Preprocess to keep only the highest-confidence motion per sample
  const chartData = data.map((sample) => {
    const motions = {
      idle: sample.motion?.confidence?.idle ?? 0,
      normal: sample.motion?.confidence?.normal ?? 0,
      shake: sample.motion?.confidence?.shake ?? 0,
      tilt: sample.motion?.confidence?.tilt ?? 0,
    };

    const [highestMotion, highestValue] = Object.entries(motions).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ["idle", motions.idle]
    );

    return {
      timestamp: sample.timestamp_unix, // numeric for proper ordering
      timeLabel: new Date(sample.timestamp_unix * 1000).toLocaleTimeString(), // for display
      motion: highestMotion,
      value: highestValue,
    };
  });

  // Debugging output
  useEffect(() => {
    console.log("Processed chartData:", chartData);
  }, [chartData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        {/* Use timestamp as x-axis key */}
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["auto", "auto"]}
          tickFormatter={(ts) =>
            new Date(ts * 1000).toLocaleTimeString()
          }
          name="Time"
        />
        <YAxis dataKey="value" name="Confidence" domain={[0, 1]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          labelFormatter={(ts) =>
            new Date(ts * 1000).toLocaleTimeString()
          }
        />
        <Legend />

        <Scatter
          data={chartData.filter((d) => d.motion === "idle")}
          name="Idle"
          fill="#8884d8"
        />
        <Scatter
          data={chartData.filter((d) => d.motion === "normal")}
          name="Normal"
          fill="#82ca9d"
        />
        <Scatter
          data={chartData.filter((d) => d.motion === "shake")}
          name="Shake"
          fill="#ff0000"
        />
        <Scatter
          data={chartData.filter((d) => d.motion === "tilt")}
          name="Tilt"
          fill="#ffaa00"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
