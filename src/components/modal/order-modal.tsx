"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderForm } from "@/components/forms/order-form";
import { orderFormSchema } from "@/lib/zod-schema";
import { useOrderModal } from "@/hooks/use-order-modal";
import { trpc } from "@/lib/trpc";

export const OrderModal = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose, isOpen, isEdit, order } = useOrderModal();
  const utils = trpc.useUtils();

  const createMutation = trpc.order.create.useMutation({
    onSuccess: () => {
      utils.order.getAll.invalidate();
    },
  });

  const updateMutation = trpc.order.update.useMutation({
    onSuccess: () => {
      utils.order.getAll.invalidate();
    },
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        // Materials are already converted to array in OrderForm
        if (isEdit && order) {
          await updateMutation.mutateAsync({
            id: order.id,
            ...data,
          });
          toast.success("Order updated successfully");
        } else {
          await createMutation.mutateAsync(data);
          toast.success("Order created successfully");
        }
        onClose();
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  // Convert order data to form default values
  const defaultValues = order
    ? {
        clientName: order.clientName,
        clientProject: order.clientProject || undefined,
        productName: order.productName,
        quantity: order.quantity,
        size: order.size || undefined,
        description: order.description || undefined,
        materials: order.materials?.join(", ") || undefined,
        deliveryDate: order.deliveryDate || undefined,
        deliveryAddress: order.deliveryAddress || undefined,
        notes: order.notes || undefined,
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Order" : "Create New Order"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the order details below"
              : "Fill in the form to create a new order"}
          </DialogDescription>
        </DialogHeader>
        {/* Order Form */}
        <OrderForm onSubmit={onSubmit} defaultValues={defaultValues} />
        <DialogFooter>
          <Button disabled={isPending} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending} form="order-form">
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
