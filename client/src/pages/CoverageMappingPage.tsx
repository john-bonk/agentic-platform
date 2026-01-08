import { AppLayout, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Building2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CoverageEntity {
  id: string;
  name: string;
  region: string;
  type: string;
  status: "mapped" | "pending" | "new";
  controls: number;
}

const coverageEntities: CoverageEntity[] = [
  { id: "1", name: "Singapore HQ", region: "Asia-Pacific", type: "Headquarters", status: "new", controls: 12 },
  { id: "2", name: "Singapore R&D Center", region: "Asia-Pacific", type: "Research Facility", status: "new", controls: 8 },
  { id: "3", name: "Singapore Distribution Hub", region: "Asia-Pacific", type: "Distribution", status: "pending", controls: 15 },
  { id: "4", name: "Singapore Manufacturing", region: "Asia-Pacific", type: "Manufacturing", status: "new", controls: 22 },
  { id: "5", name: "US Corporate HQ", region: "North America", type: "Headquarters", status: "mapped", controls: 45 },
  { id: "6", name: "EU Regional Office", region: "Europe", type: "Regional Office", status: "mapped", controls: 28 },
];

export default function CoverageMappingPage() {
  const getStatusBadge = (status: CoverageEntity["status"]) => {
    switch (status) {
      case "mapped":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Mapped</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "new":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"><AlertCircle className="w-3 h-3 mr-1" />New</Badge>;
    }
  };

  const newEntities = coverageEntities.filter(e => e.status === "new").length;
  const pendingEntities = coverageEntities.filter(e => e.status === "pending").length;
  const mappedEntities = coverageEntities.filter(e => e.status === "mapped").length;

  return (
    <AppLayout>
      <PageHeader
        title="Coverage Mapping"
        description="Audit coverage mapping for Singapore acquisition integration"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{coverageEntities.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{newEntities}</p>
                  <p className="text-sm text-muted-foreground">New Entities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pendingEntities}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{mappedEntities}</p>
                  <p className="text-sm text-muted-foreground">Fully Mapped</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#266C92]" />
              Entity Coverage Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coverageEntities.map((entity) => (
                <div 
                  key={entity.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover-elevate"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium">{entity.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{entity.region}</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span>{entity.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{entity.controls}</p>
                      <p className="text-xs text-muted-foreground">Controls</p>
                    </div>
                    {getStatusBadge(entity.status)}
                    <Button variant="outline" size="sm" data-testid={`button-map-entity-${entity.id}`}>
                      {entity.status === "mapped" ? "Review" : "Map"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
