export type Platform = "Google" | "Meta" | "Sem Info";
export type ConversionStatus = "Qualificado" | "Desqualificado" | "Sem Info";

export interface Lead {
  id: string;
  platform: Platform;
  event_time: string;
  gclid?: string;
  name: string;
  email?: string;
  phone_number: string;
  gbraid?: string;
  wbraid?: string;
  conversion_value?: number;
  currency_code?: string;
  order_id?: string;
  user_agent?: string;
  ip_address?: string;
  session_attributes?: string;
  attendance_number: string;
  campaign: string;
  ad_set: string;
  ad: string;
  ctwaclid?: string;
  source_id: string;
  message?: string;
  whatsapp_link?: string;
  title?: string;
  thumbnail_url?: string;
  ad_url?: string;
  ad_type?: string;
  conversion: ConversionStatus;
}
