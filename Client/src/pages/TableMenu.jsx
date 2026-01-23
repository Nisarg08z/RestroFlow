import React from "react";
import { useParams } from "react-router-dom";

const TableMenu = () => {
  const { restaurantId, locationId, tableNumber } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Digital Menu</h1>
        <p className="text-sm text-muted-foreground">
          Welcome! You are viewing the menu for:
        </p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">Restaurant:</span>{" "}
            <span className="font-mono text-xs break-all">{restaurantId}</span>
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            <span className="font-mono text-xs break-all">{locationId}</span>
          </p>
          <p>
            <span className="font-semibold">Table:</span>{" "}
            <span className="font-mono">{tableNumber}</span>
          </p>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-muted border border-border">
          <p className="text-sm text-muted-foreground">
            The full menu experience will be shown here. For now, this confirms
            that your QR code is working and correctly linked to this table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableMenu;

