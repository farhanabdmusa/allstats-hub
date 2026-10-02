export interface BPSDomain {
  domain_id: string;
  domain_name: string;
  domain_url: string;
}

export function getDomainLevel(mfd: string): string {
  if (mfd == "0000") return "";
  if (mfd.substring(2, 4) == "00") return "Provinsi ";
  if (mfd.substring(2, 3) == "7") return "Kota ";
  return "Kabupaten ";
}

interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

export interface BPSDomainResponse {
  status: string;
  "data-availability": string;
  message?: string | null;
  data?: [PaginationInfo, BPSDomain[] | null] | null;
}
