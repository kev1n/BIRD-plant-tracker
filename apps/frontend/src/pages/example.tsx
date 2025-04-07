import { AlertExample } from "../components/ui/examples/AlertExample";
import { ButtonExample } from "../components/ui/examples/ButtonExample";
import { CardExample } from "../components/ui/examples/CardExample";
import { FormExample } from "../components/ui/examples/FormExample";
import { LocationDemo } from "../components/ui/location";

export default function ExamplePage() {
  return (
    <div className="space-y-8 p-4">
      <ButtonExample />
      <CardExample />
      <AlertExample />
      <FormExample />
      <LocationDemo />
    </div>
  );
} 