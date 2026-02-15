export function groupAndAggregateOrders(orders) {
    if (!orders || orders.length === 0) return [];

    const grouped = new Map();

    orders.forEach((order) => {
        if (!order.tableNumber || !order.createdAt) return;

        const groupKey = String(order.tableNumber);

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, {
                tableNumber: order.tableNumber,
                orders: [],
                items: new Map(),
                statuses: new Set(),
            });
        }

        const group = grouped.get(groupKey);
        group.orders.push(order);
        group.statuses.add(order.status);

        (order.items || []).forEach((item) => {
            const itemKey = `${item.name}_${item.specialInstructions || ""}`;
            if (group.items.has(itemKey)) {
                const existing = group.items.get(itemKey);
                existing.quantity += item.quantity || 1;
                existing.totalPrice = (Number(existing.price) || 0) * existing.quantity;
            } else {
                group.items.set(itemKey, {
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: Number(item.price) || 0,
                    specialInstructions: item.specialInstructions || "",
                    totalPrice: (Number(item.price) || 0) * (item.quantity || 1),
                });
            }
        });
    });

    return Array.from(grouped.values())
        .map((group) => {
            const sortedOrders = group.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestOrder = sortedOrders[0];
            const earliestOrder = sortedOrders[sortedOrders.length - 1];
            
            const latestDate = new Date(latestOrder.createdAt);
            const earliestDate = new Date(earliestOrder.createdAt);
            
            const dateKey = latestDate.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
            const timeKey = latestDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            });
            
            const isSameDay = latestDate.toDateString() === earliestDate.toDateString();
            const dateTimeDisplay = isSameDay 
                ? `${dateKey} at ${timeKey}`
                : `${earliestDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${dateKey} at ${timeKey}`;

            return {
                tableNumber: group.tableNumber,
                date: dateKey,
                time: timeKey,
                dateTimeDisplay,
                createdAt: latestOrder.createdAt,
                items: Array.from(group.items.values()),
                total: Array.from(group.items.values()).reduce((s, it) => s + it.totalPrice, 0),
                statuses: Array.from(group.statuses),
                latestStatus: Array.from(group.statuses).sort((a, b) => {
                    const order = { PENDING: 0, SUBMITTED: 1, PREPARING: 2, SERVED: 3, CANCELLED: 4 };
                    return (order[b] || 0) - (order[a] || 0);
                })[0],
            };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
