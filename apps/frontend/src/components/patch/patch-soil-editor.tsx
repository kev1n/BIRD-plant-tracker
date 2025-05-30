import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const patchSoilSchema = z.object({
  soilType: z.enum(["sand", "sandy loam", "pond"]),
});

type FormValues = z.infer<typeof patchSoilSchema>;

export default function PatchSoilEditor({
  patchID,
  updateCallback,
  trigger,
}: {
  patchID: string;
  updateCallback: (soilType: string) => void;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(patchSoilSchema),
    defaultValues:{
    }
  });

  async function onSubmit(values: FormValues) {

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const api_path = `${baseUrl}/patch/${patchID}`;
      const response = await fetch(api_path, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          soilType: values.soilType,
        }),
      });
      if (response.ok) {
        updateCallback(values.soilType);
        setOpen(false);
        toast.success('Soil type updated successfully');
      } else {
        toast.error('Error updating soil type');
      }
    } catch (error) {
      toast.error('Error updating soil type: ' + error);
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="ml-3 p-2 h-full">
      <img src="/icons/pen.svg" alt="Edit" className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Soiltype for Patch {patchID}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
          onSubmit={
            form.handleSubmit(onSubmit)
          }
          >
            <div>
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Dropdown Select</FormLabel>
                    <FormDescription>Choose an option from the dropdown menu</FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="max-w-[400px]">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a soil type for the patch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sand">Sand</SelectItem>
                        <SelectItem value="sandy loam">Sandy Loam</SelectItem>
                        <SelectItem value="pond">Pond</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              className="flex justify-between items-center mt-4">

            <Button
              variant="outline"
              onClick={() => {
                form.reset({})
                setOpen(false);
              }
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
        
            >
              Save
            </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
