import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button'; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Input } from '@/components/ui/input';

const PlantInfoSchema = z.object({
  plantCommonName: z.string(),
  plantScientificName: z.string().nullable(),
  isNative: z.boolean().nullable(),
  subcategory: z.string(),
});

type FormValues = z.infer<typeof PlantInfoSchema>;

export default function PlantForm({submitCallback}:{submitCallback: (open: boolean) => void}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(PlantInfoSchema),
    defaultValues: {
      plantCommonName: 'test plant',
      plantScientificName: null,
      isNative: null,
      subcategory: 'Shrub',
    },
  });

  async function onSubmit(values: FormValues) {
    const { plantCommonName, plantScientificName, isNative, subcategory } = values;
    const plantInfo = {
      plantCommonName,
      plantScientificName,
      isNative,
      subcategory,
    };
    const validation = PlantInfoSchema.safeParse(plantInfo);
    if (!validation.success) {
      alert('Please fill out all required fields');
      return;
    }

    try{
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL;

      const api_path = `${baseUrl}/plants`;
      const response = await fetch(api_path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plantInfo),
      });
      if (!response.ok) {
        throw new Error('Failed to submit plant data');
      }
      submitCallback(false);
    }catch (error) {
      console.error('Error submitting plant data:', error);
      alert('Failed to submit plant data. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="plantCommonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Common Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Enter the plant's common name in the field below</FormDescription>
                <FormControl>
                  <Input placeholder="Type your text here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plantScientificName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Scientific Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Enter plant's scientific name in the field below</FormDescription>
                <FormControl>
                  <Input placeholder="Type your text here" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isNative" // Field name in the form
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Native? <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Enter whether the plant is native</FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={value =>
                      field.onChange(value === 'Yes' ? true : value === 'No' ? false : null)
                    }
                    value={
                      field.value === true ? 'Yes' : field.value === false ? 'No' : 'Not Applicable'
                    }
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="No" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Not Applicable" />
                      </FormControl>
                      <FormLabel className="font-normal">Not Applicable</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Dropdown Select <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Choose an option from the dropdown menu</FormDescription>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory for the plant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Shrub">Shrub</SelectItem>
                    <SelectItem value="Tree">Tree</SelectItem>
                    <SelectItem value="Grass">Grass</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );

}
