interface RemainingTime {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export function calculateRemainingTime(birthDate: Date, expectedLifespan: number): RemainingTime {
  const now = new Date();
  const deathDate = new Date(birthDate);
  deathDate.setFullYear(birthDate.getFullYear() + expectedLifespan);
  
  const totalRemainingDays = Math.floor((deathDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(totalRemainingDays / 365.25);
  const remainingDaysAfterYears = totalRemainingDays - (years * 365.25);
  
  const months = Math.floor(remainingDaysAfterYears / 30.44);
  const remainingDaysAfterMonths = remainingDaysAfterYears - (months * 30.44);
  
  const weeks = Math.floor(remainingDaysAfterMonths / 7);
  const days = Math.floor(remainingDaysAfterMonths - (weeks * 7));
  
  return {
    years,
    months,
    weeks,
    days
  };
}

export function formatRemainingTime(time: RemainingTime): string {
  const parts = [];
  
  if (time.years > 0) parts.push(`${time.years} years`);
  if (time.months > 0) parts.push(`${time.months} months`);
  if (time.weeks > 0) parts.push(`${time.weeks} weeks`);
  if (time.days > 0) parts.push(`${time.days} days`);
  
  return parts.join(', ');
} 