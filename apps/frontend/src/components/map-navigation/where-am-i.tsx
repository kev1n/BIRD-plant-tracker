import {Button} from '@/components/ui/button';
export default function WhereAmI() {
  return (
    <div className="p-4 bg-white rounded shadow-md z-12">
      <h2 className="text-lg font-bold">Where Am I?</h2>
      <p className="text-sm text-gray-600">According to your GPS</p>
      <p className="text-sm text-gray-600">you are standing on:</p>
      <p className="text-sm text-gray-600">Patch: [Your Patch]</p>
      <Button>Inspect Patch</Button>
    </div>
  );
}