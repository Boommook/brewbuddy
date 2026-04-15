"use client";
import {ArrowBigLeft} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className="button-style text-header hover:bg-transparent hover:!text-cayenne-red-950 "
      onClick={() => router.back()}
      aria-label="Go back"
    >
      <ArrowBigLeft className="size-8" />
    </Button>
  );
}