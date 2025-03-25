import { Alert, AlertDescription, AlertTitle } from "../alert";

export function AlertExample() {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-4xl">ALERTS</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Gray alerts (left column) */}
        <div className="space-y-4">
          {/* Alert with title */}
          <Alert 
            variant="gray" 
            onClose={() => console.log("Gray alert with title closed")}
          >
            <InfoIcon />
            <AlertTitle>This is a title</AlertTitle>
            <AlertDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
              sint. Velit officia con.
            </AlertDescription>
          </Alert>

          {/* Alert with long title */}
          <Alert 
            variant="gray"
            onClose={() => console.log("Gray alert with long title closed")}
          >
            <InfoIcon />
            <AlertTitle>This is an extra loooooooooooooooooooooong title</AlertTitle>
          </Alert>

          {/* Alert with no title, only description */}
          <Alert 
            variant="gray"
            onClose={() => console.log("Gray alert with no title closed")}
          >
            <InfoIcon />
            <AlertDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
              sint. Velit officia con.
            </AlertDescription>
          </Alert>
        </div>

        {/* Green alerts (right column) */}
        <div className="space-y-4">
          {/* Alert with title */}
          <Alert 
            variant="green"
            onClose={() => console.log("Green alert with title closed")}
          >
            <WarningIcon />
            <AlertTitle>This is a title</AlertTitle>
            <AlertDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
              sint. Velit officia con.
            </AlertDescription>
          </Alert>

          {/* Alert with long title */}
          <Alert 
            variant="green"
            onClose={() => console.log("Green alert with long title closed")}
          >
            <WarningIcon />
            <AlertTitle>This is an extra loooooooooooooooooooooong title</AlertTitle>
          </Alert>

          {/* Alert with no title, only description */}
          <Alert 
            variant="green"
            onClose={() => console.log("Green alert with no title closed")}
          >
            <WarningIcon />
            <AlertDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
              sint. Velit officia con.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-dark-grey text-white">
      <span className="text-xs font-bold">i</span>
    </div>
  );
}

function WarningIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-dark-grey text-white">
      <span className="text-xs font-bold">!</span>
    </div>
  );
} 