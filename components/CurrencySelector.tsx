"use client";

import { useCurrency, type Currency } from "@/components/CurrencyProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DollarSign, Euro, IndianRupee } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  const getIcon = () => {
    switch (currency) {
      case "EUR":
        return <Euro className="h-4 w-4" />;
      case "INR":
        return <IndianRupee className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
          {getIcon()}
          <span className="sr-only">Toggle currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCurrency("USD")}>
          <DollarSign className="mr-2 h-4 w-4" />
          <span>USD ($)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("EUR")}>
          <Euro className="mr-2 h-4 w-4" />
          <span>EUR (€)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("INR")}>
          <IndianRupee className="mr-2 h-4 w-4" />
          <span>INR (₹)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
