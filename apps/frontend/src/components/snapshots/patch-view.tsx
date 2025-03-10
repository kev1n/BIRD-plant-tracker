import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { PlantInformation } from "../../../types/observations";
import PatchSnapshotHistory from "./patch-snapshot-history";
import SnapshotForm from "./snapshot-form";
import SnapshotPlantInformation from "./snapshot-plant-information";
// patch is a string
export default function PatchView(
    { patchInfo }: { patchInfo: { row: number, col: number, label: string } },
) {

    const [latest_date] = useState(new Date());
    const [latest_author] = useState("Joe");
    const [latest_notes] = useState("These are the latest notes");

    // TODO: FILL WITH API DATA
    const treeData: PlantInformation[] = [
        {
            commonName: "Oak",
            scientificName: "Quercus robur",
            native: true,
            dateBloomed: new Date("2024-04-15"),
            datePlanted: new Date("2010-05-20"),
            quantity: 5,
            soilType: "Loamy",
        },
        {
            commonName: "Maple",
            scientificName: "Acer saccharum",
            native: true,
            dateBloomed: new Date("2024-04-10"),
            datePlanted: new Date("2015-08-05"),
            quantity: 10,
            soilType: "Silty",
        },
    ];

    const shrubData: PlantInformation[] = [
        {
            commonName: "Rose",
            scientificName: "Rosa rubiginosa",
            native: false,
            dateBloomed: new Date("2024-05-01"),
            datePlanted: new Date("2018-03-15"),
            quantity: 15,
            soilType: "Sandy",
        },
        {
            commonName: "Holly",
            scientificName: "Ilex aquifolium",
            native: true,
            dateBloomed: new Date("2024-04-20"),
            datePlanted: new Date("2012-06-10"),
            quantity: 8,
            soilType: "Clay",
        },
    ];

    const grassData: PlantInformation[] = [
        {
            commonName: "Bermudagrass",
            scientificName: "Cynodon dactylon",
            native: false,
            dateBloomed: new Date("2024-05-10"),
            datePlanted: new Date("2019-07-25"),
            quantity: 20,
            soilType: "Sandy",
        },
        {
            commonName: "Fescue",
            scientificName: "Festuca arundinacea",
            native: true,
            dateBloomed: new Date("2024-04-30"),
            datePlanted: new Date("2017-09-05"),
            quantity: 12,
            soilType: "Loamy",
        },
    ];

    const otherData: PlantInformation[] = [
        {
            commonName: "Cactus",
            scientificName: "Cactaceae",
            native: false,
            dateBloomed: new Date("2024-06-01"),
            datePlanted: new Date("2021-10-10"),
            quantity: 3,
            soilType: "Sandy",
        },
        {
            commonName: "Succulent",
            scientificName: "Crassulaceae",
            native: true,
            dateBloomed: new Date("2024-05-15"),
            datePlanted: new Date("2020-11-20"),
            quantity: 6,
            soilType: "Loamy",
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Click here for more information</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex flex-row justify-between">
                        <div className="flex-1 text-left">
                            <DialogTitle>Patch {patchInfo.label}</DialogTitle>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="mr-5">
                                <h1>
                                    Accurate as of {latest_date.toLocaleDateString()}
                                </h1>
                                <h1>
                                    By: {latest_author}
                                </h1>
                            </div>
                        </div>
                    </div>

                </DialogHeader>


                <SnapshotPlantInformation treeData={treeData} shrubData={shrubData} grassData={grassData} otherData={otherData} editingButtons={false} />
                <div>
                    <h1>
                        Notes
                    </h1>

                    <div className="border border-gray-300 rounded-lg p-4">
                        <p>
                            {latest_notes}
                        </p>
                    </div>
                </div>

                <div className="flex flex-row justify-between">
                    <div className="flex-1 text-left">
                        <SnapshotForm newSnapshot={true} patchLabel={patchInfo.label} />
                    </div>
                    <div>
                        <PatchSnapshotHistory patchLabel={patchInfo.label} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
