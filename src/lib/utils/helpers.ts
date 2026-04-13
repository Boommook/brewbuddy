export function parseDate(value: unknown, label: string): Date {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`${label} is required`);
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid ${label}`);
    }
    return d;
  }

export function calculateABV(oG: string | null, fG: string | null): number {
    if (oG === null || oG === "" || fG === null || fG === "") return 0;
    const og = Number(oG);
    const fg = Number(fG);
    return Number(((og - fg) * 131.25 ).toFixed(2));
}

export function calculateABVNumber(oG: number, fG: number): number {
    return Number(((oG - fG) * 131.25 ).toFixed(2));
}
