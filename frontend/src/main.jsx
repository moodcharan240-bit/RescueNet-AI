import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Ambulance,
  ArrowDownRight,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Cross,
  Flame,
  HeartPulse,
  Home,
  LifeBuoy,
  LocateFixed,
  LockKeyhole,
  LogOut,
  Map,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import "./style.css";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const token = await currentUser.getIdToken();

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
const categories = [
  ["Road Accident", Ambulance, "red"],
  ["Fire Emergency", Flame, "orange"],
  ["Medical Emergency", Cross, "rose"],
  ["Flood Emergency", Waves, "blue"],
  ["Crime / Safety", Shield, "amber"],
  ["Building Emergency", Building2, "purple"],
];
const Icon = ({ icon: I, size = 19, ...props }) => (
  <I size={size} strokeWidth={1.8} {...props} />
);
function Brand({ light = false }) {
  return (
    <Link to="/" className={"brand " + (light ? "brand-light" : "")}>
      <span className="brand-mark">
        <Cross size={18} fill="white" strokeWidth={3} />
      </span>
      <span>
        RescueNet <b>AI</b>
        <small>INTELLIGENT EMERGENCY RESPONSE</small>
      </span>
    </Link>
  );
}
function DemoBanner() {
  return (
    <div className="demo-banner">
      <Sparkles size={14} /> DEMONSTRATION MODE <span>•</span> Simulated
      incidents only. For a real emergency, call your local emergency number.
    </div>
  );
}

function Landing() {
  const { user, profile, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "responder"
      ? "/responder"
      : "/citizen";

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to sign out. Please try again.");
    }
  }

  return (
    <div className="landing">
      <DemoBanner />
      <div className="hero">
        <nav className="landing-nav">
          <Brand light />

          <div className="landing-links">
            <a className="active" href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </div>

          <div className="nav-actions">
            {loading ? (
              <span className="nav-login">Loading...</span>
            ) : user && profile ? (
              <>
                <span className="nav-account">
                  <span className="nav-account-email">
                    {profile.email || user.email}
                  </span>
                  <span className="nav-account-role">
                    {profile.role}
                  </span>
                </span>

                <Link className="nav-login" to={dashboardPath}>
                  Dashboard
                </Link>

                <button
                  className="nav-logout"
                  type="button"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link className="nav-login" to="/login">
                Log in
              </Link>
            )}

            <Link className="btn btn-red nav-report" to="/citizen">
              <Siren size={16} /> Report Emergency
            </Link>
          </div>
        </nav>

        <div className="hero-content" id="home">
          <div className="eyebrow light">
            <span className="pulse-dot" /> INTELLIGENT EMERGENCY RESPONSE
          </div>
          <h1>
            When every
            <br />
            second <em>matters.</em>
          </h1>
          <p className="hero-sub">
            Smarter response.
            <br />
            <strong>Safer communities.</strong>
          </p>
          <p className="hero-copy">
            Connecting people, responders, and intelligent technology to bring
            help where it's needed most.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-red btn-large" to="/citizen">
              <Siren size={19} /> Report an Emergency <ArrowRight size={17} />
            </Link>
            <a className="btn btn-outline btn-large" href="#how">
              See how it works <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-note">
            <ShieldCheck size={16} /> Built for faster, more informed emergency
            response
          </div>
        </div>

        <div className="hero-bottom">
          <div>
            <span className="stat-icon red-icon"><Siren /></span>
            <p><b>24/7</b><small>Emergency reporting</small></p>
          </div>
          <div>
            <span className="stat-icon blue-icon"><Users /></span>
            <p><b>Connected</b><small>Communities & teams</small></p>
          </div>
          <div>
            <span className="stat-icon yellow-icon"><Zap /></span>
            <p><b>Faster</b><small>Response coordination</small></p>
          </div>
          <span className="hero-bottom-label">
            A SMARTER WAY TO RESPOND <ArrowRight size={15} />
          </span>
        </div>
      </div>

      <section className="landing-info" id="about">
        <div>
          <div className="eyebrow">BUILT FOR THE MOMENTS THAT MATTER</div>
          <h2>
            Help is better when
            <br />
            we work together.
          </h2>
          <p>
            From the first report to the final response, RescueNet brings the
            right information to the right people.
          </p>
        </div>

        <div className="feature-grid" id="features">
          <article>
            <span><Siren /></span>
            <h3>Report with confidence</h3>
            <p>Share the details that matter through a simple emergency report.</p>
          </article>
          <article>
            <span><Activity /></span>
            <h3>See the bigger picture</h3>
            <p>Give coordinators a clear view of incidents and response activity.</p>
          </article>
          <article id="how">
            <span><Users /></span>
            <h3>Respond together</h3>
            <p>Keep response teams connected from assignment to resolution.</p>
          </article>
        </div>
      </section>

      <footer>
        <Brand />
        <span>© 2026 RescueNet AI · A demonstration project</span>
        <Link to="/login">
          Explore the platform <ArrowRight size={14} />
        </Link>
      </footer>
    </div>
  );
}


