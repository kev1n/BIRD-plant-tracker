import PageHead from '@/components/PageHead';

export default function NotFound() {
  return (
    <>
      <PageHead 
        title="Page Not Found" 
        description="The page you are looking for does not exist" 
      />
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h1 className="text-5xl mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-muted-foreground">
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </>
  );
}
