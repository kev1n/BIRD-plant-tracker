import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Flower2, HelpCircle, Leaf, MoreHorizontal, TreePine, Wheat } from 'lucide-react';
import { Observation } from '../../../types/database_types';
import ObservationItem from './observation-item';

const getCategoryIcon = (listName: string) => {
  const name = listName.toLowerCase();
  switch (name) {
    case 'trees':
      return <TreePine className="w-4 h-4 text-green-600" />;
    case 'shrubs':
      return <Leaf className="w-4 h-4 text-emerald-600" />;
    case 'grasses':
      return <Wheat className="w-4 h-4 text-amber-600" />;
    case 'forbs':
      return <Flower2 className="w-4 h-4 text-pink-600" />;
    case 'others':
      return <MoreHorizontal className="w-4 h-4 text-slate-600" />;
    case 'uncategorized':
      return <HelpCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <Leaf className="w-4 h-4 text-green-600" />;
  }
};

export default function ObservationsList({
  observations,
  listName,
  editing,
}: {
  observations: Observation[];
  listName: string;
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
              {getCategoryIcon(listName)}
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