function Login() {
  const nav = useNavigate();

  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      if (register) {
        // Create Firebase account
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        // Create Firestore profile through FastAPI
        await api.post("/auth/register");
      } else {
        // Sign in using Firebase
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      // Retrieve the trusted role from the backend
      const response = await api.get("/auth/me");
      const role = response.data.role;

      if (!["citizen", "admin", "responder"].includes(role)) {
        throw new Error("Your account has an invalid role.");
      }

      nav("/" + role);
    } catch (error) {
      console.error("Authentication error:", error);

      const firebaseErrors = {
        "auth/email-already-in-use":
          "This email is already registered. Please sign in.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/weak-password":
          "Password must contain at least 6 characters.",
        "auth/invalid-credential":
          "Incorrect email or password.",
        "auth/user-not-found":
          "No account found. Please register first.",
        "auth/network-request-failed":
          "Network error. Please check your internet connection."
      };

      const code = error.code;

      setMsg(
        firebaseErrors[code] ||
        error.response?.data?.detail ||
        error.message ||
        "Authentication failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setMsg("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg("Password reset email sent. Check your inbox.");
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <div className="auth-page">
      <DemoBanner />

      <div className="auth-bg">
        <header className="auth-header">
          <Brand />
          <Link to="/">← Back to home</Link>
        </header>

        <div className="auth-card">
          <div className="auth-logo">
            <Brand />
          </div>

          <span className="auth-kicker">WELCOME TO RESCUENET</span>

          <h1>{register ? "Create your account" : "Welcome back"}</h1>

          <p>
            {register
              ? "Get started with the RescueNet demo."
              : "Sign in to your account to continue."}
          </p>

          <div className="notice">
            <AlertCircle size={16} />
            Firebase-secured demo authentication.
          </div>

          <form onSubmit={submit}>
            <label>Email address</label>

            <div className="input-icon">
              <span>@</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="label-row">
              <label>Password</label>

              {!register && (
                <button
                  type="button"
                  className="text-link"
                  onClick={forgotPassword}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="input-icon">
              <LockKeyhole size={16} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <p className="form-message">
              {register
                ? "New accounts are registered as Citizens."
                : "Your dashboard is determined by your assigned account role."}
            </p>

            {msg && <p className="form-message">{msg}</p>}

            <button
              type="submit"
              className="btn btn-red auth-submit"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : register
                  ? "Create account"
                  : "Sign in"}

              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            {register
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setRegister(!register);
                setMsg("");
              }}
            >
              {register ? "Sign in" : "Create account"}
            </button>
          </p>

          <p className="auth-foot">
            <ShieldCheck size={14} />
            Secure response starts with trusted information
          </p>
        </div>

        <div className="auth-caption">
          <span>HERE WHEN IT MATTERS</span>
          <h2>
            Better information.
            <br />
            Better outcomes.
          </h2>
          <p>Every moment counts. Let's make them matter.</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ role }) {
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);
  const [loggingOut, setLoggingOut] = useState(false);

  const dashboardPath =
    role === "admin" ? "/admin" :
    role === "responder" ? "/responder" : "/citizen";

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to sign out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <aside className="sidebar">
      <Brand />

      <p className="side-label">MAIN MENU</p>

      <div className="side-links">
        <NavLink
          to={dashboardPath}
          className={({ isActive }) =>
            "side-link" + (isActive ? " selected" : "")
          }
        >
          <Home size={17} />
          Dashboard
        </NavLink>
      </div>

      <div className="side-tools">
        <p className="side-label">SYSTEM</p>

        <div className="side-help">
          <LifeBuoy size={19} />
          <div>
            <b>RescueNet AI</b>
            <small>Demonstration mode</small>
          </div>
        </div>
      </div>

      <div className="side-bottom">
        <div className="profile">
          <div className="avatar">
            {role === "admin" ? "AD" : role === "responder" ? "RA" : "CT"}
          </div>

          <div>
            <b>{role.charAt(0).toUpperCase() + role.slice(1)}</b>
            <small>{profile?.email || "Authenticated user"}</small>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            aria-label="Sign out"
            style={{
              marginLeft: "auto",
              border: 0,
              background: "transparent",
              cursor: loggingOut ? "wait" : "pointer",
              color: "#9ba5b6",
              padding: "5px",
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ role }) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <Brand />
      </div>
      <div className="breadcrumb">
        Workspace <ChevronRight size={14} />{" "}
        <b>{role === "admin" ? "Overview" : "Responder dashboard"}</b>
      </div>
      <div className="top-right">
        <span className="online">
          <i /> Demo system online
        </span>
        <Link to="/citizen" className="top-report">
          <Plus size={16} /> New report
        </Link>
        <Bell size={19} />
        <div className="avatar small">{role === "admin" ? "AD" : "RA"}</div>
      </div>
    </header>
  );
}
function useIncidents() {
  const [data, setData] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [lastUpdated, setLastUpdated] = useState(null),
    [refreshing, setRefreshing] = useState(false);
  const sequence = useRef(0),
    mounted = useRef(true);
  async function load() {
    const request = ++sequence.current;
    if (mounted.current) setRefreshing(true);
    try {
      const r = await api.get("/incidents");
      if (mounted.current && request === sequence.current) {
        setData(r.data);
        setError("");
        setLastUpdated(new Date());
      }
    } catch {
      if (mounted.current && request === sequence.current)
        setError(
          "Could not connect to the demo API. Showing the last successful data, if available.",
        );
    } finally {
      if (mounted.current && request === sequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }
  useEffect(() => {
    mounted.current = true;
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  async function update(id, body) {
    try {
      await api.patch("/incidents/" + id, body);
      await load();
    } catch {
      setError("Update failed. Please try again.");
    }
  }
  return { data, error, loading, load, update, lastUpdated, refreshing };
}
function Shell({ role, children }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <div className="main-wrap">
        <Topbar role={role} />
        <DemoBanner />
        <main className="dashboard">{children}</main>
      </div>
    </div>
  );
}
function Metric({ icon: I, color, label, value, note }) {
  return (
    <div className="metric">
      <div className={"metric-icon " + color}>
        <I size={23} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <ArrowDownRight className="metric-arrow" size={17} />
    </div>
  );
}
function Status({ value }) {
  return (
    <span className={"status " + value.toLowerCase().replaceAll(" ", "-")}>
      {value}
    </span>
  );
}
function FitMap({ incidents, fitSignal }) {
  const map = useMap(),
    firstFit = useRef(false);
  const points = incidents
    .filter((i) => Number.isFinite(i.lat) && Number.isFinite(i.lng))
    .map((i) => [i.lat, i.lng]);
  useEffect(() => {
    if (points.length && (!firstFit.current || fitSignal > 0)) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
      firstFit.current = true;
    }
  }, [fitSignal, points.length]);
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}
function LiveMap({ incidents }) {
  const [filter, setFilter] = useState("all"),
    [fitSignal, setFitSignal] = useState(0),
    [tileError, setTileError] = useState(false);
  const valid = incidents.filter(
    (i) => Number.isFinite(i.lat) && Number.isFinite(i.lng),
  );
  const visible = valid.filter(
    (i) =>
      filter === "all" ||
      (filter === "active" ? i.status !== "Resolved" : i.status === "Resolved"),
  );
  return (
    <>
      <div className="map-controls">
        <div className="map-filters" aria-label="Filter map incidents">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["resolved", "Resolved"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={filter === value ? "map-filter active" : "map-filter"}
              onClick={() => {
                setFilter(value);
                setFitSignal((v) => v + 1);
              }}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="map-fit"
          disabled={!visible.length}
          onClick={() => setFitSignal((v) => v + 1)}
        >
          <LocateFixed size={14} /> Fit markers
        </button>
      </div>
      <div className="map-container">
        <MapContainer
          center={[17.44, 78.39]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTileError(true) }}
          />
          <FitMap incidents={visible} fitSignal={fitSignal} />
          {visible.map((i) => (
            <CircleMarker
              key={i.id}
              center={[i.lat, i.lng]}
              radius={9}
              pathOptions={{
                color: "white",
                weight: 3,
                fillColor: i.status === "Resolved" ? "#22a86a" : "#ed233e",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <b>{i.category}</b>
                <br />
                Incident #{String(i.id).padStart(4, "0")} · Simulated
                <br />
                {i.location}
                <br />
                Status: {i.status}
                <br />
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.openstreetmap.org/?mlat=${i.lat}&mlon=${i.lng}#map=16/${i.lat}/${i.lng}`}
                >
                  Open in OpenStreetMap ↗
                </a>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        <div className="map-tag">
          <span className="dot-red" /> {visible.length} simulated location
          {visible.length === 1 ? "" : "s"}
        </div>
      </div>
      {tileError && (
        <div className="map-warning">
          Map tiles could not be loaded. Check your internet connection or tile
          provider availability.
        </div>
      )}
      <div className="map-hint">
        {incidents.length - valid.length} report
        {incidents.length - valid.length === 1 ? "" : "s"} without shared
        coordinates not shown. Manual addresses are not geocoded.
      </div>
    </>
  );
}



function Admin() {
  const {
    data,
    error,
    loading,
    update,
    load,
    lastUpdated,
    refreshing,
  } = useIncidents();

  const { user, profile } = useContext(AuthContext);

  const active = data.filter(
    (i) => i.status !== "Resolved"
  ).length;

  const assignedCount = data.filter(
    (i) => i.assigned_to || i.assigned_responder_uid
  ).length;

  async function handleAssignment(incidentId, team) {
    await update(incidentId, {
      assigned_to: team || null,
      assigned_responder_uid: null,
    });
  }

  return (
    <Shell role="admin">

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            COMMAND CENTER <span> / OVERVIEW</span>
          </div>

          <h1>
            Welcome back, Administrator <span>👋</span>
          </h1>

          <p>
            {profile?.email || user?.email || "Administrator"}
            {" · "}
            Here’s what’s happening across your emergency operations.
          </p>
        </div>

        <div className="heading-actions">
          <span className="date-pill">
            <Clock3 size={16} /> Demo workspace
          </span>

          <a href="#incidents" className="btn btn-red">
            <Plus size={17} /> View incidents
          </a>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error">{error}</div>}

      {/* Dashboard Metrics */}
      <div className="metrics" id="analytics">

        <Metric
          icon={Siren}
          color="red"
          label="Total incidents"
          value={
            loading ? "—" : data.length.toString().padStart(2, "0")
          }
          note="All simulated reports"
        />

        <Metric
          icon={AlertTriangle}
          color="orange"
          label="Active incidents"
          value={
            loading ? "—" : active.toString().padStart(2, "0")
          }
          note="Needs attention"
        />

        <Metric
          icon={Ambulance}
          color="green"
          label="Assigned incidents"
          value={
            loading
              ? "—"
              : assignedCount.toString().padStart(2, "0")
          }
          note="Across demo teams and responders"
        />

        <Metric
          icon={CheckCircle2}
          color="purple"
          label="Resolved incidents"
          value={
            loading
              ? "—"
              : data
                  .filter((i) => i.status === "Resolved")
                  .length.toString()
                  .padStart(2, "0")
          }
          note="Completed responses"
        />

      </div>

      {/* Map and Recent Activity */}
      <div className="overview-grid">

        {/* Live Emergency Map */}
        <section className="panel map-panel" id="map">

          <div className="panel-title">
            <div>
              <h2>
                Live emergency map <span className="live-dot" />
              </h2>

              <p>
                {error
                  ? "Connection lost · showing last data"
                  : lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString()} · refreshes every 10 sec`
                    : "Connecting to demo API…"}
              </p>
            </div>

            <button
              className="map-refresh"
              type="button"
              onClick={load}
              disabled={refreshing}
              aria-label="Refresh incidents"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "spinning" : ""}
              />
              Refresh
            </button>
          </div>

          <LiveMap incidents={data} />

          <div className="map-legend">
            <span>
              <i className="legend-red" /> Active incident
            </span>

            <span>
              <i className="legend-green" /> Resolved
            </span>

            <span>Map data © OpenStreetMap</span>
          </div>

        </section>

        {/* Recent Activity */}
        <section className="panel activity-panel">

          <div className="panel-title">
            <div>
              <h2>Recent activity</h2>
              <p>Latest updates across the network</p>
            </div>

            <Activity size={19} />
          </div>

          <div className="activity-list">

            {data.slice(0, 4).map((i, n) => (
              <div className="activity-item" key={i.id}>

                <div
                  className={
                    "activity-symbol " +
                    (n % 2 ? "blue" : "red")
                  }
                >
                  <Siren size={15} />
                </div>

                <div>
                  <b>{i.category} reported</b>

                  <p>{i.location}</p>

                  <small>
                    #{String(i.id).padStart(4, "0")} · {i.status}
                  </small>
                </div>

                <span>Demo</span>

              </div>
            ))}

            {!loading && data.length === 0 && (
              <p className="empty-state">
                No incidents have been reported yet.
              </p>
            )}

          </div>

          <a href="#incidents" className="panel-link">
            View all incidents <ArrowRight size={15} />
          </a>

        </section>

      </div>

      {/* Incident Management */}
      <section className="panel incident-panel" id="incidents">

        <div className="panel-title">
          <div>
            <h2>Recent incidents</h2>
            <p>Monitor and coordinate incoming reports</p>
          </div>

          <span className="soft-pill">
            {data.length} reports
          </span>
        </div>

        <div className="table-wrap">

          <table>
            <thead>
              <tr>
                <th>INCIDENT</th>
                <th>LOCATION</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th>ASSIGNED TO</th>
              </tr>
            </thead>

            <tbody>

              {data.map((i) => (
                <tr key={i.id}>

                  <td>
                    <b>{i.category}</b>
                    <small>
                      #{String(i.id).padStart(4, "0")} · Simulated
                    </small>
                  </td>

                  <td>
                    <MapPin size={14} /> {i.location}
                  </td>

                  <td>
                    <Status value={i.severity} />
                  </td>

                  <td>
                    <Status value={i.status} />
                  </td>

                  <td>
                    <select
                      aria-label={"Assign incident " + i.id}
                      value={i.assigned_to || ""}
                      onChange={(e) =>
                        handleAssignment(i.id, e.target.value)
                      }
                    >
                      <option value="">Unassigned</option>
                      <option value="Team Alpha">Team Alpha</option>
                      <option value="Team Bravo">Team Bravo</option>
                    </select>
                  </td>

                </tr>
              ))}

              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan="5">
                    No incidents available.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>

      </section>

      {/* Demo Notice */}
      <div id="teams" className="bottom-note">
        <ShieldCheck size={15} />
        Demo data is simulated and is not monitored by emergency services.
      </div>

    </Shell>
  );
}


function Citizen() {
  const nav = useNavigate();

  // Get authenticated user and profile
  const { user, profile } = useContext(AuthContext);

  // Citizen report form states
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  // Firebase logout
  async function handleLogout() {
    try {
      await signOut(auth);
      nav("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to sign out. Please try again.");
    }
  }

  // Get citizen location
  function locate() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    setMessage("Getting your location…");

    navigator.geolocation.getCurrentPosition(
      (p) => {
        let lat = p.coords.latitude;
        let lng = p.coords.longitude;

        setCoords({ lat, lng });
        setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setMessage("Location added. You can edit the location description.");
      },
      () =>
        setMessage(
          "Location unavailable or permission denied. Please enter it manually."
        )
    );
  }

  // Submit emergency report
  async function submit(e) {
    e.preventDefault();

    if (!category) {
      setMessage("Please select an emergency category.");
      return;
    }

    setBusy(true);

    try {
      let r = await api.post("/incidents", {
        category,
        description,
        location,
        ...(coords || {}),
      });

      setSubmitted(r.data);
      setMessage("");
    } catch (error) {
      console.error("Incident submission failed:", error);

      setMessage(
        "Could not submit the demo report. Check that the API is running."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="citizen-page">

      {/* Citizen Header */}
      <header className="citizen-header">
        <Brand />

        <div className="citizen-header-actions">
          <span className="citizen-badge">
            <span /> CITIZEN PORTAL
          </span>

          <div className="citizen-account">
            <b>{profile?.email || user?.email || "Citizen"}</b>
            <small>{profile?.role || "citizen"}</small>
          </div>

          <button
            type="button"
            className="citizen-signout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <DemoBanner />

      <div className="citizen-body">

        {/* Introduction */}
        <div className="citizen-intro">
          <div className="eyebrow">WE’RE HERE TO HELP</div>

          <h1>
            Let’s get you the <em>help you need.</em>
          </h1>

          <p>
            Tell us what’s happening so the right people can respond.
          </p>

          <div className="emergency-warning">
            <AlertCircle size={18} />
            <span>
              <b>In immediate danger?</b> This is a demo, not an emergency
              service. Call your local emergency number.
            </span>
          </div>
        </div>

        {/* Submission Success */}
        {submitted ? (
          <div className="form-card success-card">
            <div className="success-icon">
              <CheckCircle2 size={35} />
            </div>

            <h2>Demo report submitted</h2>

            <p>
              Your simulated incident{" "}
              <b>#{String(submitted.id).padStart(4, "0")}</b> has been saved
              with status <b>{submitted.status}</b>. It is not being monitored
              by emergency services.
            </p>

            <div className="success-actions">
              <button
                className="btn btn-red"
                onClick={() => {
                  setSubmitted(null);
                  setDescription("");
                  setLocation("");
                  setCategory("");
                  setCoords(null);
                  setFile(null);
                }}
              >
                Create another report
              </button>

              <Link className="btn btn-light" to="/admin">
                View in dashboard
              </Link>
            </div>
          </div>
        ) : (

          /* Emergency Report Form */
          <form className="form-card" onSubmit={submit}>

            <div className="form-section-title">
              <span>01</span>
              <div>
                <h2>What’s the emergency?</h2>
                <p>
                  Select the category that best describes the situation.
                </p>
              </div>
            </div>

            <div className="categories">
              {categories.map(([name, I, color]) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setCategory(name)}
                  className={
                    "category " + (category === name ? "chosen" : "")
                  }
                >
                  <span className={"category-icon " + color}>
                    <I size={23} />
                  </span>

                  <b>{name}</b>

                  {category === name && (
                    <CheckCircle2
                      className="category-check"
                      size={16}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="form-separator" />

            <div className="form-section-title">
              <span>02</span>
              <div>
                <h2>Tell us more</h2>
                <p>
                  Provide a few details to help us understand the situation.
                </p>
              </div>
            </div>

            <label>
              Emergency details <span>*</span>
            </label>

            <textarea
              required
              minLength="10"
              maxLength="2000"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened and if anyone needs immediate help..."
            />

            <div className="field-meta">
              Please include any details that may help responders.{" "}
              <span>{description.length}/2000</span>
            </div>

            <label>
              Location <span>*</span>
            </label>

            <div className="location-row">
              <div className="input-icon">
                <MapPin size={17} />

                <input
                  required
                  minLength="3"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setCoords(null);
                  }}
                  placeholder="Enter an address or landmark"
                />
              </div>

              <button
                type="button"
                onClick={locate}
                className="btn btn-light"
              >
                <LocateFixed size={17} /> Use my location
              </button>
            </div>

            <label>
              Photo <small>OPTIONAL · DEMO PREVIEW ONLY</small>
            </label>

            <label className="upload">
              <Camera size={19} />

              <span>
                {file ? file.name : "Choose a photo to preview"}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </label>

            <p className="upload-note">
              Photos are not uploaded or saved in this initial demo.
            </p>

            {message && (
              <div className="form-message">{message}</div>
            )}

            <button
              className="btn btn-red submit-report"
              disabled={busy}
              type="submit"
            >
              <Send size={18} />

              {busy
                ? "Submitting…"
                : "Submit demo emergency report"}

              <ArrowRight size={17} />
            </button>

            <div className="privacy">
              <ShieldCheck size={15} /> This demonstration does not contact
              emergency responders.
            </div>

          </form>
        )}

        <div className="citizen-footer">
          <span>© 2026 RescueNet AI</span>
          <Link to="/">Back to home</Link>
        </div>

      </div>
    </div>
  );
}



function Responder() {
  const {
    data,
    error,
    loading,
    update,
    load,
    refreshing,
  } = useIncidents();

  const { user, profile } = useContext(AuthContext);

  const [selected, setSelected] = useState(null);

  // Demo assignment: Team Alpha
  const assigned = data.filter(
    (i) => i.assigned_to === "Team Alpha"
  );

  const active = assigned.filter(
    (i) => i.status !== "Resolved"
  );

  const chosen =
    assigned.find((i) => i.id === selected) || active[0] || assigned[0];

  const completed = assigned.filter(
    (i) => i.status === "Resolved"
  );

  const inProgress = assigned.filter(
    (i) => ["In progress", "Arrived"].includes(i.status)
  );

  async function changeStatus(id, status) {
    await update(id, { status });
  }

  return (
    <Shell role="responder">

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            RESPONSE WORKSPACE <span> / OVERVIEW</span>
          </div>

          <h1>
            Welcome back, Responder <span>👋</span>
          </h1>

          <p>
            {profile?.email || user?.email || "Authenticated responder"}
            {" · "}
            Stay informed, stay ready, and make every second count.
          </p>
        </div>

        <div className="heading-actions">
          <span className="online large">
            <i /> Responder online · Demo
          </span>

          <button
            className="map-refresh"
            type="button"
            onClick={load}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "spinning" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Metrics */}
      <div className="responder-metrics">

        <Metric
          icon={ClipboardList}
          color="blue"
          label="Assigned to you"
          value={
            loading
              ? "—"
              : assigned.length.toString().padStart(2, "0")
          }
          note="Team Alpha"
        />

        <Metric
          icon={Navigation}
          color="green"
          label="In progress"
          value={
            loading
              ? "—"
              : inProgress.length.toString().padStart(2, "0")
          }
          note="Active responses"
        />

        <Metric
          icon={ShieldCheck}
          color="purple"
          label="Resolved"
          value={
            loading
              ? "—"
              : completed.length.toString().padStart(2, "0")
          }
          note="Completed incidents"
        />

      </div>

      {/* Assignments and Timeline */}
      <div className="response-grid">

        {/* Assigned Emergencies */}
        <section className="panel assignments" id="assignments">

          <div className="panel-title">
            <div>
              <h2>Assigned emergencies</h2>
              <p>Incidents currently assigned to Team Alpha</p>
            </div>

            <span className="soft-pill">
              {active.length} active
            </span>
          </div>

          {loading ? (
            <div className="empty">
              Loading assigned incidents...
            </div>
          ) : active.length === 0 ? (
            <div className="empty">
              No active assignments. New Team Alpha assignments will appear here.
            </div>
          ) : (
            active.map((i) => (
              <article
                className={
                  "assignment " +
                  (chosen?.id === i.id ? "assignment-selected" : "")
                }
                key={i.id}
              >

                <div className="assignment-icon">
                  <Ambulance size={27} />
                </div>

                <div className="assignment-content">

                  <div className="assignment-top">
                    <Status value={i.severity} />

                    <span>
                      #{String(i.id).padStart(4, "0")} · Simulated
                    </span>
                  </div>

                  <h3>{i.category}</h3>

                  <p>
                    <MapPin size={15} /> {i.location}
                  </p>

                  <p className="assignment-desc">
                    {i.description}
                  </p>

                  <div className="assignment-actions">

                    {i.status === "Assigned" && (
                      <button
                        className="btn btn-red"
                        type="button"
                        onClick={() =>
                          changeStatus(i.id, "In progress")
                        }
                      >
                        Accept assignment
                      </button>
                    )}

                    {i.status === "In progress" && (
                      <button
                        className="btn btn-red"
                        type="button"
                        onClick={() =>
                          changeStatus(i.id, "Arrived")
                        }
                      >
                        Mark arrived
                      </button>
                    )}

                    {i.status === "Arrived" && (
                      <button
                        className="btn btn-red"
                        type="button"
                        onClick={() =>
                          changeStatus(i.id, "Resolved")
                        }
                      >
                        Mark resolved
                      </button>
                    )}

                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => setSelected(i.id)}
                    >
                      View details
                    </button>

                  </div>
                </div>
              </article>
            ))
          )}

        </section>

        {/* Response Timeline */}
        <section className="panel timeline" id="timeline">

          <div className="panel-title">
            <div>
              <h2>Response timeline</h2>

              <p>
                {chosen
                  ? `Incident #${String(chosen.id).padStart(4, "0")}`
                  : "Select an assignment"}
              </p>
            </div>

            <Clock3 size={19} />
          </div>

          {chosen ? (
            <>

              <div className="timeline-location">
                <MapPin size={17} />

                <div>
                  <b>{chosen.category}</b>
                  <small>{chosen.location}</small>
                </div>
              </div>

              {Number.isFinite(chosen.lat) &&
              Number.isFinite(chosen.lng) ? (
                <div className="responder-map">
                  <LiveMap
                    key={chosen.id}
                    incidents={[chosen]}
                  />
                </div>
              ) : (
                <p className="map-hint">
                  No coordinates shared for this incident. Use the written
                  location above.
                </p>
              )}

              <div className="timeline-steps">

                {[
                  "Assigned",
                  "In progress",
                  "Arrived",
                  "Resolved",
                ].map((s, n) => {

                  const idx = [
                    "Assigned",
                    "In progress",
                    "Arrived",
                    "Resolved",
                  ].indexOf(chosen.status);

                  const done = n <= idx;

                  return (
                    <div
                      className={
                        "timeline-step " + (done ? "done" : "")
                      }
                      key={s}
                    >

                      <span>
                        {done ? <Check size={12} /> : n + 1}
                      </span>

                      <div>
                        <b>
                          {s === "In progress" ? "En route" : s}
                        </b>

                        <small>
                          {n === idx
                            ? "Current status"
                            : done
                              ? "Completed"
                              : "Pending"}
                        </small>
                      </div>

                    </div>
                  );
                })}

              </div>

            </>
          ) : (
            <div className="empty">
              No incident selected.
            </div>
          )}

        </section>

      </div>

      {/* Response History */}
      <section className="panel history" id="history">

        <div className="panel-title">
          <div>
            <h2>Response history</h2>
            <p>Your completed demo responses</p>
          </div>

          <CheckCircle2 size={19} />
        </div>

        {loading ? (
          <div className="empty">
            Loading response history...
          </div>
        ) : completed.length === 0 ? (
          <div className="empty">
            No completed responses yet.
          </div>
        ) : (
          completed.map((i) => (
            <div className="history-row" key={i.id}>

              <div className="history-icon">
                <Check size={17} />
              </div>

              <div>
                <b>{i.category}</b>

                <small>
                  #{String(i.id).padStart(4, "0")} · {i.location}
                </small>
              </div>

              <Status value="Resolved" />

            </div>
          ))
        )}

      </section>

      {/* Demo Notice */}
      <div className="bottom-note">
        <ShieldCheck size={15} />
        This is a simulated workspace. No real emergency services are connected.
      </div>

    </Shell>
  );
}


const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const token = await firebaseUser.getIdToken();

        const response = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(firebaseUser);
        setProfile(response.data);
      } catch (error) {
        console.error("Session verification failed:", error);
        setUser(null);
        setProfile(null);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const { user, profile, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="auth-page">Checking your session...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return children;
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={["citizen"]}>
                <Citizen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/responder"
            element={
              <ProtectedRoute allowedRoles={["responder"]}>
                <Responder />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")).render(<App />);
