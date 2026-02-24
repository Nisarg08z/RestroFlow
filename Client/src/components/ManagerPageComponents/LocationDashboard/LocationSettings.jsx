import React, { useState } from "react";
import QRCode from "react-qr-code";
import {
  QrCode,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import { generateLocationQRCodes } from "../../../utils/api";
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

const LocationSettings = ({ location, restaurantId, locationId }) => {
  const navigate = useNavigate();
  const existingQRCodes = location.tableQRCodes || [];

  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrCodesReady, setQrCodesReady] = useState(existingQRCodes.length > 0);
  const [qrData, setQrData] = useState(
    existingQRCodes.length ? { tableQRCodes: existingQRCodes } : null
  );
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!locationId) return;

    try {
      setGenerating(true);
      setError("");

      const res = await generateLocationQRCodes(locationId);
      const payload = res?.data?.data || {};

      setQrData(payload);
      setQrCodesReady((payload.tableQRCodes || []).length > 0);
    } catch (err) {
      console.error("Failed to generate QR codes", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate QR codes";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const totalTables = location.totalTables || 0;

  const getTableUrl = (tableNum) => {
    if (!restaurantId || !locationId) return window.location.origin;
    return `${window.location.origin}/menu/${restaurantId}/${locationId}/${tableNum}`;
  };

  const tableQRCodes = qrData?.tableQRCodes || [];

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

  const handleDownloadAll = async () => {
    if (!tableQRCodes.length || downloading) return;

    try {
      setDownloading(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const safeRestaurantName = location.restaurantName || "";

      for (let i = 0; i < tableQRCodes.length; i++) {
        const { tableNumber, qrImageUrl } = tableQRCodes[i];

        if (!qrImageUrl) continue;

        if (i > 0) {
          doc.addPage();
        }

        const imgData = await loadImageAsDataUrl(qrImageUrl);

        // Top: restaurant name
        doc.setFontSize(18);
        const title = safeRestaurantName || location.locationName || "Restaurant";
        doc.text(title, pageWidth / 2, 20, { align: "center" });

        // Middle: QR image
        const qrSize = 80;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = (pageHeight - qrSize) / 2 - 10;
        doc.addImage(imgData, "PNG", qrX, qrY, qrSize, qrSize);

        // Bottom: table name
        doc.setFontSize(14);
        doc.text(`Table ${tableNumber}`, pageWidth / 2, pageHeight - 30, {
          align: "center",
        });
      }

      const safeLocName =
        (location.locationName || "location").replace(/[^\w]+/g, "-") || "location";

      doc.save(`qr-codes-${safeLocName}.pdf`);
    } catch (err) {
      console.error("Failed to download QR PDF", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-10">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Location Settings</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Manage settings for <span className="text-primary">{location.locationName}</span></p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 relative hover:border-primary/30 transition-colors duration-500">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <div className="p-8 border-b border-border/50 bg-muted/10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/20">
              <QrCode className="w-7 h-7 text-primary" />
            </div>
            <div className="z-10 relative">
              <h3 className="text-xl font-bold text-foreground tracking-tight">QR Code Management</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1.5 max-w-lg leading-relaxed">
                Generate and manage QR codes for your tables. Customers can scan these to view the menu and place orders directly from their phones.
              </p>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 inline-block">
                  {error}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-background rounded-2xl border border-border/60 shadow-sm">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">QR Configuration</p>
              <p className="text-xs text-muted-foreground">
                Total Tables Configured:{" "}
                <span className="font-mono font-bold text-primary">{totalTables}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${qrCodesReady
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  }`}
              >
                {qrCodesReady ? "Active & Ready" : "Setup Required"}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!qrCodesReady ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 px-4 border-2 border-dashed border-border/60 rounded-[2rem] bg-muted/10 relative overflow-hidden group hover:border-primary/40 hover:bg-muted/30 transition-colors duration-500"
              >
                <div className="max-w-md mx-auto space-y-5 relative z-10">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                    className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-500"
                  >
                    <QrCode className="w-10 h-10 text-primary opacity-80" />
                  </motion.div>

                  <div>
                    <h4 className="text-xl font-bold text-foreground tracking-tight">No QR Codes Generated Yet</h4>
                    <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                      Generate unique QR codes for all <span className="text-primary font-bold">{location.totalTables}</span> tables in this location.
                      Each table will have exactly one QR code securely generated and stored.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(var(--primary), 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={generating}
                    className="mt-4 inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-all shadow-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating secure codes...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        Generate {totalTables} QR Codes
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                className="space-y-8"
              >
                <div className="flex justify-start">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={downloading || !tableQRCodes.length}
                    className="flex items-center justify-center gap-4 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                  >
                    <div className="bg-primary-foreground/20 p-2 rounded-xl group-hover/btn:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-tight pr-4">
                      <p className="text-sm font-black tracking-wide">
                        {downloading ? "Preparing PDF..." : "Download All QR Codes"}
                      </p>
                      <p className="text-[11px] font-semibold opacity-80 tracking-wider uppercase mt-0.5">
                        High Quality PDF
                      </p>
                    </div>
                  </motion.button>
                </div>

                <div className="border-t border-border/50 pt-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-foreground tracking-tight">QR Previews</h4>
                      <p className="text-sm font-medium text-muted-foreground mt-1">
                        A sample of your generated codes.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => navigate(`/restaurant/location/${locationId}/qr-codes`)}
                      className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/60 text-sm font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                      View All Codes
                    </motion.button>
                  </div>

                  {tableQRCodes.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
                      {(() => {
                        const sample = tableQRCodes[0];
                        const tableNum = sample.tableNumber;
                        const tableUrl = getTableUrl(tableNum);
                        return (
                          <motion.div
                            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                            className="group relative p-4 bg-card border border-border/60 rounded-2xl shadow-md text-center space-y-3 w-full sm:max-w-xs transition-all hover:border-primary/40"
                          >
                            <div className="aspect-square bg-white rounded-xl flex items-center justify-center p-2 relative overflow-hidden border border-border/40 group-hover:bg-primary/[0.02] transition-colors">
                              {sample.qrImageUrl ? (
                                <img
                                  src={sample.qrImageUrl}
                                  alt={`Table ${tableNum} QR`}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              ) : (
                                <QRCode
                                  value={tableUrl}
                                  size={128}
                                  style={{ width: "100%", height: "100%" }}
                                  viewBox="0 0 256 256"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground tracking-tight">
                                Table {tableNum}
                              </p>
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                                Sample Preview
                              </p>
                            </div>
                          </motion.div>
                        );
                      })()}

                      <div className="flex-1 flex flex-col gap-3 text-sm font-medium text-muted-foreground pt-2">
                        <p className="leading-relaxed">
                          You have <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md mx-1">{tableQRCodes.length}</span>{" "}
                          QR codes securely generated for this location. Each table has a unique QR that links
                          directly to its specific digital menu.
                        </p>
                        <p className="leading-relaxed border-l-2 border-primary/30 pl-3">
                          Use the <span className="font-bold text-foreground">Download All</span> button to get a high-quality printable PDF, or{" "}
                          click <span className="font-bold text-foreground">View All Codes</span> to manage and verify
                          individual table codes.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => navigate(`/restaurant/location/${locationId}/qr-codes`)}
                          className="inline-flex md:hidden items-center justify-center mt-3 px-4 py-2.5 rounded-xl bg-muted border border-border/60 text-sm font-bold text-foreground shadow-sm"
                        >
                          View All Codes
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleGenerate}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 disabled:opacity-60 bg-muted/50 px-3 py-1.5 rounded-lg"
                    disabled={generating}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin text-primary' : ''}`} />
                    {generating ? "Regenerating..." : "Regenerate Missing Codes"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 relative pointer-events-none opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="p-8 border-b border-border/50 bg-muted/10">
          <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border/60">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </span>
            General Settings
          </h3>
        </div>
        <div className="p-8 bg-muted/5">
          <p className="text-sm font-semibold text-muted-foreground text-center py-6 border-2 border-dashed border-border/60 rounded-xl">Additional location settings coming soon in future updates...</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocationSettings;
