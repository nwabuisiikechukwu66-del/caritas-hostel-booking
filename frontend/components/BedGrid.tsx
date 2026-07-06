"use client";

import { BedSingle } from "lucide-react";
import type { Room, Bed } from "@/lib/types";

interface BedGridProps {
  rooms: Room[];
  selectedBedId?: string;
  onSelectBed: (bed: Bed, room: Room) => void;
}

const bedStyles: Record<string, string> = {
  vacant: "border-success/40 bg-success-bg text-success hover:border-success cursor-pointer",
  occupied: "border-border bg-surface-subtle text-ink-faint cursor-not-allowed",
  reserved: "border-warning/40 bg-warning-bg text-warning cursor-not-allowed",
};

export function BedGrid({ rooms, selectedBedId, onSelectBed }: BedGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rooms.map((room) => (
        <div key={room.id} className="rounded-lg border border-border bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">{room.code}</span>
            <span className="text-xs text-ink-muted capitalize">{room.facing}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {room.beds
              .slice()
              .sort((a, b) => a.bed_slot - b.bed_slot)
              .map((bed) => {
                const isSelected = bed.id === selectedBedId;
                return (
                  <button
                    key={bed.id}
                    type="button"
                    disabled={bed.status !== "vacant"}
                    onClick={() => onSelectBed(bed, room)}
                    aria-label={`Bed ${bed.bed_slot} in room ${room.code}, ${bed.status}`}
                    className={`flex flex-col items-center gap-1 rounded border py-2 text-xs transition-colors
                      ${bedStyles[bed.status]} ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  >
                    <BedSingle size={16} aria-hidden="true" />
                    {bed.bed_slot}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
