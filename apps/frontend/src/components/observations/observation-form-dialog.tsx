import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datepicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Observation } from 'types/database_types';

export default function PlantObservationFormDialog({ newPlant,
  addObservationCallback
}: {
  newPlant: boolean;
  addObservationCallback: (observation: Observation) => void;
}) {
  const [open, setopen] = useState(false);

  const form = useForm<Observation>({
    defaultValues: {
      commonName: '',
      scientificName: '',
      plantType: 'tree',
      datePlanted: null,
      dateBloomed: null,
      quantity: null,
      soilType: 'soil',
      native: false,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const onSubmit = (data: Observation) => {
    console.log('Submitted', data);
    setopen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newPlant ? 'New Plant' : 'Editing Plant'}</Button>
      </DialogTrigger>

      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          {newPlant ? (
            <DialogTitle>New Plant</DialogTitle>
          ) : (
            <DialogTitle>Editing Plant</DialogTitle>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name</FormLabel>
                  <FormControl>
                    <Input placeholder="enter plant's common name here" {...field} />
                  </FormControl>
                  <FormDescription>This is the common name of the plant.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scientificName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter plant's scientific name here"
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
                      placeholder="enter quantity here"
                      value={field.value || ''}
                      onChange={e =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : null)
                      }
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
      </DialogContent>
    </Dialog>
  );
}
