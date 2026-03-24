import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarChart3, ChevronLeft, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCurrentRestaurant, getLocationPaidOrders } from "../../utils/api";
import { LoadingScreen } from "../../components/ManagerPageComponents";
import { LocationStatusView, ManagerHeader } from "../../components/ManagerPageComponents/LocationDashboard";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const STATUS_PAGE_TABS = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "calendar", label: "Calendar", icon: Calendar },
];

const POLL_INTERVAL_MS = 10000;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Local calendar date YYYY-MM-DD (avoids UTC shift from toISOString) */
const dayKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

function formatDayLabel(dateStr) {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function getTopSellingItemsFromRows(rows, limit = 5) {
    const itemTotals = new Map();
    rows.forEach((row) => {
        (row.orders || []).forEach((order) => {
            (order.items || []).forEach((item) => {
                const key = item.name || "Unknown Item";
                const qty = Number(item.quantity) || 0;
                itemTotals.set(key, (itemTotals.get(key) || 0) + qty);
            });
        });
    });

    return Array.from(itemTotals.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function getCalendarCells(year, month) {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = startDay - 1; i >= 0; i--) cells.push({ d: prevDays - i, cur: false, offset: -1 });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i, cur: true, offset: 0 });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - startDay - daysInMonth + 1, cur: false, offset: 1 });
    return cells;
}

const StatCard = ({ label, value, color }) => (
    <div className="bg-muted/40 rounded-xl p-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={`text-2xl font-semibold ${color || "text-foreground"}`}>{value}</div>
    </div>
);

const WeeklyChart = ({ paidTablesByDate }) => {
    const days = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, idx) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - idx));
            const key = dayKey(d);
            const rows = paidTablesByDate[key] || [];
            const orders = rows.reduce((sum, row) => sum + (row.orders?.length || 0), 0);
            const revenue = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
            return {
                label: d.toLocaleDateString("en-US", { weekday: "short" }),
                orders,
                revenue,
            };
        });
    }, [paidTablesByDate]);

    const data = {
        labels: days.map((d) => d.label),
        datasets: [
            { label: "Orders", data: days.map((d) => d.orders), backgroundColor: "#639922", borderRadius: 4 },
            { label: "Revenue (x100)", data: days.map((d) => Math.round(d.revenue / 100)), backgroundColor: "#3B82F6", borderRadius: 4 },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
        scales: {
            x: { stacked: false, grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 11 } } },
            y: { stacked: false, grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 11 }, maxTicksLimit: 5 } },
        },
    };
    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Weekly orders</span>
                <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#639922]" />Orders</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" />Revenue</span>
                </div>
            </div>
            <div className="h-44">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

