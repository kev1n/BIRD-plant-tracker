import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// patch is a string
export default function PatchView(
    {patch}: {patch: string}
) {

    const [latest_date, setLatestDate] = useState(new Date());
    const [latest_author, setLatestAuthor] = useState("Joe");
    const [latest_notes, setLatestNotes] = useState("These are the latest notes");

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
        <div className="flex flex-row justify-between">
            <div className="flex-1 text-left">
                <DialogTitle>Patch {patch}</DialogTitle>
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
        <div>
            <h1>
                Plants
            </h1>
            {/* make this div with a certain max height */}
            <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Trees</AccordionTrigger>
                        <AccordionContent>
                            <p>Tree 1</p>
                            <p>Tree 2</p>
                            <p>Tree 3</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Shrubs</AccordionTrigger>
                        <AccordionContent>
                            <p>Shrub 1</p>
                            <p>Shrub 2</p>
                            <p>Shrub 3</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Grass</AccordionTrigger>
                        <AccordionContent>
                            <p>Grass 1</p>
                            <p>Grass 2</p>
                            <p>Grass 3</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Other</AccordionTrigger>
                        <AccordionContent>
                            <p>Other 1</p>
                            <p>Other 2</p>
                            <p>Other 3</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
        

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
                <Button variant="outline">
                    New Record
                </Button>
            </div>

            <div>
                <Button variant="outline">
                    History
                </Button>
            </div>

        </div>



      </DialogContent>
    </Dialog>
  );
}
