"use client";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function FavoriteButton({ id }: { id: string }) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavorite = () => {
        const next = !isFavorite;
        setIsFavorite(next);
        fetch(`/api/batches/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: next }),
        })
          .then(async (res) => {
            if (!res.ok) {
              setIsFavorite(!next);
              return;
            }
            await res.json();
            router.refresh();
          })
          .catch(() => setIsFavorite(!next));
      };
    
    return (
        <Button
        variant="outline"
        className="bg-transparent border-none text-gray-200 hover:text-golden-orange-200 rounded-full
            button-style hover:bg-transparent hover:border-none p-0"
        onClick={handleFavorite}
        >
            <Star
            className={`size-6  ${isFavorite ? "fill-yellow-500" : ""}`}
        />
        </Button>
    )
}