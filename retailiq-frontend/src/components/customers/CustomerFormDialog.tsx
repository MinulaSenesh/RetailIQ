import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { customerService } from "@/api/customers";

const customerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().min(2, "Country is required"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: Customer | null;
}

export function CustomerFormDialog({ isOpen, onClose, onSuccess, customer }: CustomerFormDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            city: "",
            country: "Sri Lanka",
        },
    });

    useEffect(() => {
        if (customer) {
            reset({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone || "",
                city: customer.city || "",
                country: customer.country || "Sri Lanka",
            });
        } else {
            reset({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                city: "",
                country: "Sri Lanka",
            });
        }
    }, [customer, reset, isOpen]);

    if (!isOpen) return null;

    const onSubmit = async (data: CustomerFormValues) => {
        try {
            if (customer) {
                await customerService.update(customer.customerId, data);
            } else {
                await customerService.create(data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Failed to save customer. Check console.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto slide-in-from-bottom-4 animate-in">
                <h2 className="text-xl font-bold mb-4">{customer ? "Edit Customer" : "Add New Customer"}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register("firstName")} />
                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register("lastName")} />
                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register("phone")} />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register("city")} />
                            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...register("country")} />
                            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Customer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
