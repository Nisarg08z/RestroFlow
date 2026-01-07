import React from "react";
import {
  Building2,
  Inbox,
  CreditCard,
  HeadphonesIcon,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Total Restaurants", value: "127", change: "+12%", icon: Building2 },
  { label: "Pending Requests", value: "8", change: "+3", icon: Inbox },
  { label: "Active Subscriptions", value: "98", change: "+5%", icon: CreditCard },
  { label: "Open Tickets", value: "14", change: "-2", icon: HeadphonesIcon },
];

const recentRequests = [
  { name: "The Golden Spoon", email: "contact@goldenspoon.com", date: "2 hours ago" },
  { name: "Cafe Bella", email: "info@cafebella.com", date: "5 hours ago" },
  { name: "Dragon Palace", email: "manager@dragonpalace.com", date: "1 day ago" },
];

const recentTickets = [
  { id: "TKT-001", subject: "Unable to generate QR codes", restaurant: "Pizza Hub", priority: "high" },
  { id: "TKT-002", subject: "Billing issue with subscription", restaurant: "Sushi Master", priority: "medium" },
  { id: "TKT-003", subject: "Need help with menu setup", restaurant: "Burger King", priority: "low" },
];

const AdminDashboard = ({ onNavigate }) => {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[oklch(0.7_0.18_45)]/10 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[oklch(0.7_0.18_45)]" />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change}
              </span>
            </div>

            <p className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-[oklch(0.65_0_0)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-lg font-semibold text-[oklch(0.98_0_0)]">
              Recent Requests
            </h2>
            <button
              onClick={() => onNavigate("requests")}
              className="text-[oklch(0.7_0.18_45)] flex items-center gap-1 text-sm"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {recentRequests.map((req, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[oklch(0.22_0.005_260)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[oklch(0.98_0_0)]">
                      {req.name}
                    </p>
                    <p className="text-xs text-[oklch(0.65_0_0)]">
                      {req.email}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                    Pending
                  </span>
                  <p className="text-xs text-[oklch(0.65_0_0)] mt-1">
                    {req.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-lg font-semibold text-[oklch(0.98_0_0)]">
              Recent Tickets
            </h2>
            <button
              onClick={() => onNavigate("support")}
              className="text-[oklch(0.7_0.18_45)] flex items-center gap-1 text-sm"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-3 bg-[oklch(0.22_0.005_260)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[oklch(0.7_0.18_45)]/10 rounded-full flex items-center justify-center">
                    <HeadphonesIcon className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[oklch(0.98_0_0)]">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-[oklch(0.65_0_0)]">
                      {ticket.restaurant}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    ticket.priority === "high"
                      ? "bg-red-500/10 text-red-500"
                      : ticket.priority === "medium"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-green-500/10 text-green-500"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.17_0.005_260)] border border-[oklch(0.28_0.005_260)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[oklch(0.7_0.18_45)]" />
          <h2 className="text-lg font-semibold text-[oklch(0.98_0_0)]">
            Restaurant Growth
          </h2>
        </div>

        <div className="h-64 flex items-center justify-center bg-[oklch(0.22_0.005_260)] rounded-lg border border-[oklch(0.28_0.005_260)]">
          <div className="text-center">
            <Users className="w-12 h-12 text-[oklch(0.65_0_0)] mx-auto mb-3" />
            <p className="text-[oklch(0.65_0_0)]">Restaurant growth chart</p>
            <p className="text-sm text-[oklch(0.65_0_0)]">
              Connect analytics to view data
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
