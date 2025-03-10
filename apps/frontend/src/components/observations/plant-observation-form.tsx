import { PlantInformation } from 'types/observations';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"; // Assuming you have a Select component
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "@/components/ui/datepicker";
import { set } from 'date-fns';

export default function PlantObservationForm(
  { newPlant, plantData }: { newPlant: boolean, plantData?: PlantInformation[] },
) {
  const [open, setopen] = useState(false);

  const form = useForm();
  const onSubmit = (data: any) => {
    console.log("Submitted", data);
    setopen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {newPlant ? "New Plant" : "Editing Plant"}
        </Button>
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
              name="Common Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name</FormLabel>
                  <FormControl>
                    <Input placeholder="enter plant's common name here" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the common name of the plant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Scientific Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Name</FormLabel>
                  <FormControl>
                    <Input placeholder="enter plant's scientific name here" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the scientific name of the plant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Plant Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue="Please Select a Plant Type" value={field.value}>
                    <SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tree">Tree</SelectItem>
                        <SelectItem value="shrub">Shrub</SelectItem>
                        <SelectItem value="grass">Grass</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                  <FormDescription>
                    Select the type of plant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Date Planted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Planted</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormDescription>
                    Select the date the plant was planted.
                  </FormDescription>
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
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormDescription>
                    Select the date the plant bloomed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input placeholder="enter quantity here" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the quantity of the plant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Soil Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sand">Sand</SelectItem>
                        <SelectItem value="soil">Soil</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                  <FormDescription>
                    Select the soil type of the plant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Native"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Native</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                  <FormDescription>
                    Select if the plant is native.
                  </FormDescription>
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
