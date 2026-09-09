"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const OPTIONS: {
  name: string;
  value: string;
}[] = [
  {
    name: "BRS",
    value: "brs",
  },
  {
    name: "Table",
    value: "table",
  },
  {
    name: "Publication",
    value: "publication",
  },
  {
    name: "News",
    value: "news",
  },
  {
    name: "Infographic",
    value: "infographic",
  },
  {
    name: "Press Release",
    value: "press_release",
  },
];

const SelectProductType = ({
  onChange,
  selected,
}: Readonly<{
  onChange: (value?: string) => void;
  selected?: string;
}>) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    OPTIONS.find((e) => e.value == selected) ?? undefined,
  );

  useEffect(() => {
    if (!selected) {
      setValue(undefined);
      return;
    }
    const option = OPTIONS.find((e) => e.value == selected);
    setValue(option);
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex-grow flex flex-wrap gap-1">
            {value ? <Badge>{value.name}</Badge> : ""}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command>
          <CommandInput placeholder="Search type..." className="h-9" />
          <CommandList>
            <CommandEmpty>No type found.</CommandEmpty>
            <CommandGroup>
              {OPTIONS.map((option) => {
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.name}

                    <Check
                      className={cn(
                        "ml-auto",
                        selected === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SelectProductType;
