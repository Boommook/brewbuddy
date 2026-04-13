import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { updateBatchName } from "@/src/server/batches";

export default function EditBatchName({batchId, setIsEditing, name, setName}: {batchId: string, setIsEditing: (isEditing: boolean) => void, name: string, setName: (name: string) => void}) {
    const handleSubmit = async () => {
        try {
            const res = await fetch(`/api/batches/${batchId}/name`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name })
            });
            if (!res.ok) {
                throw new Error("Failed to update batch name");
            }
            setName(name);
        } catch (error) {
            console.error(error);
        } finally {
            setIsEditing(false);
        }
    }

    return (
        <div className="flex flex-row items-center justify-center gap-2">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter batch name"
                className="auth-input-style text-2xl font-semibold text-harvest-orange-900"
            />
            <Button onClick={handleSubmit} className="edit-button">
                <Check className="size-4" />
            </Button>
        </div>
    )
}