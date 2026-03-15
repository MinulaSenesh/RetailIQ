// CategoryCombobox.tsx — searchable dropdown with custom category creation
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Search } from "lucide-react";
import { Category } from "@/types";
import api from "@/lib/api";

interface CategoryComboboxProps {
    categories: Category[];
    value: number;      // currently selected categoryId (0 = none)
    onChange: (id: number, name: string) => void;
    onCategoryCreated: (cat: Category) => void;
    error?: boolean;
}

export function CategoryCombobox({ categories, value, onChange, onCategoryCreated, error }: CategoryComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCat = categories.find(c => c.categoryId === value);
    const displayText = selectedCat ? selectedCat.name : "Select a Category...";

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const exactMatch = categories.some(c =>
        c.name.toLowerCase() === search.toLowerCase()
    );

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSelect = (cat: Category) => {
        onChange(cat.categoryId, cat.name);
        setOpen(false);
        setSearch("");
    };

    const handleCreate = async () => {
        if (!search.trim()) return;
        setCreating(true);
        try {
            const { data } = await api.post<{ data: Category }>("/categories", { name: search.trim() });
            const newCat = data.data;
            onCategoryCreated(newCat);
            onChange(newCat.categoryId, newCat.name);
            setOpen(false);
            setSearch("");
        } catch {
            // silently ignore
        } finally {
            setCreating(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => { setOpen(o => !o); }}
                className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors
                    ${error ? "border-destructive" : "border-input"}
                    bg-background text-foreground hover:bg-accent hover:text-accent-foreground`}
            >
                <span className={value === 0 ? "text-muted-foreground" : "text-foreground"}>
                    {displayText}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
                    {/* Search input */}
                    <div className="flex items-center border-b border-border px-3 py-2 gap-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search or type new category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !exactMatch && search.trim()) handleCreate(); }}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        />
                    </div>

                    {/* Category list */}
                    <div className="max-h-48 overflow-y-auto py-1">
                        {filtered.length === 0 && !search && (
                            <p className="px-3 py-2 text-sm text-muted-foreground">No categories found.</p>
                        )}
                        {filtered.map(cat => (
                            <button
                                key={cat.categoryId}
                                type="button"
                                onClick={() => handleSelect(cat)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <Check className={`h-4 w-4 flex-shrink-0 ${cat.categoryId === value ? "opacity-100 text-primary" : "opacity-0"}`} />
                                {cat.name}
                            </button>
                        ))}

                        {/* Create new option */}
                        {search.trim() && !exactMatch && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-primary hover:bg-primary/10 transition-colors border-t border-border mt-1"
                            >
                                <Plus className="h-4 w-4 flex-shrink-0" />
                                {creating ? "Creating..." : <>Create <strong>"{search.trim()}"</strong></>}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