const CalendarView = ({ paidTablesByDate, year, month, onPrevMonth, onNextMonth, selectedDayKey, onDaySelect }) => {
    const today = new Date();

    const cells = getCalendarCells(year, month);

    const handleDay = (cell) => {
        if (!cell.cur) return;
        const d = new Date(year, month, cell.d);
        const dateStr = dayKey(d);
        // Toggle day selection: clicking the same date clears it and returns to month totals.
        if (selectedDayKey && dateStr === selectedDayKey) onDaySelect?.(null);
        else onDaySelect?.(dateStr);
    };

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <button type="button" onClick={onPrevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</span>
                    <button type="button" onClick={onNextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                </div>

                <div className="grid grid-cols-7">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2 border-b border-border">
                            {d}
                        </div>
                    ))}
                    {cells.map((cell, i) => {
                        const d = new Date(year, cell.cur ? month : month + cell.offset, cell.d);
                        const dateStr = dayKey(d);
                        const orders = cell.cur ? (paidTablesByDate[dateStr] || []) : [];
                        const isToday = d.toDateString() === today.toDateString();
                        const isSelectedDay = cell.cur && selectedDayKey && dateStr === selectedDayKey;
                        const hasOrders = orders.length > 0;
                        const totalRevenue = orders.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
                        return (
                            <div
                                key={i}
                                onClick={() => handleDay(cell)}
                                className={[
                                    "border-b border-r border-border p-2 min-h-[80px] transition-colors",
                                    cell.cur ? "cursor-pointer hover:bg-muted/50" : "opacity-40",
                                    isToday ? "bg-primary/5 border-t-2 border-t-primary" : "",
                                    isSelectedDay ? "ring-2 ring-primary ring-inset bg-primary/10" : "",
                                    i % 7 === 0 ? "border-l-0" : "",
                                ].join(" ")}
                            >
                                <span className={`text-xs font-medium ${isToday ? "text-primary" : cell.cur ? "text-foreground" : "text-muted-foreground"}`}>
                                    {cell.d}
                                </span>
                                {cell.cur && hasOrders && (
                                    <div className="mt-1.5 space-y-0.5">
                                        <div className="flex gap-0.5 flex-wrap">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-none">
                                            {orders.length} paid
                                        </p>
                                        <p className="text-[10px] text-muted-foreground leading-none">
                                            {inrFormatter.format(totalRevenue)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
    );
};

const LocationStatusPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [paidTables, setPaidTables] = useState([]);
    const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
    const [selectedDayKey, setSelectedDayKey] = useState(null);

    useEffect(() => {
        setSelectedDayKey(null);
    }, [calendarYear, calendarMonth]);

    const handlePrevMonth = () => {
        setCalendarMonth((m) => {
            if (m === 0) {
                setCalendarYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const handleNextMonth = () => {
        setCalendarMonth((m) => {
            if (m === 11) {
                setCalendarYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCurrentRestaurant();
                const data = res.data?.success !== false ? (res.data?.data || res.data) : null;
                if (data && Array.isArray(data.locations)) {
                    setRestaurant(data);
                    const loc = data.locations.find(
                        (l) => String(l._id ?? l.id ?? "") === String(locationId ?? "")
                    );
                    if (loc) {
                        setLocation(loc);
                    } else {
                        toast.error("Location not found");
                        navigate("/restaurant/welcome");
                    }
                } else {
                    toast.error("Could not load location");
                    navigate("/restaurant/welcome");
                }
            } catch (error) {
                console.error("Failed to load location status page", error);
                toast.error("Failed to load location status");
                navigate("/restaurant/welcome");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [locationId, navigate]);

    useEffect(() => {
        const fetchPaidOrders = async () => {
            if (!locationId) return;
            try {
                const res = await getLocationPaidOrders(locationId);
                if (res.data?.success) {
                    setPaidTables(res.data.data?.tables || []);
                }
            } catch (error) {
                console.error("Failed to fetch paid orders for status page", error);
            }
        };

        fetchPaidOrders();
        const timer = setInterval(fetchPaidOrders, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [locationId]);

    const paidTablesByDate = useMemo(() => {
        return paidTables.reduce((acc, row) => {
            const paidDate = row?.paidAt ? dayKey(new Date(row.paidAt)) : null;
            if (!paidDate) return acc;
            if (!acc[paidDate]) acc[paidDate] = [];
            acc[paidDate].push(row);
            return acc;
        }, {});
    }, [paidTables]);

    const dashboardStats = useMemo(() => {
        const totalOrders = paidTables.reduce((sum, row) => sum + (row.orders?.length || 0), 0);
        const revenue = paidTables.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        const paidTablesCount = paidTables.length;
        const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
        return { totalOrders, revenue, paidTablesCount, avgOrderValue };
    }, [paidTables]);

    const monthStats = useMemo(() => {
        const monthlyRows = paidTables.filter((row) => {
            if (!row?.paidAt) return false;
            const d = new Date(row.paidAt);
            return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
        });
        const monthOrders = monthlyRows.reduce((sum, row) => sum + (row.orders?.length || 0), 0);
        const monthRevenue = monthlyRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        const monthPaidTables = monthlyRows.length;
        const monthAvgOrderValue = monthOrders > 0 ? monthRevenue / monthOrders : 0;
        return {
            monthOrders,
            monthRevenue,
            monthPaidTables,
            monthAvgOrderValue,
        };
    }, [paidTables, calendarMonth, calendarYear]);

    const dayStats = useMemo(() => {
        if (!selectedDayKey) return null;
        const rows = paidTablesByDate[selectedDayKey] || [];
        const totalOrders = rows.reduce((sum, row) => sum + (row.orders?.length || 0), 0);
        const revenue = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        const paidTablesCount = rows.length;
        const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
        return { totalOrders, revenue, paidTablesCount, avgOrderValue };
    }, [selectedDayKey, paidTablesByDate]);

    const calendarTopItems = useMemo(() => {
        const rows = selectedDayKey && dayStats
            ? (paidTablesByDate[selectedDayKey] || [])
            : paidTables.filter((row) => {
                if (!row?.paidAt) return false;
                const d = new Date(row.paidAt);
                return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
            });
        return getTopSellingItemsFromRows(rows);
    }, [selectedDayKey, dayStats, paidTablesByDate, paidTables, calendarMonth, calendarYear]);

    if (loading) return <LoadingScreen restaurant={restaurant} />;
    if (!location) return null;

    const isOpen = location?.isActive === true;
    const handleBack = () => navigate(`/restaurant/location/${locationId}`);

    const calendarMonthLabel = `${MONTHS[calendarMonth]} ${calendarYear}`;

    return (
        <div className="min-h-screen bg-background pb-8 flex flex-col">
            <ManagerHeader
                locationName={location.locationName}
                locationAddress={`${location.address}, ${location.city}`}
                isOpen={isOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleBack}
                tabs={STATUS_PAGE_TABS}
                tabLayoutId="activeTabLocationStatus"
            />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard label="Total Orders" value={dashboardStats.totalOrders} />
                            <StatCard label="Revenue" value={inrFormatter.format(dashboardStats.revenue)} />
                            <StatCard label="Avg Order Value" value={inrFormatter.format(dashboardStats.avgOrderValue)} />
                            <StatCard label="Paid Tables" value={dashboardStats.paidTablesCount} />
                        </div>
                        <WeeklyChart paidTablesByDate={paidTablesByDate} />
                        <LocationStatusView locationId={locationId} showStatCards={false} />
                    </div>
                )}

                {activeTab === "calendar" && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {selectedDayKey && dayStats ? (
                                <>
                                    <StatCard label={`Orders · ${formatDayLabel(selectedDayKey)}`} value={`${dayStats.totalOrders} orders`} />
                                    <StatCard label={`Revenue · ${formatDayLabel(selectedDayKey)}`} value={inrFormatter.format(dayStats.revenue)} />
                                    <StatCard label="Avg Order Value" value={inrFormatter.format(dayStats.avgOrderValue)} />
                                    <StatCard label="Paid Tables" value={dayStats.paidTablesCount} />
                                </>
                            ) : (
                                <>
                                    <StatCard label={`Orders · ${calendarMonthLabel}`} value={`${monthStats.monthOrders} orders`} />
                                    <StatCard label={`Revenue · ${calendarMonthLabel}`} value={inrFormatter.format(monthStats.monthRevenue)} />
                                    <StatCard label="Avg Order Value" value={inrFormatter.format(monthStats.monthAvgOrderValue)} />
                                    <StatCard label="Paid Tables" value={monthStats.monthPaidTables} />
                                </>
                            )}
                        </div>
                        <CalendarView
                            paidTablesByDate={paidTablesByDate}
                            year={calendarYear}
                            month={calendarMonth}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            selectedDayKey={selectedDayKey}
                            onDaySelect={setSelectedDayKey}
                        />

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="text-base font-bold text-foreground mb-3">
                                Top Selling Items {selectedDayKey && dayStats ? `· ${formatDayLabel(selectedDayKey)}` : `· ${calendarMonthLabel}`}
                            </h3>
                            {calendarTopItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No item sales data for this period.</p>
                            ) : (
                                <div className="space-y-2">
                                    {calendarTopItems.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                                            <span className="text-sm font-semibold text-primary">{item.quantity} sold</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LocationStatusPage;