import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
export default function FilterPlantCategory({filterCategory}:{filterCategory:string}) {
  return (
    <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>{filterCategory}</AccordionTrigger>
                <AccordionContent>
                  <ul>
                    <li>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="plant1"
                          className="mr-2"
                        />
                        <label htmlFor="plant1">Plant 1</label>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="plant2"
                          className="mr-2"
                        />
                        <label htmlFor="plant2">Plant 2</label>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
        </Accordion>
  );
}