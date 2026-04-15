"use client";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrashButton({ id }: { id: string }) {
    const router = useRouter();
    const handleDelete = () => {
        fetch(`/api/batches/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
        .then(() => router.refresh());
      };

    return (
        <Button variant="outline" className="bg-transparent border-none text-gray-200 rounded-full
                 button-style hover:bg-transparent hover:border-none p-0 hover:text-red-700"
            onClick={handleDelete}
            >
        <Trash2 className="size-6 " />
        </Button>
    )
}