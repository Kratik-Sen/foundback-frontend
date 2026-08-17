import {
  Activity,
  ClipboardCheck,
  FileSearch,
  Handshake,
  PackageCheck,
  PackageOpen,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { ErrorState, Spinner } from "../components/States";
import { useAuth } from "../context/AuthContext";
import { formatDate, titleCase } from "../utils/format";

const chartTooltipProps = {
  contentStyle: {
    backgroundColor: "#000000",
    border: "1px solid #27272a",
    borderRadius: "12px",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
  },
  labelStyle: { color: "#f8fafc", fontWeight: 800 },
  itemStyle: { color: "#e2e8f0" },
  cursor: { fill: "rgba(255, 255, 255, 0.06)" },
};

function StatCard({ label, value, Icon, tone = "indigo", note }) {
  const colors = {
    indigo: "bg-brand-50 text-brand-600 dark:bg-brand-500/10",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {value ?? "—"}
          </p>
          {note && <p className="mt-1 text-[.68rem] text-slate-400">{note}</p>}
        </div>
        <span
          className={`grid size-10 place-items-center rounded-xl ${colors[tone]}`}
        >
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

function StudentDashboard({ data }) {
  const stats = data.stats || {};
  return (
    <>
      <PageHeader
        eyebrow="Student workspace"
        title="Your FoundBack overview"
        description="Track reports, matches, claims, and recoveries from one place."
        actions={
          <>
            <Link className="btn-secondary" to="/report/found">
              Report found
            </Link>
            <Link className="btn-primary" to="/report/lost">
              Report lost
            </Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Lost reports" value={stats.lost} Icon={FileSearch} />
        <StatCard
          label="Found reports"
          value={stats.found}
          Icon={PackageOpen}
          tone="sky"
        />
        <StatCard
          label="Active listings"
          value={stats.active}
          Icon={Activity}
          tone="emerald"
        />
        <StatCard
          label="Possible matches"
          value={stats.possibleMatches}
          Icon={Sparkles}
          tone="violet"
        />
        <StatCard
          label="Pending claims"
          value={stats.pendingClaims}
          Icon={ClipboardCheck}
          tone="amber"
        />
        <StatCard
          label="Recovered"
          value={stats.recovered}
          Icon={PackageCheck}
          tone="emerald"
        />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-950 dark:text-white">
              Recent activity
            </h2>
            <Link
              to="/my-listings"
              className="text-xs font-bold text-brand-600"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentActivity?.length ? (
              data.recentActivity.map((item) => (
                <Link
                  to={`/items/${item._id}`}
                  key={item._id}
                  className="flex items-center gap-4 py-3"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${item.reportType === "lost" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                  >
                    <PackageOpen size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {titleCase(item.reportType)} ·{" "}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                Your reports will appear here.
              </p>
            )}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Recovery progress
          </h2>
          <div className="mt-6 flex items-center justify-center">
            <div
              className="relative grid size-36 place-items-center rounded-full bg-[conic-gradient(#4f46e5_var(--progress),#e8ecf3_0)]"
              style={{ "--progress": `${stats.recoveryRate || 0}%` }}
            >
              <div className="grid size-28 place-items-center rounded-full bg-white text-center dark:bg-slate-900">
                <div>
                  <p className="text-3xl font-black text-slate-950 dark:text-white">
                    {stats.recoveryRate || 0}%
                  </p>
                  <p className="text-[.65rem] text-slate-400">recovery rate</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/matches"
              className="rounded-xl bg-brand-50 p-3 text-center text-xs font-bold text-brand-700 dark:bg-brand-500/10"
            >
              Check matches
            </Link>
            <Link
              to="/saved"
              className="rounded-xl bg-slate-100 p-3 text-center text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Saved ({stats.saved || 0})
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function AdminDashboard({ data }) {
  const s = data.stats || {};
  const charts = data.charts || {};
  const cards = [
    ["Total users", s.totalUsers, UsersRound, "indigo"],
    ["Active students", s.activeStudents, Activity, "emerald"],
    ["Lost reports", s.lost, FileSearch, "rose"],
    ["Found reports", s.found, PackageOpen, "sky"],
    ["Pending claims", s.pendingClaims, Handshake, "violet"],
    ["Returned items", s.returned, PackageCheck, "emerald"],
    ["Open complaints", s.reported, ShieldCheck, "rose"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Campus recovery command centre"
        description="Monitor community activity, review risks, and understand recovery performance."
        actions={
          <Link className="btn-primary" to="/admin/reports">
            Export reports
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon, tone]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            Icon={Icon}
            tone={tone}
          />
        ))}
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-950 dark:text-white">
              Lost & found reports by month
            </h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.reportsByMonth || []}>
                <defs>
                  <linearGradient id="lost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="found" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip {...chartTooltipProps} />
                <Area
                  type="monotone"
                  dataKey="lost"
                  stroke="#f43f5e"
                  fill="url(#lost)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="found"
                  stroke="#4f46e5"
                  fill="url(#found)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Recovery rate
          </h2>
          <div className="mt-5 grid h-52 place-items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Returned", value: s.returned || 0 },
                    {
                      name: "Open",
                      value: Math.max(
                        (s.lost || 0) + (s.found || 0) - (s.returned || 0),
                        0,
                      ),
                    },
                  ]}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={76}
                  paddingAngle={4}
                >
                  {["#10b981", "#e2e8f0"].map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute text-center">
              <p className="text-3xl font-black">{s.recoveryRate || 0}%</p>
              <p className="text-xs text-slate-400">returned</p>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Most reported categories
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <BarChart data={charts.categories || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="_id"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip {...chartTooltipProps} />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Common locations
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <BarChart data={charts.locations || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-18}
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip {...chartTooltipProps} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}

function StaffDashboard({ data }) {
  const s = data.stats || {};
  return (
    <>
      <PageHeader
        eyebrow="Security & staff"
        title="Handover and verification desk"
        description="Review campus-held items and keep claim handovers accountable."
        actions={
          <Link to="/report/found" className="btn-primary">
            Add security-office item
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Items at security"
          value={s.securityItems}
          Icon={ShieldCheck}
          tone="emerald"
        />
        <StatCard
          label="Claims to verify"
          value={s.pendingClaims}
          Icon={ClipboardCheck}
          tone="amber"
        />
        <StatCard
          label="Scheduled handovers"
          value={s.handovers}
          Icon={Handshake}
          tone="violet"
        />
      </div>
      <section className="card mt-7 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-950 dark:text-white">
            Recent security-office items
          </h2>
          <Link
            to="/staff/security-items"
            className="text-xs font-bold text-brand-600"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {data.recent?.map((item) => (
            <Link
              key={item._id}
              to={`/items/${item._id}`}
              className="flex items-center gap-3 py-4"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <SearchCheck size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{item.title}</p>
                <p className="text-xs text-slate-400">
                  {item.location} · {item.reporter?.name}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function DashboardPage({ forceRole }) {
  const { user } = useAuth();
  const role = forceRole || user.role;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    api
      .get(`/dashboard/${role}`)
      .then(({ data: result }) => setData(result))
      .catch((err) => setError(err.message));
  };
  useEffect(load, [role]);
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Spinner label={`Loading ${role} dashboard`} />;
  return role === "admin" ? (
    <AdminDashboard data={data} />
  ) : role === "staff" ? (
    <StaffDashboard data={data} />
  ) : (
    <StudentDashboard data={data} />
  );
}
