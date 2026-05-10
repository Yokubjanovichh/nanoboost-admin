import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import styles from "./Tabs.module.css";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef(function TabsList({ className, ...rest }, ref) {
  return <TabsPrimitive.List ref={ref} className={cn(styles.list, className)} {...rest} />;
});

export const TabsTrigger = forwardRef(function TabsTrigger({ className, ...rest }, ref) {
  return <TabsPrimitive.Trigger ref={ref} className={cn(styles.trigger, className)} {...rest} />;
});

export const TabsContent = forwardRef(function TabsContent({ className, ...rest }, ref) {
  return <TabsPrimitive.Content ref={ref} className={cn(styles.content, className)} {...rest} />;
});
