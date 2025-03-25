import { Button } from '../button';

export function ButtonExample() {
  return (
    <div className="flex flex-col gap-6 p-4">
      
      <div className="mt-8">
        <h3 className="mb-2 text-lg">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="white">White Variant</Button>
          <Button variant="gray">Gray Variant</Button>
          <Button variant="lightGreen">Light Green Variant</Button>
          <Button variant="darkGreen">Dark Green Variant</Button>
        </div>
      </div>
      
      <div>
        <h3 className="mb-2 text-lg">Button Sizes</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="darkGreen" size="sm">Small</Button>
          <Button variant="darkGreen" size="default">Default</Button>
          <Button variant="darkGreen" size="lg">Large</Button>
        </div>
      </div>
    </div>
  );
} 