import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Link2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { getCurrentRestaurant, regenerateTableQRCode } from "../../utils/api";
import { LoadingScreen } from "../../components/ManagerPageComponents";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const AllQRCodesPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingTable, setRegeneratingTable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentRestaurant();
        if (res.data?.success) {
          const rest = res.data.data;
          setRestaurant(rest);
          const loc = rest.locations.find((l) => String(l._id || l.id) === String(locationId));
          if (!loc) {
            toast.error("Location not found");
            navigate("/restaurant/welcome");
            return;
          }
          setLocation(loc);
        }
      } catch (error) {
        console.error("Failed to load QR codes", error);
        toast.error("Failed to load QR codes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locationId, navigate]);

  const loadImageAsDataUrl = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleDownloadSingle = async (entry) => {
    if (!entry?.qrImageUrl || !restaurant || !location) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const imgData = await loadImageAsDataUrl(entry.qrImageUrl);

      const safeRestaurantName = restaurant.restaurantName || "";
      const title =
        safeRestaurantName || location.locationName || "Restaurant";

      doc.setFontSize(18);
      doc.text(title, pageWidth / 2, 20, { align: "center" });

      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = (pageHeight - qrSize) / 2 - 10;
      doc.addImage(imgData, "PNG", qrX, qrY, qrSize, qrSize);

      doc.setFontSize(14);
      doc.text(
        `Table ${entry.tableNumber}`,
        pageWidth / 2,
        pageHeight - 30,
        { align: "center" }
      );

      doc.save(`qr-table-${entry.tableNumber}.pdf`);
    } catch (error) {
      console.error("Failed to download QR PDF", error);
      toast.error("Failed to download QR as PDF");
    }
  };

  const handleRegenerate = async (tableNumber) => {
    if (!locationId || !tableNumber) return;

    try {
      setRegeneratingTable(tableNumber);
      const res = await regenerateTableQRCode(locationId, tableNumber);
      const updated = res?.data?.data;

      if (updated) {
        setLocation((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          const list = next.tableQRCodes || [];
          const idx = list.findIndex((e) => e.tableNumber === updated.tableNumber);
          if (idx >= 0) {
            list[idx] = updated;
          } else {
            list.push(updated);
          }
          next.tableQRCodes = [...list];
          return next;
        });
        toast.success(`QR updated for Table ${tableNumber}`);
      }
    } catch (error) {
      console.error("Failed to regenerate QR", error);
      toast.error(error?.response?.data?.message || "Failed to regenerate QR");
    } finally {
      setRegeneratingTable(null);
    }
  };

  if (loading) return <LoadingScreen restaurant={restaurant} />;
  if (!location) return null;

  const tableQRCodes = location.tableQRCodes || [];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">

        <motion.div variants={itemVariants}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Location Settings
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              QR Codes for <span className="text-primary">{location.locationName}</span>
            </h1>
            <p className="text-sm sm:text-base font-medium text-muted-foreground/80 max-w-2xl leading-relaxed">
              Download, open, or securely regenerate QR codes for each table. All active codes are permanently stored and linked to your digital menu.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[2rem] shadow-2xl shadow-black/5 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="p-6 sm:p-10 relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            {tableQRCodes.length === 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border/60 rounded-3xl bg-muted/10"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                    <RefreshCw className="w-8 h-8 text-primary opacity-80" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-foreground tracking-tight">
                      No QR codes found
                    </p>
                    <p className="text-sm font-medium text-muted-foreground max-w-sm">
                      Generate secure QR codes directly from the <span className="text-primary font-bold">Location Settings</span> tab first.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2.5 bg-muted text-foreground font-semibold rounded-xl text-sm border border-border hover:border-primary/50 transition-colors"
                  >
                    Go to Settings
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
              >
                {tableQRCodes.map((entry) => {
                  const tableUrl = `${window.location.origin}/menu/${restaurant._id}/${location._id}/${entry.tableNumber}`;

                  return (
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                      key={entry.tableNumber}
                      className="group flex flex-col items-stretch gap-4 p-5 bg-card border border-border/60 rounded-3xl shadow-lg transition-all hover:border-primary/50 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="w-full aspect-square bg-white border border-border/40 rounded-2xl flex items-center justify-center overflow-hidden relative group-hover:bg-primary/[0.02] transition-colors p-3 shadow-sm">
                        {entry.qrImageUrl ? (
                          <img
                            src={entry.qrImageUrl}
                            alt={`Table ${entry.tableNumber} QR`}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground/60">No Image</span>
                        )}

                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="p-3.5 bg-primary text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center gap-2 font-bold text-sm"
                            title="Download QR"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSingle(entry);
                            }}
                          >
                            <Download className="w-5 h-5" />
                            <span className="sr-only">Download</span>
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3 w-full relative z-10">
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground tracking-tight">
                            Table {entry.tableNumber}
                          </p>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                            Active Code
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 w-full mt-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => window.open(tableUrl, "_blank", "noopener,noreferrer")}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Link
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleRegenerate(entry.tableNumber)}
                            disabled={regeneratingTable === entry.tableNumber}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border/60 bg-background text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {regeneratingTable === entry.tableNumber ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                                Doing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                                Regen
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AllQRCodesPage;

