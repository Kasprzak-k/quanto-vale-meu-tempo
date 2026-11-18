export interface CalcInputs {
  netIncome: number;
  workHoursPerDay: number;
  daysPerWeek: number;
  onsiteDaysPerWeek: number;
  commuteMinutesPerDay: number;
  unpaidExtraMinutesPerDay: number;
  transportCost: number;
  foodOutCost: number;
  otherWorkCost: number;
}

export interface CalcResult {
  monthlyWorkDays: number;
  monthlyOnsiteDays: number;
  contractedMonthlyHours: number;
  monthlyCommuteHours: number;
  monthlyExtraHours: number;
  unpaidMonthlyHours: number;
  totalMonthlyHours: number;
  totalWorkCosts: number;
  effectiveNetIncome: number;
  monthlyDeficit: number;
  cappedAt24hPerDay: boolean;
  nominalHourly: number;
  realHourly: number;
  corrosionPct: number;
  yearlyUnpaidHours: number;
  yearlyCommuteHours: number;
  yearlyCommuteDays: number;
  contractedSharePct: number;
  commuteSharePct: number;
  extraSharePct: number;
}

export interface RegimeRow {
  id: 'onsite' | 'hybrid' | 'remote';
  label: string;
  onsiteDays: number;
  totalMonthlyHours: number;
  workCosts: number;
  effectiveNetIncome: number;
  realHourly: number;
  deltaVsNominalPct: number;
}

export interface OfferSpec {
  name: string;
  netIncome: number;
  workHoursPerDay: number;
  daysPerWeek: number;
  onsiteDaysPerWeek: number;
  commuteMinutesPerDay: number;
  monthlyCosts: number;
}

export interface OfferOutcome {
  spec: OfferSpec;
  contractedMonthlyHours: number;
  totalMonthlyHours: number;
  effectiveNetIncome: number;
  nominalHourly: number;
  realHourly: number;
}

export interface TradeoffResult {
  canAfford: boolean;
  realWorkHours: number;
  nominalWorkHours: number;
  dailyCommittedHours: number;
  workDaysRequired: number;
  workMonthsRequired: number;
  workYearsRequired: number;
  monthSharePct: number;
  costPerSavedHour: number;
  netHoursGained: number;
  worthIt: boolean;
}

export const WEEKS_PER_MONTH = 52 / 12;

export const DEFAULT_INPUTS: CalcInputs = {
  netIncome: 5000,
  workHoursPerDay: 8,
  daysPerWeek: 5,
  onsiteDaysPerWeek: 5,
  commuteMinutesPerDay: 90,
  unpaidExtraMinutesPerDay: 30,
  transportCost: 380,
  foodOutCost: 520,
  otherWorkCost: 150,
};

export const DEFAULT_OFFERS: [OfferSpec, OfferSpec] = [
  {
    name: 'Proposta A',
    netIncome: 6200,
    workHoursPerDay: 8,
    daysPerWeek: 5,
    onsiteDaysPerWeek: 5,
    commuteMinutesPerDay: 100,
    monthlyCosts: 980,
  },
  {
    name: 'Proposta B',
    netIncome: 5400,
    workHoursPerDay: 8,
    daysPerWeek: 5,
    onsiteDaysPerWeek: 1,
    commuteMinutesPerDay: 60,
    monthlyCosts: 220,
  },
];

