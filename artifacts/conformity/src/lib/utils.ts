import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function getRegColor(key: string) {
  switch (key) {
    case 'cra': return 'bg-reg-cra text-white';
    case 'ai_act': return 'bg-reg-aia text-white';
    case 'machinery': return 'bg-reg-machinery text-white';
    case 'iec_62443': return 'bg-reg-iec text-white';
    case 'nis2': return 'bg-reg-nis2 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getRegBorderColor(key: string) {
  switch (key) {
    case 'cra': return 'border-reg-cra';
    case 'ai_act': return 'border-reg-aia';
    case 'machinery': return 'border-reg-machinery';
    case 'iec_62443': return 'border-reg-iec';
    case 'nis2': return 'border-reg-nis2';
    default: return 'border-border';
  }
}

export function getRegTextColor(key: string) {
  switch (key) {
    case 'cra': return 'text-reg-cra';
    case 'ai_act': return 'text-reg-aia';
    case 'machinery': return 'text-reg-machinery';
    case 'iec_62443': return 'text-reg-iec';
    case 'nis2': return 'text-reg-nis2';
    default: return 'text-foreground';
  }
}
