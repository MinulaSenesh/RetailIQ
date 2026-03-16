import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FileClock, Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditService, AuditLog } from "@/api/audit";
import { useAuth } from "@/context/AuthContext";

export default function AuditLogPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        auditService.getLogs()
            .then(r => setLogs(r.data?.content ?? []))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l =>
        (l.user?.username ?? "system").toLowerCase().includes(search.toLowerCase()) ||
        (l.action ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (l.tableName ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action === "CREATE") return "bg-green-100 text-green-800 border-green-200";
        if (action === "UPDATE") return "bg-blue-100 text-blue-800 border-blue-200";
        if (action === "DELETE") return "bg-red-100 text-red-800 border-red-200";
        return "bg-gray-100 text-gray-800";
    };

    const isViewer = user?.role === "VIEWER";
    
    if (user?.role !== "ADMIN" && !isViewer) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <FileClock className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground mt-2">Only Administrators and authorized Viewers can view the system audit logs.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isViewer && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <div className="bg-blue-500 rounded-full p-1">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-400">Preview Mode</p>
                        <p className="text-xs text-blue-400/70">You are viewing system audit logs as a member of the community. All data is read-only.</p>
                    </div>
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
                <p className="text-muted-foreground text-sm mt-1">Chronological record of all system configuration and data changes.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><FileClock className="w-5 h-5" />Activity Stream</CardTitle>
                    <div className="relative ml-auto w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search user or entity..." className="pl-9" value={search} onChange={(e: any) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6 w-[180px]">Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={6} className="pl-6"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No audit logs found</TableCell></TableRow>
                            ) : (
                                filtered.map(log => (
                                    <TableRow key={log.logId} className="hover:bg-muted/40 text-sm">
                                        <TableCell className="pl-6 whitespace-nowrap text-muted-foreground">
                                            {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell className="font-medium">{log.user ? log.user.username : "System"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">{log.user ? log.user.role.replace("ROLE_", "") : "SYSTEM"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getActionColor(log.action)}>{log.action}</Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{log.tableName} #{log.recordId}</TableCell>
                                        <TableCell className="text-muted-foreground">{log.details}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
