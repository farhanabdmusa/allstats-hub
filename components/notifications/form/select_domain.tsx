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
import { IconX } from "@tabler/icons-react";
import { BPSDomain, getDomainLevel } from "@/types/bps_domain";

const SelectDomain = ({
  domains,
  onChange,
  selected,
}: Readonly<{
  domains: BPSDomain[];
  onChange: (value?: string) => void;
  selected?: string;
}>) => {
  const [open, setOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(
    domains.find((e) => e.domain_id == selected),
  );

  const [selectedDomainLevel, setSelectedDomainLevel] = useState("");

  useEffect(() => {
    if (!selected) return;
    const level = getDomainLevel(selected);
    setSelectedDomainLevel(level);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const domain = domains.find((e) => e.domain_id == selected);
    setSelectedDomain(domain);
  }, [domains, selected]);

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
            {selectedDomain ? (
              <Badge>
                {selectedDomainLevel}
                {selectedDomain.domain_name}
              </Badge>
            ) : (
              "All users"
            )}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command>
          <CommandInput placeholder="Search domain..." className="h-9" />
          <CommandList>
            <CommandEmpty>No domain found.</CommandEmpty>
            <CommandGroup>
              {domains.map((domain) => {
                return (
                  <CommandItem
                    key={domain.domain_id}
                    value={domain.domain_id}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    {getDomainLevel(domain.domain_id)}
                    {domain.domain_name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selected === domain.domain_id
                          ? "opacity-100"
                          : "opacity-0",
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

export default SelectDomain;
