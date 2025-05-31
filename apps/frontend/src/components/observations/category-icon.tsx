import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Flower2, HelpCircle, Leaf, MoreHorizontal, TreePine } from 'lucide-react';

// Custom grasses icon component
const GrassIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
      {/* Left blade */}
      <path d="M2 15 Q2 12, 1.5 9 Q1 6, 2 3" />
      
      {/* Left-center blade */}
      <path d="M5 15 Q5.2 11, 5 8 Q4.8 5, 5.5 2" />
      
      {/* Center blade (tallest) */}
      <path d="M8 15 Q8.3 10, 8 6 Q7.7 3, 8 1" />
      
      {/* Right-center blade */}
      <path d="M11 15 Q10.8 11, 11 8 Q11.2 5, 10.5 2" />
      
      {/* Right blade */}
      <path d="M14 15 Q14 12, 14.5 9 Q15 6, 14 3" />
    </g>
  </svg>
);

// Custom bush icon component
const BushIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* Main bush body - overlapping circular shapes */}
      <circle cx="5" cy="11" r="3.5" />
      <circle cx="11" cy="11" r="3.5" />
      <circle cx="8" cy="8" r="3" />
      
      {/* Small branches/twigs sticking out */}
      <path d="M2.5 9 L1.5 8" />
      <path d="M13.5 9 L14.5 8" />
      <path d="M8 5.5 L8.5 4.5" />
    </g>
  </svg>
);

const getCategoryIcon = (listName: string) => {
  const name = listName.toLowerCase();
  
  const getIconAndTooltip = () => {
    switch (name) {
      case 'tree':
        return {
          icon: <TreePine className="w-4 h-4 text-primary-green" />,
          tooltip: 'Trees'
        };
      case 'shrub':
        return {
          icon: <BushIcon className="w-4 h-4 text-secondary-green" />,
          tooltip: 'Shrubs'
        };
      case 'grass':
        return {
          icon: <GrassIcon className="w-4 h-4 text-primary-light-grey" />,
          tooltip: 'Grasses'
        };
      case 'forb':
        return {
          icon: <Flower2 className="w-4 h-4 text-secondary-green" />,
          tooltip: 'Forbs'
        };
      case 'other':
        return {
          icon: <MoreHorizontal className="w-4 h-4 text-secondary-light-grey" />,
          tooltip: 'Others'
        };
      case 'uncategorized':
        return {
          icon: <HelpCircle className="w-4 h-4 text-primary-light-grey" />,
          tooltip: 'Uncategorized'
        };
      default:
        return {
          icon: <Leaf className="w-4 h-4 text-secondary-green" />,
          tooltip: 'Unknown Category'
        };
    }
  };

  const { icon, tooltip } = getIconAndTooltip();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { getCategoryIcon };
