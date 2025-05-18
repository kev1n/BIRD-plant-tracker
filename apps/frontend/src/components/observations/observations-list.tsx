import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ObservationItem from './observation-item';
import { Observation } from '../../../types/database_types';
export default function ObservationsList({
  observations,
  listName,
  editing,
}: {
  observations: Observation[];
  listName: string;
  editing: boolean;
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          {listName} [{observations.length}]
        </AccordionTrigger>
        <AccordionContent>
          {observations.map((observation, index) => (
            <ObservationItem key={index} observation={observation} editing={editing} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
