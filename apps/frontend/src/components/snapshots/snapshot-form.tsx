import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/datepicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { PlantInformation } from "types/observations";
import SnapshotPlantInformation from "./snapshot-plant-information";

interface SnapshotFormProps {
    newSnapshot: boolean;
    patchLabel: string;
    latest_date?: Date;
    latest_author?: string;
    latest_notes?: string;
    treeData?: PlantInformation[];
    shrubData?: PlantInformation[];
    grassData?: PlantInformation[];
    otherData?: PlantInformation[];
}

const SnapshotForm: React.FC<SnapshotFormProps> = ({
    newSnapshot,
    patchLabel,
    latest_date,
    latest_notes,
    treeData,
    shrubData,
    grassData,
    otherData,
}) => {
    const [open, setOpen] = useState(false);
    function onSubmit() {
        console.log("Submitted");
        setOpen(false);
    };

    const [date, setDate] = useState<Date>(latest_date ? latest_date : new Date());

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    {newSnapshot ? "New Snapshot" : "Editing Snapshot"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex flex-row justify-between">
                        <div className="flex-1 text-left">
                            <DialogTitle>Patch {patchLabel}</DialogTitle>
                        </div>
                        <div className="flex-1 text-right">
                            Snapshot Date:
                            <DatePicker date={date} setDate={setDate} />
                        </div>
                    </div>
                </DialogHeader>

                <SnapshotPlantInformation
                    treeData={treeData}
                    shrubData={shrubData}
                    grassData={grassData}
                    otherData={otherData}
                    editingButtons={true}
                />
                <div className="border border-gray-300 rounded-lg p-4">
                    <textarea
                        className="w-full h-24"
                        placeholder={latest_notes ? latest_notes : "Add notes here..."}
                    />
                </div>

                <div className="flex flex-row justify-between">
                    <div className="flex-1 text-left">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                    <div className="flex-1 text-right">
                        <Button variant="outline" onClick={onSubmit}>
                            Submit
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default SnapshotForm;
