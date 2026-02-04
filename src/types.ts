// Structure for our "Database" of providers
export interface HostingProvider {
  id: string;
  name: string;
  color: string;
  icon: string;
  patterns: string[];
  desc?: string;
}

// Structure for the Google DNS API Response
export interface DNSAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DNSResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: DNSAnswer[];
  Comment?: string;
}

// Internal structure to hold all fetched records for debugging/checking
export interface CombinedDNSData {
  cname: DNSAnswer[];
  ns: DNSAnswer[];
  a: DNSAnswer[];
}
