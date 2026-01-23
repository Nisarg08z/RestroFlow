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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Location Settings</h2>
          <p className="text-muted-foreground">Manage settings for {location.locationName}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">QR Code Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate and manage QR codes for your tables. Customers can scan these to view the menu and place orders.
              </p>
              {error && (
                <p className="mt-2 text-xs text-red-500">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg border border-border">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">QR Configuration</p>
              <p className="text-xs text-muted-foreground">
                Total Tables Configured:{" "}
                <span className="font-mono font-bold text-primary">{totalTables}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${qrCodesReady
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  }`}
              >
                {qrCodesReady ? "Active & Ready" : "Setup Required"}
              </span>
            </div>
          </div>

          {!qrCodesReady ? (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto space-y-4">
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-lg font-medium text-foreground">No QR Codes Generated Yet</h4>
                <p className="text-sm text-muted-foreground">
                  Generate unique QR codes for all {location.totalTables} tables in this location.
                  Each table will have exactly one QR code stored in Cloudinary.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Generate {totalTables} QR Codes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={downloading || !tableQRCodes.length}
                  className="flex items-center justify-center gap-3 p-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto self-start disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      {downloading ? "Preparing PDF..." : "Download All QR Codes"}
                    </p>
                    <p className="text-[10px] opacity-80">
                      PDF • One page per table
                    </p>
                  </div>
                </button>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">QR Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      Sample QR code preview • All tables have their own unique code.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/restaurant/location/${locationId}/qr-codes`)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted"
                  >
                    View All Codes
                  </button>
                </div>

                {tableQRCodes.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {(() => {
                      const sample = tableQRCodes[0];
                      const tableNum = sample.tableNumber;
                      const tableUrl = getTableUrl(tableNum);
                      return (
                        <div className="group relative p-3 bg-white border border-border rounded-xl shadow-sm text-center space-y-3 w-full sm:max-w-xs transition-all hover:border-primary/50 hover:shadow-md">
                          <div className="aspect-square bg-white rounded-lg flex items-center justify-center text-white text-xs relative overflow-hidden border border-border">
                            {sample.qrImageUrl ? (
                              <img
                                src={sample.qrImageUrl}
                                alt={`Table ${tableNum} QR`}
                                className="w-full h-full object-contain"
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
                          <p className="text-xs font-bold text-neutral-900">
                            Table {tableNum} (Preview)
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Use the buttons below to download all codes or manage individual ones.
                          </p>
                        </div>
                      );
                    })()}

                    <div className="flex-1 flex flex-col gap-2 text-xs text-muted-foreground">
                      <p>
                        You have <span className="font-semibold text-foreground">{tableQRCodes.length}</span>{" "}
                        QR codes generated for this location. Each table has a unique QR that links
                        directly to its digital menu.
                      </p>
                      <p>
                        Use <span className="font-semibold text-foreground">Download All</span> to get a
                        printable PDF, or{" "}
                        <span className="font-semibold text-foreground">View All Codes</span> to manage
                        individual QR codes (download, open, or regenerate).
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/restaurant/location/${locationId}/qr-codes`)}
                        className="inline-flex sm:hidden items-center justify-center mt-2 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted"
                      >
                        View All Codes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerate}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 disabled:opacity-60"
                  disabled={generating}
                >
                  <AlertCircle className="w-3 h-3" />
                  Regenerate Missing Codes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm opacity-50 pointer-events-none grayscale">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Additional location settings coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default LocationSettings;
