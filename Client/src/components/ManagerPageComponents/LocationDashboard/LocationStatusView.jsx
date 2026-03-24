import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getLocationPaidOrders } from "../../../utils/api";
import { Banknote, Loader2, Receipt, TrendingUp, Trophy } from "lucide-react";

const POLL_INTERVAL_MS = 10000;

const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const LocationStatusView = ({ locationId, showStatCards = true }) => {
    const [loading, setLoading] = useState(true);
    const [paidTables, setPaidTables] = useState([]);

    const fetchPaidOrders = useCallback(async () => {
        if (!locationId) return;
        try {
            const res = await getLocationPaidOrders(locationId);
            if (res.data?.success) {
                setPaidTables(res.data.data?.tables || []);
            }
        } catch (error) {
            console.error("Failed to fetch location status data", error);
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    useEffect(() => {
        fetchPaidOrders();
    }, [fetchPaidOrders]);

    useEffect(() => {
        const timer = setInterval(fetchPaidOrders, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchPaidOrders]);

    const stats = useMemo(() => {
        const ordersCount = paidTables.reduce((sum, entry) => sum + (entry.orders?.length || 0), 0);
        const totalRevenue = paidTables.reduce((sum, entry) => {
            if (typeof entry.amount === "number") return sum + entry.amount;
            const fallback = (entry.orders || []).reduce((orderSum, order) => orderSum + (order.total || 0), 0);
            return sum + fallback;
        }, 0);
        const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

        const itemTotals = new Map();
        paidTables.forEach((entry) => {
            (entry.orders || []).forEach((order) => {
                (order.items || []).forEach((item) => {
                    const key = item.name || "Unknown Item";
                    const qty = Number(item.quantity) || 0;
                    itemTotals.set(key, (itemTotals.get(key) || 0) + qty);
                });
            });
        });

        const topItems = Array.from(itemTotals.entries())
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            tablesCount: paidTables.length,
            ordersCount,
            totalRevenue,
            avgOrderValue,
            topItems,
        };
    }, [paidTables]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading location status...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {showStatCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Total Revenue</p>
                        <div className="flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" />
                            <p className="text-2xl font-black text-foreground">{inrFormatter.format(stats.totalRevenue)}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Paid Orders</p>
                        <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            <p className="text-2xl font-black text-foreground">{stats.ordersCount}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Paid Tables</p>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <p className="text-2xl font-black text-foreground">{stats.tablesCount}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Avg Order Value</p>
                        <div className="flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" />
                            <p className="text-2xl font-black text-foreground">{inrFormatter.format(stats.avgOrderValue)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Top Selling Items</h3>
                </div>
                {stats.topItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No paid order item data yet.</p>
                ) : (
                    <div className="space-y-3">
                        {stats.topItems.map((item) => (
                            <div key={item.name} className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-sm font-bold text-primary">{item.quantity} sold</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationStatusView;
