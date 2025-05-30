import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Observation } from '../../../types/database_types';
import { getCategoryIcon } from './category-icon';
import ObservationItem from './observation-item';

export default function ObservationsList({
  observations,
  listName,
  subCategory,
  editing,
}: {
  observations: Observation[];
  listName: string;
  subCategory: string;
  editing: boolean;
}) {
  if (observations.length === 0) {
    return null; // Don't render empty categories
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getCategoryIcon(subCategory)}
              <span className="font-medium">{listName}</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium`}
            >
              {observations.length}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-0">
            {observations.map((observation, index) => (
              <ObservationItem key={index} observation={observation} editing={editing} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
