import { Lead } from "@/types/lead";

// ==============================================
// Normalização e Parse Básico
// ==============================================

export function norm(str?: string | null, fallback = 'Não Identificado'): string {
  if (!str) return fallback;
  const s = String(str).trim();
  if (!s || s.toLowerCase() === 'sem info') return fallback;
  return s;
}

export function parseEventTime(raw?: string | null): Date | null {
  if (!raw) return null;
  const rawStr = String(raw).trim();

  // ISO-like: 2025-11-13 10:30:00 or 2025-11-13T10:30:00
  const isoMatch = rawStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{3})?Z?)?)?$/);
  if (isoMatch) {
    const [, y, m, d, hh = "0", mm = "0", ss = "0"] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  }

  // dd.mm.yy ou dd/mm/yy
  const parts = rawStr.split(/[.\-\/]/);
  if (parts.length >= 3) {
    let [dd, mm, yy] = parts;
    if (yy.length === 2) yy = "20" + yy;
    const year = Number(yy);
    const month = Number(mm) - 1;
    const day = Number(dd);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Trying to extract time if appended
      const timeMatch = rawStr.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
      let h=0, min=0, sec=0;
      if (timeMatch) {
        h = Number(timeMatch[1]);
        min = Number(timeMatch[2]);
        sec = timeMatch[3] ? Number(timeMatch[3]) : 0;
      }
      return new Date(year, month, day, h, min, sec);
    }
  }

  return null;
}

// ==============================================
// Extrações Específicas
// ==============================================

export function extractDDD(phoneRaw?: string | null): string {
  if (!phoneRaw) return 'Não Identificado';
  const p = String(phoneRaw).replace(/\D/g, ''); // só dígitos

  if (p.startsWith('55') && p.length > 4) {
    return p.slice(2, 4);
  }
  if (p.length >= 10) {
    return p.slice(0, 2);
  }
  return 'Não Identificado';
}

export function getDevice(uaRaw?: string | null): string {
  if (!uaRaw) return 'Não Identificado';
  const ua = uaRaw.toLowerCase();
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ios')) return 'iOS';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os') || ua.includes('macos')) return 'Mac';
  return 'Outro';
}

export function getPeriodOfDay(hour: number): string {
  if (hour >= 0 && hour < 6) return 'Madrugada';
  if (hour >= 6 && hour < 12) return 'Manhã';
  if (hour >= 12 && hour < 18) return 'Tarde';
  return 'Noite';
}

// ==============================================
// Geolocalização
// ==============================================
// (Mesma lógica de mock do n8n)

const ipGeoCache: Record<string, { city: string, state: string, region: string }> = {};

export function getGeoFromIP(ip?: string | null): { city: string, state: string, region: string } {
  if (!ip || ip === 'Não Identificado') return { city: 'Não Identificado', state: 'Não Identificado', region: 'Não Identificado' };
  
  if (ipGeoCache[ip]) return ipGeoCache[ip];
  
  const ipNum = Number(ip.split('.')[0]);
  let state = 'Não Identificado';
  let city = 'Não Identificado';
  let region = 'Não Identificado';
  
  if (ipNum >= 177 && ipNum <= 179) {
    state = 'SP'; city = 'São Paulo'; region = 'Sudeste';
  } else if (ipNum >= 187 && ipNum <= 189) {
    state = 'RJ'; city = 'Rio de Janeiro'; region = 'Sudeste';
  } else if (ipNum >= 191 && ipNum <= 192) {
    state = 'MG'; city = 'Belo Horizonte'; region = 'Sudeste';
  } else if (ipNum >= 200 && ipNum <= 201) {
    state = 'RS'; city = 'Porto Alegre'; region = 'Sul';
  } else if (ipNum >= 170 && ipNum <= 172) {
    state = 'PR'; city = 'Curitiba'; region = 'Sul';
  }
  
  const result = { city, state, region };
  ipGeoCache[ip] = result;
  return result;
}

// ==============================================
// Utilitários de Agrupamento
// ==============================================

export function countBy(arr: any[], fnKey: (item: any) => string) {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const key = fnKey(item) || 'Não Identificado';
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

export function countWithQual(leads: Lead[], keySelector: (l: Lead) => string) {
  const out: Record<string, { total: number, qualificados: number }> = {};
  for (const lead of leads) {
    const key = norm(keySelector(lead));
    if (!out[key]) out[key] = { total: 0, qualificados: 0 };
    out[key].total += 1;
    if (lead.conversion === 'Qualificado') out[key].qualificados += 1;
  }
  return out;
}

export function topNFromCountObj(obj: Record<string, number>, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export function topNQual(obj: Record<string, { total: number, qualificados: number }>, n = 5) {
  return Object.entries(obj)
    .map(([nome, data]) => ({
      nome,
      total: data.total,
      qualificados: data.qualificados,
      taxa: data.total ? (data.qualificados / data.total) * 100 : 0,
    }))
    .filter(x => x.total > 0)
    .sort((a, b) => b.taxa - a.taxa || b.total - a.total)
    .slice(0, n);
}