function nonNeg(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateRealHourly(raw: CalcInputs): CalcResult {
  const netIncome = nonNeg(raw.netIncome);
  const workHoursPerDay = Math.min(24, Math.max(0.5, nonNeg(raw.workHoursPerDay)));
  const daysPerWeek = Math.min(7, Math.max(1, nonNeg(raw.daysPerWeek)));
  const onsiteDaysPerWeek = Math.min(daysPerWeek, nonNeg(raw.onsiteDaysPerWeek));
  const rawCommuteHours = onsiteDaysPerWeek === 0 ? 0 : nonNeg(raw.commuteMinutesPerDay) / 60;
  const rawExtraHours = nonNeg(raw.unpaidExtraMinutesPerDay) / 60;
  const transportCost = nonNeg(raw.transportCost);
  const foodOutCost = nonNeg(raw.foodOutCost);
  const otherWorkCost = nonNeg(raw.otherWorkCost);

  const rawDailyOnsite = workHoursPerDay + rawCommuteHours + rawExtraHours;
  const rawDailyRemote = workHoursPerDay + rawExtraHours;
  const cappedAt24hPerDay = rawDailyOnsite > 24 || rawDailyRemote > 24;

  const remAfterWork = Math.max(0, 24 - workHoursPerDay);
  const effectiveExtraPerDay = Math.min(rawExtraHours, remAfterWork);
  const remAfterExtra = Math.max(0, remAfterWork - effectiveExtraPerDay);
  const effectiveCommutePerDay =
    onsiteDaysPerWeek === 0 ? 0 : Math.min(rawCommuteHours, remAfterExtra);

  const monthlyWorkDays = daysPerWeek * WEEKS_PER_MONTH;
  const monthlyOnsiteDays = onsiteDaysPerWeek * WEEKS_PER_MONTH;
  const contractedMonthlyHours = monthlyWorkDays * workHoursPerDay;
  const monthlyCommuteHours = monthlyOnsiteDays * effectiveCommutePerDay;
  const monthlyExtraHours = monthlyWorkDays * effectiveExtraPerDay;
  const unpaidMonthlyHours = monthlyCommuteHours + monthlyExtraHours;
  const totalMonthlyHours = Math.max(1, contractedMonthlyHours + unpaidMonthlyHours);

  const totalWorkCosts = transportCost + foodOutCost + otherWorkCost;
  const effectiveNetIncome = Math.max(0, netIncome - totalWorkCosts);
  const monthlyDeficit = Math.max(0, totalWorkCosts - netIncome);

  const nominalHourly = contractedMonthlyHours > 0 ? netIncome / contractedMonthlyHours : 0;
  const realHourly = effectiveNetIncome / totalMonthlyHours;
  const corrosionPct = nominalHourly > 0 ? Math.max(0, ((nominalHourly - realHourly) / nominalHourly) * 100) : 0;

  const yearlyUnpaidHours = unpaidMonthlyHours * 12;
  const yearlyCommuteHours = monthlyCommuteHours * 12;
  const yearlyCommuteDays = yearlyCommuteHours / 24;

  const contractedSharePct = (contractedMonthlyHours / totalMonthlyHours) * 100;
  const commuteSharePct = (monthlyCommuteHours / totalMonthlyHours) * 100;
  const extraSharePct = Math.max(0, 100 - contractedSharePct - commuteSharePct);

  return {
    monthlyWorkDays,
    monthlyOnsiteDays,
    contractedMonthlyHours,
    monthlyCommuteHours,
    monthlyExtraHours,
    unpaidMonthlyHours,
    totalMonthlyHours,
    totalWorkCosts,
    effectiveNetIncome,
    monthlyDeficit,
    cappedAt24hPerDay,
    nominalHourly,
    realHourly,
    corrosionPct,
    yearlyUnpaidHours,
    yearlyCommuteHours,
    yearlyCommuteDays,
    contractedSharePct,
    commuteSharePct,
    extraSharePct,
  };
}

export function compareRegimes(inputs: CalcInputs): {
  rows: RegimeRow[];
  equivalentOnsiteSalary: number;
} {
  const days = Math.min(7, Math.max(1, nonNeg(inputs.daysPerWeek)));
  const baseCommuteMin = nonNeg(inputs.commuteMinutesPerDay);
  const hybridOnsite = Math.min(2, days);
  const baseNominal = calculateRealHourly(inputs).nominalHourly;

  const buildRow = (
    id: RegimeRow['id'],
    label: string,
    onsiteDays: number,
    commuteMin: number,
    onsiteCostFactor: number,
  ): RegimeRow => {
    const scenario: CalcInputs = {
      ...inputs,
      onsiteDaysPerWeek: onsiteDays,
      commuteMinutesPerDay: commuteMin,
      transportCost: Math.round(nonNeg(inputs.transportCost) * onsiteCostFactor),
      foodOutCost: Math.round(nonNeg(inputs.foodOutCost) * onsiteCostFactor),
    };
    const res = calculateRealHourly(scenario);
    const deltaVsNominalPct = baseNominal > 0 ? ((res.realHourly - baseNominal) / baseNominal) * 100 : 0;
    return {
      id,
      label,
      onsiteDays,
      totalMonthlyHours: res.totalMonthlyHours,
      workCosts: res.totalWorkCosts,
      effectiveNetIncome: res.effectiveNetIncome,
      realHourly: res.realHourly,
      deltaVsNominalPct,
    };
  };

  const onsite = buildRow('onsite', `Presencial (${days}x)`, days, baseCommuteMin, 1);
  const hybrid = buildRow('hybrid', `Híbrido (${hybridOnsite}x)`, hybridOnsite, baseCommuteMin, hybridOnsite / days);
  const remote = buildRow('remote', 'Remoto (0x)', 0, 0, 0);

  const equivalentOnsiteSalary =
    remote.effectiveNetIncome > 0
      ? remote.realHourly * onsite.totalMonthlyHours + onsite.workCosts
      : nonNeg(inputs.netIncome) + Math.max(0, onsite.workCosts - remote.workCosts);

  return {
    rows: [onsite, hybrid, remote],
    equivalentOnsiteSalary,
  };
}

export function evaluateOffer(offer: OfferSpec): OfferOutcome {
  const res = calculateRealHourly({
    netIncome: offer.netIncome,
    workHoursPerDay: offer.workHoursPerDay,
    daysPerWeek: offer.daysPerWeek,
    onsiteDaysPerWeek: offer.onsiteDaysPerWeek,
    commuteMinutesPerDay: offer.commuteMinutesPerDay,
    unpaidExtraMinutesPerDay: 0,
    transportCost: offer.monthlyCosts,
    foodOutCost: 0,
    otherWorkCost: 0,
  });

  return {
    spec: offer,
    contractedMonthlyHours: res.contractedMonthlyHours,
    totalMonthlyHours: res.totalMonthlyHours,
    effectiveNetIncome: res.effectiveNetIncome,
    nominalHourly: res.nominalHourly,
    realHourly: res.realHourly,
  };
}

export function compareTwoOffers(offerA: OfferSpec, offerB: OfferSpec): {
  a: OfferOutcome;
  b: OfferOutcome;
  winner: 'A' | 'B' | 'tie';
  hourlyDiff: number;
} {
  const a = evaluateOffer(offerA);
  const b = evaluateOffer(offerB);
  const diff = a.realHourly - b.realHourly;
  const winner = Math.abs(diff) < 0.05 ? 'tie' : diff > 0 ? 'A' : 'B';
  return { a, b, winner, hourlyDiff: Math.abs(diff) };
}

export function evaluateTradeoff(
  result: CalcResult,
  amountBRL: number,
  hoursSaved: number,
): TradeoffResult {
  const amount = nonNeg(amountBRL);
  const saved = Math.max(0.1, nonNeg(hoursSaved));
  const canAfford = amount <= 0 || result.realHourly > 0;
  const realWorkHours = amount <= 0 ? 0 : result.realHourly > 0 ? amount / result.realHourly : 0;
  const nominalWorkHours =
    amount <= 0 ? 0 : result.nominalHourly > 0 ? amount / result.nominalHourly : 0;
  const dailyCommittedHours =
    result.monthlyWorkDays > 0 ? result.totalMonthlyHours / result.monthlyWorkDays : 8;
  const workDaysRequired =
    canAfford && amount > 0 && dailyCommittedHours > 0
      ? realWorkHours / dailyCommittedHours
      : 0;
  const workMonthsRequired =
    canAfford && amount > 0 && result.totalMonthlyHours > 0
      ? realWorkHours / result.totalMonthlyHours
      : 0;
  const workYearsRequired = workMonthsRequired / 12;
  const monthSharePct = workMonthsRequired * 100;
  const costPerSavedHour = amount / saved;
  const netHoursGained = saved - realWorkHours;
  const worthIt = canAfford && (amount <= 0 || costPerSavedHour < result.realHourly);

  return {
    canAfford,
    realWorkHours,
    nominalWorkHours,
    dailyCommittedHours,
    workDaysRequired,
    workMonthsRequired,
    workYearsRequired,
    monthSharePct,
    costPerSavedHour,
    netHoursGained,
    worthIt,
  };
}

export function describeItemTimeCost(
  result: CalcResult,
  evaluation: TradeoffResult,
  amountBRL: number,
): { headline: string; detail: string; nominalHint: string } {
  const amount = nonNeg(amountBRL);

  let nominalHint: string;
  if (amount <= 0) {
    nominalHint = 'Digite um valor acima de zero para comparar.';
  } else if (result.nominalHourly <= 0) {
    nominalHint = 'Informe uma renda líquida maior que zero no topo.';
  } else if (
    result.contractedMonthlyHours > 0 &&
    evaluation.nominalWorkHours >= result.contractedMonthlyHours
  ) {
    nominalHint = `No papel: ${formatDuration(evaluation.nominalWorkHours)} (${formatDecimal(evaluation.nominalWorkHours / result.contractedMonthlyHours, 1)} meses de contrato).`;
  } else {
    nominalHint = `No papel: custaria ${formatDuration(evaluation.nominalWorkHours)} de contrato.`;
  }

  if (amount <= 0) {
    return {
      headline: '0 min',
      detail: 'Sem custo financeiro: exige zero minutos de trabalho.',
      nominalHint,
    };
  }

  if (!evaluation.canAfford) {
    return {
      headline: 'Sem sobra',
      detail:
        'Seus gastos do trabalho consomem toda a renda mensal: não sobra valor positivo por hora para custear este item.',
      nominalHint,
    };
  }

  const headline = formatDuration(evaluation.realWorkHours);

  if (evaluation.workYearsRequired >= 1) {
    return {
      headline,
      detail: `A ${formatBRL(result.realHourly)}/h reais, ultrapassa 1 ano: exige ${formatDecimal(evaluation.workYearsRequired, 1)} anos de trabalho (${formatDecimal(evaluation.workMonthsRequired, 1)} meses inteiros da sua sobra líquida).`,
      nominalHint,
    };
  }

  if (evaluation.workMonthsRequired >= 1) {
    return {
      headline,
      detail: `A ${formatBRL(result.realHourly)}/h reais, ultrapassa 1 mês: exige ${formatDecimal(evaluation.workMonthsRequired, 1)} meses inteiros de trabalho (${Math.round(evaluation.workDaysRequired)} dias úteis somando jornada e trânsito).`,
      nominalHint,
    };
  }

  if (evaluation.workDaysRequired >= 1) {
    return {
      headline,
      detail: `A ${formatBRL(result.realHourly)}/h reais, equivale a ${formatDecimal(evaluation.workDaysRequired, 1)} dias úteis de trabalho (${formatDecimal(evaluation.monthSharePct, 1)}% do seu mês de trabalho).`,
      nominalHint,
    };
  }

  return {
    headline,
    detail: `A ${formatBRL(result.realHourly)}/h reais, cabe em menos de 1 dia útil (${formatDecimal(evaluation.monthSharePct, 1)}% do seu mês de trabalho).`,
    nominalHint,
  };
}

export function describeTimeSavingTradeoff(
  result: CalcResult,
  evaluation: TradeoffResult,
  _amountBRL: number,
  hoursSaved: number,
): { headline: string; detail: string } {
  if (!evaluation.canAfford) {
    return {
      headline: 'Sem sobra',
      detail:
        'Seus gastos do trabalho consomem toda a renda mensal: pagar por este serviço gera déficit no mês.',
    };
  }

  const headline = formatDuration(evaluation.realWorkHours);

  if (evaluation.worthIt) {
    return {
      headline,
      detail: `Compra tempo livre: você trabalha ${formatDuration(evaluation.realWorkHours)} para pagar o serviço e libera ${formatDuration(hoursSaved)} (saldo positivo de ${formatDuration(Math.max(0, evaluation.netHoursGained))}).`,
    };
  }

  return {
    headline,
    detail: `Custa mais caro que sua hora real (${formatBRL(evaluation.costPerSavedHour)}/h contra ${formatBRL(result.realHourly)}/h): exige ${formatDuration(evaluation.realWorkHours)} de trabalho para liberar ${formatDuration(hoursSaved)}.`,
  };
}

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BRL_INT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatBRL(value: number, decimals = true): string {
  const safe = Number.isFinite(value) ? value : 0;
  return (decimals ? BRL_FORMATTER : BRL_INT_FORMATTER).format(safe);
}

export function formatDecimal(value: number, digits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDuration(hoursFloat: number): string {
  const safe = Math.max(0, Number.isFinite(hoursFloat) ? hoursFloat : 0);
  if (safe >= 100) {
    return `${Math.round(safe).toLocaleString('pt-BR')} h`;
  }
  const totalMinutes = Math.round(safe * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
}

const PARAM_KEYS: Array<[keyof CalcInputs, string, number, number]> = [
  ['netIncome', 'renda', 0, 1_000_000],
  ['workHoursPerDay', 'h', 0.5, 24],
  ['daysPerWeek', 'd', 1, 7],
  ['onsiteDaysPerWeek', 'pres', 0, 7],
  ['commuteMinutesPerDay', 'transito', 0, 600],
  ['unpaidExtraMinutesPerDay', 'extra', 0, 600],
  ['transportCost', 'cTrans', 0, 100_000],
  ['foodOutCost', 'cRua', 0, 100_000],
  ['otherWorkCost', 'cOut', 0, 100_000],
];

export function parseInputsFromUrl(search: string): CalcInputs {
  const params = new URLSearchParams(search);
  const next: CalcInputs = { ...DEFAULT_INPUTS };
  for (const [field, key, min, max] of PARAM_KEYS) {
    const raw = params.get(key);
    if (raw === null) continue;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      next[field] = parsed;
    }
  }
  next.onsiteDaysPerWeek = Math.min(next.onsiteDaysPerWeek, next.daysPerWeek);
  return next;
}

export function buildUrlFromInputs(inputs: CalcInputs): string {
  const params = new URLSearchParams();
  for (const [field, key] of PARAM_KEYS) {
    params.set(key, String(inputs[field]));
  }
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?${params.toString()}`;
}

export function syncInputsToUrl(inputs: CalcInputs): void {
  const params = new URLSearchParams();
  let differs = false;
  for (const [field, key] of PARAM_KEYS) {
    if (inputs[field] !== DEFAULT_INPUTS[field]) differs = true;
    params.set(key, String(inputs[field]));
  }
  const nextUrl = differs ? `${window.location.pathname}?${params.toString()}${window.location.hash}` : `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState(null, '', nextUrl);
}

export function buildPlainTextReceipt(inputs: CalcInputs, result: CalcResult): string {
  return [
    'HORA REAL (DIAGNOSTICO DE TEMPO E RENDA)',
    '----------------------------------------',
    `Renda liquida mensal: ${formatBRL(inputs.netIncome)}`,
    `Gastos ligados ao trabalho: ${formatBRL(result.totalWorkCosts)}`,
    `Sobra efetiva no mes: ${formatBRL(result.effectiveNetIncome)}`,
    '',
    `Horas contratadas: ${formatDecimal(result.contractedMonthlyHours)} h/mes`,
    `Horas de transito e extras: ${formatDecimal(result.unpaidMonthlyHours)} h/mes`,
    `Tempo total entregue: ${formatDecimal(result.totalMonthlyHours)} h/mes`,
    '',
    `Hora no papel: ${formatBRL(result.nominalHourly)}/h`,
    `Hora real de vida: ${formatBRL(result.realHourly)}/h`,
    `Corrosao do salario: -${formatDecimal(result.corrosionPct)}%`,
    `Horas nao pagas por ano: ${Math.round(result.yearlyUnpaidHours)} h`,
  ].join('\n');
}
