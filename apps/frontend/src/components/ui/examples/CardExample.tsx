import { Card, CardButton, CardDescription, CardHeader, CardImage, CardTitle } from "../card";

export function CardExample() {
  return (
    <>
      <h2 className="mb-4 text-4xl">CARDS</h2>
      <div className="flex gap-8">
        <Card className="w-[400px]">
          <CardImage 
            src="/mountain-image.jpg" 
            alt="Mountain landscape with river and sunset"
          />
          <CardHeader>
            <CardTitle>This is a header</CardTitle>
            <CardDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
            </CardDescription>
            <CardButton>Button</CardButton>
          </CardHeader>
        </Card>
        <div>

        
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>This is a header</CardTitle>
            <CardDescription>
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
            </CardDescription>
            <CardButton>Button</CardButton>
          </CardHeader>
        </Card>
      </div>
      </div>
    </>
  );
}