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
import { useCallback, useState } from "react";
import { Topic } from "@/types/topic";
import { Badge } from "@/components/ui/badge";
import { IconX } from "@tabler/icons-react";

const TopicSelect = ({
  topics,
  onChange,
  values = [],
}: Readonly<{
  topics: Topic[];
  onChange: (value: Topic[]) => void;
  values?: Topic[];
}>) => {
  const [open, setOpen] = useState(false);

  const updateValue = useCallback(
    (currentValue: string) => {
      if (values.find((v) => v.id.toString() === currentValue)) {
        return values.filter((v) => v.id.toString() !== currentValue);
      }
      const topic = topics.find((t) => t.id.toString() === currentValue);
      if (topic) {
        return [...values, topic];
      }
    },
    [topics, values]
  );
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
            {values.length > 0
              ? values.map((v) => (
                  <Badge key={v.id}>
                    {v.display_name}
                    <span
                      className="ml-1 hover:cursor-pointer"
                      role="button"
                      aria-label={`Remove ${v.display_name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(values.filter((val) => val.id !== v.id));
                      }}
                    >
                      <IconX />
                    </span>
                  </Badge>
                ))
              : "All users"}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command>
          <CommandInput placeholder="Search topic..." className="h-9" />
          <CommandList>
            <CommandEmpty>No topic found.</CommandEmpty>
            <CommandGroup>
              {topics.map((topic) => (
                <CommandItem
                  key={topic.id}
                  value={topic.id.toString()}
                  onSelect={(currentValue) => {
                    onChange(updateValue(currentValue) || []);
                    setOpen(false);
                  }}
                >
                  {topic.display_name}
                  <Check
                    className={cn(
                      "ml-auto",
                      values.find((v) => v.id === topic.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TopicSelect;
