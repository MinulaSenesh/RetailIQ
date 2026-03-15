// src/pages/CustomersPage.tsx
import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import type { Customer } from "@/types";
import { formatDate, getSegmentColor } from "@/lib/formatters";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { customerService } from "@/api/customers";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomersPage() {
    const { user } = useAuth();
    const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const loadCustomers = () => {
        setLoading(true);
        api.get("/customers")
            .then(r => setCustomers(r.data.data ?? []))
            .catch(() => setCustomers([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            try {
                await customerService.delete(id);
                loadCustomers();
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete customer. Only Admins/Managers can delete.");
            }
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filtered = [...customers]
        .filter(c =>
            `${c.firstName ?? ""} ${c.lastName ?? ""} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            let valA: any = a[key as keyof Customer];
            let valB: any = b[key as keyof Customer];

            if (key === 'name') {
                valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                valB = `${b.firstName} ${b.lastName}`.toLowerCase();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    const segments = [...new Set(customers.map(c => c.segment).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground text-sm mt-1">Customer profiles and RFM segment overview</p>
                </div>
                {canEdit && (
                    <Button onClick={() => { setEditingCustomer(null); setIsDialogOpen(true); }}>
                        Add Customer
                    </Button>
                )}
            </div>

            {/* Segment summary */}
            <div className="flex flex-wrap gap-2">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-28 rounded-full" />)
                ) : (
                    segments.map(seg => (
                        <Badge key={seg} className={`px-3 py-1 text-xs font-semibold rounded-full ${getSegmentColor(seg!)}`}>
                            {seg}: {customers.filter(c => c.segment === seg).length}
                        </Badge>
                    ))
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><Users className="w-5 h-5" />Customer List</CardTitle>
                    <div className="relative ml-auto w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search name or email…" className="pl-9" value={search} onChange={(e: any) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                                    Customer <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('city')}>
                                    Location <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('segment')}>
                                    Segment <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('rfmScore')}>
                                    RFM Score <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('createdAt')}>
                                    Joined <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                {canEdit && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5} className="pl-6"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>
                            ) : (
                                filtered.map(c => {
                                    const initials = `${(c.firstName?.[0] ?? "")}${(c.lastName?.[0] ?? "")}`.toUpperCase();
                                    return (
                                        <TableRow key={c.customerId} className="hover:bg-muted/40">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.firstName} />}
                                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{c.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{c.city ?? "—"}</TableCell>
                                            <TableCell>
                                                {c.segment ? (
                                                    <Badge className={`text-xs ${getSegmentColor(c.segment)}`}>{c.segment}</Badge>
                                                ) : <span className="text-muted-foreground text-xs">—</span>}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">{c.rfmScore?.toFixed(2) ?? "—"}</TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">{c.createdAt ? formatDate(c.createdAt) : "—"}</TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Edit className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(c.customerId)}><Trash2 className="w-4 h-4" /></Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CustomerFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={loadCustomers}
                customer={editingCustomer}
            />
        </div>
    );
}
