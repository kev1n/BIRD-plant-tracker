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
  actionName: string,
  title: string,
  prompt: string,
  color: string,
  onConfirm: () => void
}

// represents one menu item in the spreadsheet view row dropdown menu
export default function SpreadsheetRowActionItem(props: ActionItemProps) {

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            className={`w-full text-left hover:shadow-lg 
              ${props.color === "red" ? "bg-[#BB0030] hover:bg-[#800000]" : ""}`}
          >
            {props.actionName}
          </Button>
        </AlertDialogTrigger>  

        <AlertDialogContent>
          <AlertDialogHeader>
            <h2 className="text-lg font-semibold">{props.title}</h2>
            <p className="text-sm text-gray-600">
              {props.prompt}
            </p>
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
