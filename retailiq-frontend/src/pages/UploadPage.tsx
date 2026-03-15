// src/pages/UploadPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2, Download, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";

interface UploadRecord {
    id: number;
    originalName: string;
    status: "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";
    totalRows: number;
    insertedRows: number;
    skippedRows: number;
    errorRows: number;
    startedAt: string;
}

const STATUS_CONFIG = {
    COMPLETE: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
    FAILED: { color: "bg-red-100 text-red-800", icon: XCircle },
    PROCESSING: { color: "bg-blue-100 text-blue-800", icon: Loader2 },
    PENDING: { color: "bg-gray-100 text-gray-800", icon: Loader2 },
};

export default function UploadPage() {
    const { user } = useAuth();
    const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useState<UploadRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        api.get("/data/upload/history")
            .then(r => setHistory(r.data.data ?? []))
            .catch(() => { })
            .finally(() => setLoadingHistory(false));
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this upload history record?")) return;
        try {
            await api.delete(`/data/upload/history/${id}`);
            fetchHistory();
        } catch (e: any) {
            alert(e?.response?.data?.message || "Failed to delete record");
        }
    };

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) setSelectedFile(accepted[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setResult(null);
        const formData = new FormData();
        formData.append("file", selectedFile);
        try {
            await api.post("/data/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setResult({ success: true, message: `"${selectedFile.name}" uploaded. ETL pipeline triggered in background.` });
            setSelectedFile(null);
            fetchHistory();
        } catch (e: any) {
            setResult({ success: false, message: e?.response?.data?.message ?? "Upload failed. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
                        <p className="text-muted-foreground text-sm mt-1">Upload CSV or Excel files to import orders, products, and customers</p>
                    </div>
                    <Button variant="outline" className="gap-2 border-2" asChild>
                        <a href="/template_sales_import.csv" download>
                            <Download className="w-4 h-4" />
                            Download Template
                        </a>
                    </Button>
                </div>
            </div>

            {/* Dropzone */}
            <Card>
                <CardHeader><CardTitle>Upload File</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                        {isDragActive ? (
                            <p className="text-primary font-medium">Drop the file here</p>
                        ) : (
                            <>
                                <p className="font-medium">Drag & drop a file, or click to browse</p>
                                <p className="text-sm text-muted-foreground mt-1">Supports CSV and Excel (.xlsx) — max 50 MB</p>
                            </>
                        )}
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <FileText className="w-5 h-5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <Button onClick={handleUpload} disabled={uploading} size="sm">
                                {uploading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Processing…</> : "Upload & Sync"}
                            </Button>
                        </div>
                    )}

                    {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? "Upload Successful" : "Upload Failed"}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm font-semibold">Required Columns</p>
                        <div className="flex flex-wrap gap-2">
                            {["order_id", "customer_email", "product_sku", "quantity", "unit_price", "order_date"].map(col => (
                                <Badge key={col} variant="secondary" className="font-mono text-xs">{col}</Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Optional: status, payment_method, shipping_address, region, discount_amount</p>
                    </div>
                </CardContent>
            </Card>

            {/* Upload History */}
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <CardTitle>Upload History</CardTitle>
                    <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={fetchHistory} disabled={loadingHistory}>
                        <RefreshCw className={`w-4 h-4 ${loadingHistory ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="px-0">
                    {history.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm py-8">No upload history. Click Refresh to load.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">File</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Inserted</TableHead>
                                    <TableHead className="text-right">Errors</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map(h => {
                                    const { color, icon: StatusIcon } = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.PENDING;
                                    const successRate = h.totalRows > 0 ? Math.round((h.insertedRows / h.totalRows) * 100) : 0;
                                    return (
                                        <TableRow key={h.id} className="hover:bg-muted/40">
                                            <TableCell className="pl-6 font-medium text-sm">{h.originalName}</TableCell>
                                            <TableCell>
                                                <Badge className={`flex items-center gap-1 w-fit text-xs ${color}`}>
                                                    <StatusIcon className={`w-3 h-3 ${h.status === "PROCESSING" ? "animate-spin" : ""}`} />
                                                    {h.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{h.totalRows}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Progress value={successRate} className="w-16 h-1.5" />
                                                    <span className="text-sm">{h.insertedRows}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-right font-mono text-sm ${h.errorRows > 0 ? "text-red-500 font-semibold" : ""}`}>
                                                {h.errorRows}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">{formatDate(h.startedAt)}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    {h.status === "FAILED" && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-amber-500"
                                                            onClick={async () => {
                                                                const res = await api.get(`/data/upload/${h.id}/errors`);
                                                                setErrorDetails(res.data.data);
                                                                setIsErrorDialogOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(h.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Error Dialog */}
            {isErrorDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl border-2">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="p-2 rounded-full bg-red-100 text-red-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle>Import Error Details</CardTitle>
                                <p className="text-sm text-muted-foreground">Technical details of the failed import</p>
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-auto max-h-[300px] border">
                                {errorDetails ? (
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(errorDetails), null, 2)}</pre>
                                ) : (
                                    "No detailed error information available."
                                )}
                            </div>
                        </CardContent>
                        <div className="p-4 border-t flex justify-end">
                            <Button onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
