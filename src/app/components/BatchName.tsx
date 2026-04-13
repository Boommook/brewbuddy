'use client'
import {useState, useEffect} from "react";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import EditBatchName from "./EditBatchName";

export default function BatchName({ batchId }: { batchId: string }) {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const getBatchName = async (batchId: string) => {
    try {
        const res = await fetch(`/api/batches/${batchId}/name`, {
            method: "GET",
        });
  
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error ?? "Failed to get batch name");
        }
        return data.name;
    } catch (error) {
        console.error(error);
        return "";
    }
  }
  
  useEffect(() => {
    getBatchName(batchId).then(setName);
  }, [batchId]);

  return (
    <div className="flex flex-col items-center justify-center">
        {isEditing ? (
            <EditBatchName batchId={batchId} setIsEditing={setIsEditing} name={name} setName={setName} />
        ) : (
            <div className="flex flex-row items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-harvest-orange-900">
                    {name || "…"}
                </h1>
                <Button onClick={() => setIsEditing(true)} className="edit-button">
                    <Pencil className="size-4" />
                </Button>
            </div>
                
        )}
        <hr className="border-cayenne-red-700 border-2 w-full mt-1" />
    </div>
  );
}