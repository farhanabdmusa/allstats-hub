"use client";

import { BPSDomain, getDomainLevel } from "@/types/bps_domain";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const SelectDomain = ({
  domains,
  onChange,
  selected,
}: Readonly<{
  domains: BPSDomain[];
  onChange: (value?: string) => void;
  selected?: string;
}>) => {
  return (
    <Combobox
      items={domains}
      value={domains.find((domain) => domain.domain_id === selected) ?? null}
      onValueChange={(value) => {
        onChange(value?.domain_id);
      }}
      itemToStringLabel={(domain: BPSDomain) => {
        try {
          return `${getDomainLevel(domain.domain_id)}${domain.domain_name}`;
        } catch {
          return domain.domain_name;
        }
      }}
    >
      <ComboboxInput
        placeholder="Select a MFD"
        showClear
        enterKeyHint="search"
      />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: BPSDomain) => (
            <ComboboxItem key={item.domain_id} value={item}>
              {getDomainLevel(item.domain_id)}
              {item.domain_name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default SelectDomain;
