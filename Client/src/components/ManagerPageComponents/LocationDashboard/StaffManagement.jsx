import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Users,
  User,
  Mail,
  Phone,
  BadgeCheck,
  Shield,
  Trash2,
  Edit,
  X,
  Sparkles,
  Command,
  Clock,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getLocationStaff,
  createLocationStaff,
  updateLocationStaff,
  deleteLocationStaff,
} from "../../../utils/api";
import StaffCalendar from "./StaffCalendar";

const motionEase = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: motionEase } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 }
  },
};

const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } },
};

const ROLE_OPTIONS = [
  "Manager",
  "Chef",
  "Waiter",
  "Cashier",
  "Cleaner",
  "Other",
];

const ATTENDANCE_OPTIONS = ["PRESENT", "ABSENT", "HALF_DAY"];

const StaffManagement = ({ restaurantId, locationId }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");

  const [mode, setMode] = useState(null); // 'create' | 'edit' | 'view' | 'delete' | null
  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState("PRESENT");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [form, setForm] = useState({
    name: "",
    role: "Waiter",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLocationStaff(locationId)
      .then((res) => {
        if (cancelled) return;
        const items = res.data?.data || [];
        setStaff(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Failed to load staff");
        setStaff([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    if (mode) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff
      .filter((s) =>
        attendanceFilter === "ALL"
          ? true
          : (s.attendanceStatus || "") === attendanceFilter
      )
      .filter((s) => {
        if (!q) return true;
        return (
          (s.name || "").toLowerCase().includes(q) ||
          (s.role || "").toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q) ||
          (s.phone || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [search, staff, attendanceFilter]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: "",
      role: "Waiter",
      email: "",
      phone: "",
      notes: "",
    });
    setMode("create");
  };

  const openEdit = (s) => {
    setSelected(s);
    setForm({
      name: s.name || "",
      role: s.role || "Waiter",
      email: s.email || "",
      phone: s.phone || "",
      notes: s.notes || "",
    });
    setMode("edit");
  };

  const openDelete = (s) => {
    setSelected(s);
    setMode("delete");
  };

  const openAttendance = (s) => {
    setSelected(s);
    setAttendance(s.attendanceStatus || "PRESENT");
    setMode("attendance");
  };

  const openCalendar = (s) => {
    setSelected(s);
    setCalendarDate(new Date());
    setMode("calendar");
  };

  const closeModal = () => {
    setMode(null);
    setSelected(null);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email";
    if (form.phone && !/^[0-9+\-\s()]{7,}$/.test(form.phone)) return "Invalid phone";
    return null;
  };

  const handleCreate = () => {
    const err = validate();
    if (err) return toast.error(err);
    createLocationStaff(locationId, {
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    })
      .then((res) => {
        const created = res.data?.data;
        if (created) setStaff((prev) => [created, ...prev]);
        toast.success("Staff profile crafted successfully", { icon: "✨" });
        closeModal();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Failed to create staff");
      });
  };

  const handleUpdate = () => {
    if (!selected) return;
    const err = validate();
    if (err) return toast.error(err);
    const staffId = selected._id || selected.id;
    updateLocationStaff(locationId, staffId, {
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    })
      .then((res) => {
        const updated = res.data?.data;
        if (updated) {
          setStaff((prev) =>
            prev.map((s) => (String(s._id || s.id) === String(staffId) ? updated : s))
          );
        }
        toast.success("Staff details refined");
        closeModal();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Failed to update staff");
      });
  };

  const handleDelete = () => {
    if (!selected) return;
    const staffId = selected._id || selected.id;
    deleteLocationStaff(locationId, staffId)
      .then(() => {
        setStaff((prev) => prev.filter((s) => String(s._id || s.id) !== String(staffId)));
        toast.success("Staff profile removed");
        closeModal();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Failed to delete staff");
      });
  };

  const handleAttendance = () => {
    if (!selected) return;
    const staffId = selected._id || selected.id;
    updateLocationStaff(locationId, staffId, {
      attendanceStatus: attendance,
    })
      .then((res) => {
        const updated = res.data?.data;
        if (updated) {
          setStaff((prev) =>
            prev.map((s) => (String(s._id || s.id) === String(staffId) ? updated : s))
          );
        }
        toast.success("Attendance marked seamlessly", { icon: "📝" });
        closeModal();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Failed to register attendance");
      });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return 'text-primary bg-primary/10 border-primary/20';
      case 'chef': return 'text-orange-500/90 bg-orange-500/10 border-orange-500/20';
      case 'waiter': return 'text-sky-500/90 bg-sky-500/10 border-sky-500/20';
      case 'cashier': return 'text-emerald-500/90 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-muted-foreground bg-muted border-border/50';
    }
  };

  const getAttendanceLabel = (status) => {
    if (!status) return { label: "Not marked", classes: "bg-muted text-muted-foreground border-border/50" };
    switch (status.toUpperCase()) {
      case 'PRESENT': return { label: "Present", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      case 'ABSENT': return { label: "Absent", classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
      case 'HALF_DAY': return { label: "Half Day", classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      default: return { label: status, classes: "bg-muted text-muted-foreground border-border/50" };
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8 pb-12 w-full">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full pt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Staff & Attendance
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all overflow-hidden whitespace-nowrap"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">New staff</span>
        </motion.button>
      </motion.div>

      {/* Control Panel (Search & Filters) */}
      <motion.div variants={fadeUp} className="relative z-10 p-1.5 rounded-3xl bg-card border border-border/60 shadow-md backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row gap-4 justify-between h-full p-2">
          <div className="relative w-full xl:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all shadow-inner"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-background rounded-2xl border border-border overflow-x-auto shadow-inner">
            <div className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Filter</div>
            {["ALL", ...ATTENDANCE_OPTIONS].map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAttendanceFilter(s)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border whitespace-nowrap ${attendanceFilter === s
                    ? "text-primary-foreground bg-primary border-primary shadow-lg shadow-primary/20"
                    : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                  }`}
              >
                {s === "ALL" ? "All Roster" : s === "HALF_DAY" ? "Half Day" : s.charAt(0) + s.slice(1).toLowerCase()}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Staff Grid */}
      <motion.div variants={fadeUp} className="relative z-10">
        <div className="flex items-center gap-3 mb-6 px-2">
          <Command className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground tracking-wide">Active Roster</h3>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-sm">
            {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card rounded-[2.5rem] border border-border/60 shadow-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary" />
            </motion.div>
            <p className="text-muted-foreground font-medium mt-6 tracking-wide animate-pulse">Synchronizing roster data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-[2.5rem] border border-border/60 shadow-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-30 pointer-events-none" />
            <div className="w-24 h-24 mb-6 rounded-full bg-muted border border-border flex items-center justify-center relative z-10 shadow-inner">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10">No Staff Found</h3>
            <p className="text-muted-foreground max-w-sm text-center mb-8 relative z-10">
              {search || attendanceFilter !== "ALL"
                ? "We couldn't find any team members matching your current refined filters."
                : "Your elite team awaits. Add your first staff member to begin orchestrating operations."}
            </p>
            {!search && attendanceFilter === "ALL" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreate}
                className="relative z-10 px-8 py-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
              >
                Add First Member
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div key={search + attendanceFilter + filtered.length} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => {
              const attLabel = getAttendanceLabel(s.attendanceStatus);
              const roleColor = getRoleColor(s.role);

              return (
                <motion.div
                  key={s._id || s.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative bg-card border border-border/60 rounded-3xl p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full group-hover:bg-primary/10 transition-all duration-700 pointer-events-none" />

                  {/* Top Header of Card */}
                  <div className="flex justify-between items-center mb-5 relative z-10 w-full">
                    <div className="flex items-center gap-5 min-w-0 w-full">
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <User className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                        </div>
                        <div className={`absolute -bottom-2.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm z-10 ${roleColor}`}>
                          {s.role}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                          {s.name}
                        </h4>
                        <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold tracking-wide shadow-sm w-fit ${attLabel.classes}`}>
                          <Clock className="w-3 h-3" />
                          {attLabel.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-4 relative z-10 mt-2">
                    <div className="space-y-2.5 bg-background rounded-2xl p-4 border border-border/50 shadow-inner">
                      <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{s.email || <span className="italic text-muted-foreground font-normal">No email provided</span>}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{s.phone || <span className="italic text-muted-foreground font-normal">No phone provided</span>}</span>
                      </div>
                    </div>

                    {s.notes && (
                      <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                        "{s.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-5 border-t border-border/50 flex flex-wrap sm:flex-nowrap gap-2 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openAttendance(s)}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-3 rounded-xl shadow-md shadow-primary/20 transition-colors whitespace-nowrap"
                    >
                      <BadgeCheck className="w-4 h-4" />
                      Status
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openCalendar(s)}
                      className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center basis-[calc(25%-0.5rem)] sm:basis-auto shrink-0 shadow-sm"
                      title="View Schedule"
                    >
                      <Calendar className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(s)}
                      className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center basis-[calc(25%-0.5rem)] sm:basis-auto shrink-0 shadow-sm"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>


                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDelete(s)}
                      className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all flex items-center justify-center basis-[calc(25%-0.5rem)] sm:basis-auto shrink-0 shadow-sm"
                      title="Remove Staff"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Modal / Dialog Overlay */}
      {createPortal(
        <AnimatePresence>
          {mode && (
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
              onClick={closeModal}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-card border border-border/60 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative gradients in modal */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="p-6 md:p-8 border-b border-border/50 bg-card/50 flex justify-between items-start gap-4 relative z-10 w-full">
                  <div className="flex-1 w-full">
                    {mode === "calendar" ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3">
                            <CalendarDays className="w-6 h-6 text-primary" /> Roster Schedule
                          </h3>
                          {selected?.name && (
                            <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
                              Assignee: <span className="text-primary font-bold">{selected.name}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border/60 shadow-inner">
                          <button 
                            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold text-foreground px-4 py-1 min-w-[120px] text-center">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button 
                            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3">
                          {mode === "create" && <><Plus className="w-6 h-6 text-primary" /> Onboard Staff</>}
                          {mode === "edit" && <><Edit className="w-6 h-6 text-primary" /> Refine Profile</>}
                          {mode === "attendance" && <><BadgeCheck className="w-6 h-6 text-primary" /> Log Attendance</>}
                          {mode === "delete" && <><Trash2 className="w-6 h-6 text-rose-500" /> Terminate Record</>}
                        </h3>
                        {selected?.name && (
                          <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
                            Profile: <span className="text-primary font-bold">{selected.name}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2.5 rounded-full bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/50 shrink-0 shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className={`p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10 ${mode === "calendar" ? "bg-background" : "bg-background/30"}`}>
                  {mode === "attendance" && selected ? (
                    <div className="space-y-6">
                      <div className="bg-card p-8 rounded-3xl border border-border/60 shadow-inner">
                        <p className="text-base text-foreground mb-6 font-medium text-center">
                          Register current activity status for <span className="font-bold text-primary">{selected.name}</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          {ATTENDANCE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAttendance(opt)}
                              className={`px-4 py-4 rounded-2xl text-sm font-bold border transition-all duration-300 flex-1 whitespace-nowrap ${attendance === opt
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
                                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                }`}
                            >
                              {opt === 'HALF_DAY' ? 'Half Day' : opt.charAt(0) + opt.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : mode === "calendar" && selected ? (
                    <StaffCalendar selected={selected} calendarDate={calendarDate} />
                  ) : mode === "delete" && selected ? (
                    <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-3xl text-center space-y-4 shadow-inner">
                      <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-8 h-8 text-rose-500" />
                      </div>
                      <h4 className="text-xl font-black text-foreground">Confirm Removal</h4>
                      <p className="text-muted-foreground text-base max-w-sm mx-auto font-medium">
                        Are you certain you wish to permanently delete <span className="text-rose-600 dark:text-rose-400 font-bold">{selected.name}</span> from the roster? This action is irreversible.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> Full Name
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground block shadow-inner"
                          placeholder="e.g. Jonathan Doe"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5" /> Designation
                        </label>
                        <div className="relative">
                          <select
                            value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                            className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground appearance-none cursor-pointer shadow-inner"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r} className="bg-card text-foreground">
                                {r}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                            <Plus className="w-4 h-4 rotate-45" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> Email Address
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground shadow-inner"
                          placeholder="jonathan@example.com"
                        />
                      </div>

                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> Contact Number
                        </label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground shadow-inner"
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Command className="w-3.5 h-3.5" /> Operational Notes
                        </label>
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                          className="w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none shadow-inner"
                          placeholder="Detail shifts, specific responsibilities, or special clearances..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8 border-t border-border/50 bg-card/80 flex flex-col sm:flex-row gap-4 relative z-10 mt-auto backdrop-blur-md">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 rounded-2xl border border-border bg-background text-foreground font-bold hover:bg-muted transition-all order-2 sm:order-1 shadow-sm"
                  >
                    Cancel
                  </button>
                  {mode === "create" && (
                    <button
                      onClick={handleCreate}
                      className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
                    >
                      Authorize Profile
                    </button>
                  )}
                  {mode === "edit" && (
                    <button
                      onClick={handleUpdate}
                      className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
                    >
                      Save Configuration
                    </button>
                  )}
                  {mode === "delete" && (
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
                    >
                      Confirm Deletion
                    </button>
                  )}
                  {mode === "attendance" && selected && (
                    <button
                      onClick={handleAttendance}
                      className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
                    >
                      Log Status
                    </button>
                  )}
                  {mode === "calendar" && selected && (
                    <button
                      onClick={closeModal}
                      className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5 order-1 sm:order-2"
                    >
                      Close Schedule
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default StaffManagement;
