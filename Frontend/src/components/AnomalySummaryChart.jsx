// components/AnomalySummaryChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register scales ONCE
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnomalySummaryChart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No anomaly data available</p>;
  }

  //  Count anomalies, skipping "overall"
  const anomalyCounts = {};
  data.forEach((entry) => {
    if (entry.anomalies && typeof entry.anomalies === "object") {
      Object.entries(entry.anomalies).forEach(([type, value]) => {
        if (value === true && type !== "overall") {
          anomalyCounts[type] = (anomalyCounts[type] || 0) + 1;
        }
      });
    }
  });

  const labels = Object.keys(anomalyCounts);
  const values = Object.values(anomalyCounts);

  if (labels.length === 0) {
    return <p>No anomalies detected yet</p>;
  }

  const colorMap = {
    motion: "rgba(255, 99, 132, 0.6)",      // Red
    temperature: "rgba(54, 162, 235, 0.6)", // Blue
    noise: "rgba(255, 206, 86, 0.6)",       // Yellow
    // overall intentionally excluded
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Anomaly Count",
        data: values,
        backgroundColor: labels.map(
          (name) => colorMap[name] || "rgba(201, 203, 207, 0.6)"
        ),
        borderColor: labels.map(
          (name) =>
            (colorMap[name] || "rgba(201, 203, 207, 1)").replace("0.6", "1")
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default AnomalySummaryChart;
