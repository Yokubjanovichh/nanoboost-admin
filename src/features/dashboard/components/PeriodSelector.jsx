import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs/Tabs";
import { ru } from "@/locales/ru";

export const PERIODS = ["today", "week", "month", "year"];
export const DEFAULT_PERIOD = "month";

export function PeriodSelector({ value, onChange }) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        {PERIODS.map((p) => (
          <TabsTrigger key={p} value={p}>
            {ru.dashboard.period[p]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
