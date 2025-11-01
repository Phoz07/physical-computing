import { Card } from "@/components/ui/card";
import Weather from "./_components/Weather";
import LogTable from "./_components/LogTable";

export default function Home() {
  return (
    <div className="w-full flex justify-center">
      <div className="container flex flex-col gap-4 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="aspect-video w-225 max-w-full"></Card>
          <Card className="flex-1 flex items-start lg:items-end p-6">
            <Weather />
          </Card>
        </div>
        <Card className="p-6">
          <LogTable />
        </Card>
      </div>
    </div>
  );
}
