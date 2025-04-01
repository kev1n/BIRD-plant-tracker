import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datepicker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Observation } from 'types/observations';
import * as z from 'zod';

// Define the validation schema with Zod
const ObservationSchema = z.object({
  commonName: z.string().min(1, 'Common name is required'),
  scientificName: z.string().min(1, 'Scientific name is required'),
  plantType: z.enum(['tree', 'shrub', 'grass', 'other']),
  native: z.boolean().nullable(),
  dateBloomed: z.date().nullable(),
  datePlanted: z.date().nullable(),
  quantity: z.number().nullable(),
  soilType: z.enum(['sand', 'soil', 'other']),
});

export default function PlantObservationForm({ onSubmitSuccess }: { onSubmitSuccess: () => void }) {
  const form = useForm({
    resolver: zodResolver(ObservationSchema),
  });

  const onSubmit = (data: Observation) => {
    console.log('Submitted', data);

    onSubmitSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="commonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Common Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter plant's common name here" {...field} />
              </FormControl>
              <FormDescription>This is the common name of the plant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Scientific Name Field */}
        <FormField
          control={form.control}
          name="scientificName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scientific Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter plant's scientific name here"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>This is the scientific name of the plant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plantType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plant Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tree">Tree</SelectItem>
                    <SelectItem value="shrub">Shrub</SelectItem>
                    <SelectItem value="grass">Grass</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <FormDescription>Select the type of plant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="datePlanted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Planted</FormLabel>
              <DatePicker date={field.value || null} setDate={field.onChange} />
              <FormDescription>Select the date the plant was planted.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateBloomed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Bloomed</FormLabel>
              <DatePicker date={field.value || null} setDate={field.onChange} />
              <FormDescription>Select the date the plant bloomed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter quantity here"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>This is the quantity of the plant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="soilType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soil Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sand">Sand</SelectItem>
                    <SelectItem value="soil">Soil</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <FormDescription>Select the soil type of the plant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="native"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Native</FormLabel>
              <Select
                onValueChange={value => field.onChange(value === 'true')}
                value={field.value?.toString() || 'false'}
              >
                <SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <FormDescription>Select if the plant is native.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
