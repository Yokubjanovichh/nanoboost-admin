import { forwardRef } from "react";
import { Input } from "@/components/ui/Input/Input";

export const NumberInput = forwardRef(function NumberInput(
  { min, max, step = 1, ...rest },
  ref,
) {
  return <Input ref={ref} type="number" inputMode="numeric" min={min} max={max} step={step} {...rest} />;
});
