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
import { Observation } from 'types/database_types';
import * as z from 'zod';

const ObservationSchema = z.object({
  tempKey: z.number().optional(),
  isNew: z.boolean().optional(),
  modified: z.boolean().optional(),
  observationID: z.number().optional(),
  snapshotID: z.number().optional(),
  PlantInfo: z.object({
    plantID: z.number().optional(),
    plantCommonName: z.string().min(1, { message: 'Common name is required' }),
    plantScientificName: z.string().nullable(),
    isNative: z.boolean().nullable(),
    subcategory: z.string().min(1, { message: 'Subcategory is required' }),
  }),
  plantQuantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  datePlanted: z.date().nullable(),
  dateBloomed: z.date().nullable(),
  hasBloomed: z.boolean().nullable(),
  deletedOn: z.date().nullable(),
});

export default function ObservationForm({observation, submissionCallBack}: {observation?:Observation, submissionCallBack: (observation:Observation) => void }) {
  const form = useForm({
    resolver: zodResolver(ObservationSchema),
    defaultValues: {
      tempKey: observation?.tempKey || -1,
      isNew: observation?.isNew || true,
      modified: observation?.modified || false,
      observationID: observation?.observationID || -1,
      snapshotID: observation?.snapshotID || -1,
      PlantInfo: {
        plantID: observation?.PlantInfo?.plantID || -1,
        plantCommonName: observation?.PlantInfo?.plantCommonName || '',
        plantScientificName: observation?.PlantInfo?.plantScientificName || null,
        isNative: observation?.PlantInfo?.isNative || null,
        subcategory: observation?.PlantInfo?.subcategory || '',
      },
      plantQuantity: observation?.plantQuantity || 1,
      datePlanted: observation?.datePlanted || null,
      dateBloomed: observation?.dateBloomed || null,
      hasBloomed: observation?.hasBloomed || null,
      deletedOn: observation?.deletedOn || null,
    },
  });

  const onSubmit = (data: Observation) => {
    console.log('Submitted', data);
    submissionCallBack(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
       
      </form>
    </Form>
  );
}
