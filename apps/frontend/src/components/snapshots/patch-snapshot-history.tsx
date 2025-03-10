import { useState } from "react";
import SnapshotRecord from "./snapshot-record";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export default function PatchSnapshotHistory( {patchLabel}: {patchLabel: string}) {
  const [dates, setDates] = useState<Date[]>([
    new Date("2024-04-15"),
    new Date("2024-04-10"),
    new Date("2024-05-01"),
    new Date("2024-04-20"),
  ]);
  return(
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Patch Snapshot History for {patchLabel}</DialogTitle>
        </DialogHeader>
        {dates.map((date) => (
          <SnapshotRecord snapshotDate={date} key={date.toString()} />
        ))}
      </DialogContent>
    </Dialog>

  )
}
  