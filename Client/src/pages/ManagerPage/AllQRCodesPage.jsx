import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Link2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { getCurrentRestaurant, regenerateTableQRCode } from "../../utils/api";
import { LoadingScreen } from "../../components/ManagerPageComponents";
import { toast } from "react-hot-toast";

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
          const loc = rest.locations.find((l) => (l._id || l.id) === locationId);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Location
        </button>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            QR Codes for {location.locationName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Download, open, or regenerate QR codes for each table. These codes are already stored
            in Cloudinary and linked to your digital menu.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6">
          {tableQRCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <p className="text-sm sm:text-base text-muted-foreground">
                No QR codes found for this location.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please generate QR codes from the <span className="font-semibold">Location Settings</span> tab first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {tableQRCodes.map((entry) => {
                const tableUrl = `${window.location.origin}/menu/${restaurant._id}/${location._id}/${entry.tableNumber}`;

                return (
                  <div
                    key={entry.tableNumber}
                    className="flex flex-col items-stretch gap-3 p-3 bg-background border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="w-full aspect-square bg-white border border-border rounded-lg flex items-center justify-center overflow-hidden relative group text-xs">
                      {entry.qrImageUrl ? (
                        <img
                          src={entry.qrImageUrl}
                          alt={`Table ${entry.tableNumber} QR`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No QR image</span>
                      )}

                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
                          title="Download QR"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingle(entry);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-full">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        Table {entry.tableNumber}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(tableUrl, "_blank", "noopener,noreferrer")
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-[11px] sm:text-xs text-primary hover:bg-primary/10"
                        >
                          <Link2 className="w-3 h-3" />
                          Open Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRegenerate(entry.tableNumber)}
                          disabled={regeneratingTable === entry.tableNumber}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[11px] sm:text-xs text-foreground hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {regeneratingTable === entry.tableNumber ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              Regenerate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllQRCodesPage;

