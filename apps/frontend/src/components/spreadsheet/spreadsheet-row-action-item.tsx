import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogCancel, 
  AlertDialogAction, 
  AlertDialogFooter 
} from '@/components/ui/alert-dialog';

interface ActionItemProps {
  actionName: string
  prompt: string,
  onConfirm: () => void
}

// represents one menu item in the spreadsheet view row dropdown menu
export default function SpreadsheetRowActionItem(props: ActionItemProps) {

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full text-left">{props.actionName}</Button>
        </AlertDialogTrigger>  

        <AlertDialogContent>
          <AlertDialogHeader>
            {props.prompt}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={() => props.onConfirm()}>
              Confirm
            </AlertDialogAction>

          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>            
    </DropdownMenuItem> 
  )
}
