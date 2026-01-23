import React from "react";
import { Utensils, DollarSign, List, User } from "lucide-react";

const BillingPOS = () => {
    const tables = Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        status: i === 0 ? "occupied" : i === 3 ? "reserved" : "available",
        amount: i === 0 ? 1250 : 0,
        capacity: 4
    }));

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card rounded-xl p-4 border border-border">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-primary" />
                        Floor Plan & Ordering
                    </h2>
                    <p className="text-xs text-muted-foreground">Select a table to take order or generate bill.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4" />
                        Quick Bill
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium transition-all flex items-center justify-center gap-2 text-sm">
                        <List className="w-4 h-4" />    
                        Orders
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={`
                            relative aspect-square rounded-xl border p-3 md:p-4 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md
                            ${table.status === 'occupied'
                                ? 'bg-orange-500/5 border-orange-500/30 hover:bg-orange-500/10'
                                : table.status === 'reserved'
                                    ? 'bg-blue-500/5 border-blue-500/30 hover:bg-blue-500/10'
                                    : 'bg-card border-border hover:border-primary/50'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-base md:text-lg text-foreground">T-{table.id}</span>
                            <span className="text-[10px] text-muted-foreground bg-background/50 px-1.5 rounded-full border border-border/50">
                                {table.capacity}P
                            </span>
                        </div>

                        <div className="text-center flex-1 flex flex-col justify-center">
                            {table.status === 'occupied' ? (
                                <div>
                                    <p className="text-lg md:text-xl font-bold text-foreground">₹{table.amount}</p>
                                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse mt-1" />
                                </div>
                            ) : table.status === 'reserved' ? (
                                <div className="flex flex-col items-center justify-center opacity-70">
                                    <User className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1" />
                                    <p className="text-[10px] md:text-xs text-blue-600 font-medium">Reserved</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <Utensils className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground mb-1" />
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            {table.status === 'occupied' ? (
                                <button className="w-full py-1.5 text-[10px] md:text-xs font-semibold bg-primary text-primary-foreground rounded-lg shadow-sm hover:shadow">
                                    Bill
                                </button>
                            ) : (
                                <div className={`text-center text-[10px] md:text-xs font-medium ${table.status === 'reserved' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                    {table.status === 'reserved' ? '06:30 PM' : 'Available'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillingPOS;
