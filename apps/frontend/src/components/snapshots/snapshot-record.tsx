import { Button } from "@/components/ui/button";
export default function SnapshotRecord(
    {snapshotDate}: {snapshotDate: Date},
) {
    return(
      // return a div with date, edit, delete, and view buttons in one row
      <div className="flex flex-row justify-between">
        <div className="flex-1 text-left">
          {snapshotDate.toLocaleDateString()}
        </div>
        <div className="flex-1 text-right">
          {/* put four buttons side by side: view, edit, duplicate, delete */}
          <div className="flex flex-row justify-end space-x-2">
            <Button variant="outline">View</Button>
            <Button variant="outline">Edit</Button>
            <Button variant="outline">Duplicate</Button>
            <Button variant="outline">Delete</Button>
          </div>
        </div>
      </div>
        
    )

}
