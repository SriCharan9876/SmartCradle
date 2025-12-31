import React from "react";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import SensorsIcon from "@mui/icons-material/Sensors";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import "../Styles/liveStatus.css";
export default function LiveStatus({ latest }) {
  if (!latest)
    return (
      <div className="status-grid">
        <div className="status-card waiting">
          <div className="icon">
            <HourglassEmptyIcon fontSize="inherit" />
          </div>
          <h3>Live Status</h3>
          <div className="status" style={{ color: "gray" }}>
            Waiting for data...
          </div>
        </div>
      </div>
    );

  const { environment, motion, sound } = latest;

  return (
    <>
    <h3 className="heade"><FiberManualRecordIcon style={{ color: "green" }} /> Live Status</h3>
    <div className="status-grid">
      <div className="status-card">
        <div className="icon">
          <ThermostatIcon fontSize="inherit" />
        </div>
        <h3>Temperature</h3>
        <div className="status">{environment?.temperature ?? "--"} °C</div>
      </div>

      <div className="status-card">
        <div className="icon">
          <OpacityIcon fontSize="inherit" />
        </div>
        <h3>Humidity</h3>
        <div className="status">{environment?.humidity ?? "--"} %</div>
      </div>

      <div className="status-card">
        <div className="icon">
          <SensorsIcon fontSize="inherit" />
        </div>
        <h3>Motion</h3>
        <div className="status">{motion?.state ?? "Unknown"}</div>
      </div>

      <div className="status-card">
        <div className="icon">
          <GraphicEqIcon fontSize="inherit" />
        </div>
        <h3>Audio Level</h3>
        <div className="status">{sound?.level ?? "--"} units</div>
      </div>
    </div>
    </>
  );
}
