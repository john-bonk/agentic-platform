/**
 * StrategicObjectives Component
 * 
 * Displays strategic objectives with numbered indicators, targets, owners,
 * and initiative/cost tables. Used in the Global Residual Risk view.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

export interface Initiative {
  id: string;
  name: string;
  cost: string;
}

export interface StrategicObjective {
  id: string;
  number: number;
  title: string;
  target: string;
  owner: string;
  initiatives: Initiative[];
}

interface StrategicObjectivesProps {
  objectives: StrategicObjective[];
}

function ObjectiveCard({ objective }: { objective: StrategicObjective }) {
  return (
    <div 
      className="border border-gray-200 rounded-md overflow-hidden"
      data-testid={`objective-${objective.id}`}
    >
      <div className="flex items-start gap-3 p-3 bg-white">
        <div 
          className="w-7 h-7 rounded-full bg-[#266C92] text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
          data-testid={`objective-number-${objective.id}`}
        >
          {objective.number}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900" data-testid={`objective-title-${objective.id}`}>
            {objective.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            <span>
              Target: <span className="font-medium text-gray-700">{objective.target}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Owner: <span className="font-medium text-gray-700">{objective.owner}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200">
        <table className="w-full text-sm" data-testid={`initiative-table-${objective.id}`}>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                Initiative
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 w-24">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {objective.initiatives.map((initiative, idx) => (
              <tr 
                key={initiative.id}
                className={idx < objective.initiatives.length - 1 ? "border-b border-gray-100" : ""}
                data-testid={`initiative-row-${initiative.id}`}
              >
                <td className="px-3 py-2 text-gray-700">{initiative.name}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">{initiative.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StrategicObjectives({ objectives }: StrategicObjectivesProps) {
  return (
    <Card data-testid="panel-strategic-objectives">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#266C92]" />
          Strategic Objectives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {objectives.map((objective) => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </CardContent>
    </Card>
  );
}
