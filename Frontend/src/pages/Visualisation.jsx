import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../fireBase.js";
import { useAuth } from "../contexts/Authentication";
import { useNavigate } from "react-router-dom";
import { notify } from "../Features/toastManager.jsx";
import "../Styles/Visualisation.css";
import AnomalySummaryChart from "../components/AnomalySummaryChart.jsx";
import BoltIcon from "@mui/icons-material/Bolt";
import icon from "../assets/icon.png"

import LiveStatus from "../components/LiveStatus";
import EnvChart from "../components/EnvChart";
import MotionConfidenceChart from "../components/MotionConfidenceChart";

import InsertChartIcon from "@mui/icons-material/InsertChart";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import SensorsIcon from "@mui/icons-material/Sensors";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";


// Icon mapping as per your final list
const iconMap = {
  temperature: <ThermostatIcon fontSize="large" />,
  humidity: <OpacityIcon fontSize="large" />,
  motion: <SensorsIcon fontSize="large" />,
  noise: <GraphicEqIcon fontSize="large" />,
  cry: <SentimentVeryDissatisfiedIcon fontSize="large" />,
};

const DataViewer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cradleData, setCradleData] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (!user) {
      notify.error("User should log in to monitor the cradle");
      navigate("/login");
      return;
    }

    const dataRef = ref(db, `cradleData`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([id, item]) => ({ id, ...item }));
        const sortedArr = arr.sort((a, b) => a.timestamp_unix - b.timestamp_unix);
        setCradleData(sortedArr);
        setLatest(sortedArr[sortedArr.length - 1]);
        if (sortedArr[sortedArr.length - 1].anomalies?.overall) {
          notify.error("Anomaly Detected! Please check the dashboard for more details.");
        }
      } else {
        setCradleData([]);
        setLatest(null);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const headerState = (() => {
    if (!latest || !latest.anomalies) return "safe-state";
    if (latest.anomalies.overall) return "danger-state";
    const any = Object.values(latest.anomalies).some((v) => v === true);
    if (any) return "warn-state";
    return "safe-state";
  })();

  const renderStatus = (flag) => ({
    text: flag ? "Detected" : "Normal",
    icon: flag ? <ErrorIcon fontSize="inherit" /> : <CheckCircleIcon fontSize="inherit" />,
    className: flag ? "detected" : "normal",
  });

  const overall = renderStatus(latest?.anomalies?.overall);

  const latestAnomalies = latest?.anomalies
    ? Object.entries(latest.anomalies)
    : [];

  return (
    <div className="dashboard-page">
      <header className={`header-page ${headerState}`}>
        <h1 className="welcome-text">
          <img 
            src={icon} 
            alt="Cradle Icon" 
            className="welcome-icon" 
          />
          Welcome, <b>{user ? user.displayName || user.email : "Guest"}</b>
        </h1>

        <div className="header-buts">
          {user ? (
            <button onClick={logout} className="logout-btn">
              Log Out
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="logout-btn">
                Log In
              </button>
              <button onClick={() => navigate("/signUp")} className="logout-btn">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <main className="dashboard-card">
        <h2>
          <InsertChartIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
          Smart Cradle Dashboard
        </h2>


        <section className="card">
          <LiveStatus latest={latest} />
        </section>

        {latest && (
          <section className="card">
            {/* existing detailed anomaly card component */}
            <h3 style={{ margin: "1rem 0", display: "flex", alignItems: "center" }}>
              <BoltIcon style={{ marginRight: 8 }} /> Anomaly Breakdown
            </h3>
            <div className={`overall-anomaly-banner ${overall.className}`}>
              <div className="icon">{overall.icon}</div>
              <span className="text">
                Overall Anomaly: {overall.text}
              </span>
            </div>

            <div className="mini-anom-grid">
              {latestAnomalies
                .filter(([key]) => key !== "timestamp" && key !== "id" && key !== "overall")
                .map(([type, value]) => {
                  const isActive = !!value;
                  const label = type[0].toUpperCase() + type.slice(1);
                  return (
                    <div
                      key={type}
                      className={`mini-anom-card ${isActive ? "active" : "normal"}`}
                      aria-live="polite"
                    >
                      <div className="mini-anom-icon" title={label}>
                        {iconMap[type] || <InsertChartIcon />}
                      </div>
                      <div className="mini-anom-body">
                        <div className="mini-anom-label">{label}</div>
                        <div className={`mini-anom-status ${isActive ? "warn" : "ok"}`}>
                          {isActive ? "Detected" : "Normal"}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        <section>
          <h3>
            <ThermostatIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
            Environment Trends
          </h3>
          <EnvChart data={cradleData} />
        </section>

        <section>
          <h3>
            <TrackChangesIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
            Motion Confidence
          </h3>
          <MotionConfidenceChart data={cradleData} />
        </section>

        {cradleData.length > 0 && (
          <section>
            <h3>
              <TrackChangesIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
              Anomaly Summary
            </h3>
            <AnomalySummaryChart data={cradleData} />
          </section>
        )}
      </main>
    </div>
  );
};

export default DataViewer;
