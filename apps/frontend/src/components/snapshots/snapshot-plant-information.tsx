
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {PlantInformation} from "../../../types/observations";
import PlantObservation from "@/components/observations/plant-observation";
import { Button } from "../ui/button";
import PlantObservationForm from "../observations/plant-observation-form";

export default function SnapshotPlantInformation( 
    {treeData, shrubData, grassData, otherData, editingButtons}: {treeData?: PlantInformation[], shrubData?: PlantInformation[], grassData?: PlantInformation[], otherData?: PlantInformation[], editingButtons: boolean},
) {
  return(
    <div>
    <h1>
        Plants
    </h1>
    <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
      {editingButtons && 
      <PlantObservationForm newPlant={true} />
      }
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Trees</AccordionTrigger>
                <AccordionContent>
                
                  {treeData &&treeData.map((tree, index) => (
                    <PlantObservation key={index} plantInfo={tree}  editingButtons={editingButtons} />
                  ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-2">
                <AccordionTrigger>Shrubs</AccordionTrigger>
                <AccordionContent>

                  {shrubData &&shrubData.map((shrub, index) => (
                    <PlantObservation key={index} plantInfo={shrub} editingButtons={editingButtons} />
                  ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-3">
                <AccordionTrigger>Grass</AccordionTrigger>
                <AccordionContent>
                  {grassData &&grassData.map((grass, index) => (
                    <PlantObservation key={index} plantInfo={grass}  editingButtons={editingButtons} />
                  ))}
                  
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-4">
                <AccordionTrigger>Other</AccordionTrigger>
                <AccordionContent>
                  {otherData && otherData.map((other, index) => (
                    <PlantObservation key={index} plantInfo={other} editingButtons={editingButtons} />
                  ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
</div>
  );
}