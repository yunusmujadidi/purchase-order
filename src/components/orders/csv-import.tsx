"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Papa from "papaparse";

interface CSVRow {
  NO?: string;
  SW?: string;
  Client?: string;
  "Qty "?: string;
  Picture?: string;
  Size?: string;
  Description?: string;
  "PO/ APPROVAL GB"?: string;
  "METAL/ SS"?: string;
  IN?: string;
  OUT?: string;
  "IN.1"?: string;
  "OUT.1"?: string;
  "IN.2"?: string;
  "OUT.2"?: string;
  "IN.3"?: string;
  "OUT.3"?: string;
  "IN.4"?: string;
  "OUT.4"?: string;
  "Delivery Date"?: string;
  "Delivery Address"?: string;
  VENEER?: string;
  "ASSY/ RANGKA"?: string;
  FINISHING?: string;
  PACKING?: string;
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.order.bulkImport.useMutation();
  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Parse CSV for preview
      Papa.parse(selectedFile, {
        header: true,
        preview: 5, // Show first 5 rows
        complete: (results) => {
          setPreview(results.data);
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        },
      });
    }
  };

  const parseDate = (dateStr?: string): Date | undefined => {
    if (!dateStr || dateStr.trim() === "") return undefined;

    // Try parsing DD/MM/YY format (e.g., "18/09/25")
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      let year = parseInt(parts[2]);

      // Convert 2-digit year to 4-digit
      if (year < 100) {
        year += 2000;
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try standard Date parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return undefined;
  };

  const extractMaterials = (description?: string): string[] => {
    if (!description) return [];

    const materials: string[] = [];
    const desc = description.toLowerCase();

    // Common materials to extract
    if (desc.includes("solid wood") || desc.includes("solid teak"))
      materials.push("Solid Wood");
    if (desc.includes("veneer")) materials.push("Veneer");
    if (desc.includes("metal") || desc.includes("stainless"))
      materials.push("Metal/SS");
    if (desc.includes("fabric")) materials.push("Fabric");
    if (desc.includes("marble") || desc.includes("marmer"))
      materials.push("Marble");
    if (desc.includes("leather")) materials.push("Leather");
    if (desc.includes("plywood")) materials.push("Plywood");
    if (desc.includes("glass")) materials.push("Glass");

    return materials;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsProcessing(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const orders = results.data
            .filter((row) => row.Client && row.Client.trim() !== "")
            .map((row, index) => {
              // Extract client name and project from the "Client" column (e.g., "Yophie 2")
              const clientMatch = row.Client?.match(/^([^0-9]+)\s*(\d+)?/);
              const clientName = clientMatch?.[1]?.trim() || row.Client || "";
              const clientProject = clientMatch?.[2] || null;

              return {
                rowNumber: index + 3, // +3 because: header row + 1 for 0-index + 1 for actual row
                swCode: row.SW || null,
                clientName,
                clientProject,
                productName: row.Size || "Unnamed Product",
                quantity: parseInt(row["Qty "]?.trim() || "1") || 1,
                size: row.Size || null,
                description: row.Description || null,
                pictureRef: row.Picture || null,
                materials: extractMaterials(row.Description),
                poApprovalDate: parseDate(row["PO/ APPROVAL GB"]),
                deliveryDate: parseDate(row["Delivery Date"]),
                deliveryAddress: row["Delivery Address"] || null,

                // Process stages - IN/OUT dates
                metalIn: parseDate(row["IN"]),
                metalOut: parseDate(row["OUT"]),
                veneerIn: parseDate(row["IN.1"]),
                veneerOut: parseDate(row["OUT.1"]),
                assyIn: parseDate(row["IN.2"]),
                assyOut: parseDate(row["OUT.2"]),
                finishingIn: parseDate(row["IN.3"]),
                finishingOut: parseDate(row["OUT.3"]),
                packingIn: parseDate(row["IN.4"]),
                packingOut: parseDate(row["OUT.4"]),
              };
            });

          console.log("Parsed orders:", orders.slice(0, 3)); // Log first 3 for debugging

          await importMutation.mutateAsync({ orders });

          toast.success(`Successfully imported ${orders.length} orders!`);
          setFile(null);
          setPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Refresh the orders list
          utils.order.getAll.invalidate();
        } catch (error: any) {
          console.error("Import error:", error);
          toast.error(error.message || "Failed to import orders");
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
        setIsProcessing(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Orders from CSV
        </CardTitle>
        <CardDescription>
          Upload your CSV file with order data. The file should match the format
          from your delivery spreadsheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select CSV File
              </span>
            </Button>
          </label>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {file.name}
            </div>
          )}
        </div>

        {preview.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview (first 5 rows)</h4>
            <div className="border rounded-lg overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Client</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row: any, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.Client || "-"}</td>
                      <td className="p-2">{row.Size || "-"}</td>
                      <td className="p-2">{row["Qty "] || "-"}</td>
                      <td className="p-2">{row["Delivery Date"] || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-blue-900 dark:text-blue-100">
                <p className="font-medium">Ready to import</p>
                <p className="text-xs mt-1">
                  This will create new orders from the CSV data. Existing orders
                  will not be affected.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Orders
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
