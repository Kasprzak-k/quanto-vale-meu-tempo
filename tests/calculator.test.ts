import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_INPUTS,
  WEEKS_PER_MONTH,
  calculateRealHourly,
  compareRegimes,
  describeItemTimeCost,
  describeTimeSavingTradeoff,
  evaluateTradeoff,
  formatDuration,
} from '../src/lib/calculator.ts';

test('cenário padrão produz valores esperados de hora nominal, hora real e corrosão', () => {
  const result = calculateRealHourly(DEFAULT_INPUTS);

  assert.equal(Math.round(result.contractedMonthlyHours * 10) / 10, 173.3);
  assert.equal(Math.round(result.monthlyCommuteHours * 10) / 10, 32.5);
  assert.equal(Math.round(result.monthlyExtraHours * 10) / 10, 10.8);
  assert.equal(Math.round(result.totalMonthlyHours * 10) / 10, 216.7);
  assert.equal(result.totalWorkCosts, 1050);
  assert.equal(result.effectiveNetIncome, 3950);
  assert.equal(result.monthlyDeficit, 0);
  assert.equal(result.cappedAt24hPerDay, false);
  assert.ok(Math.abs(result.nominalHourly - 28.8461538) < 1e-4);
  assert.ok(Math.abs(result.realHourly - 18.2307692) < 1e-4);
  assert.ok(Math.abs(result.corrosionPct - 36.8) < 0.1);
});

test('caso reportado (~R$ 6,11/h e 884 h) nunca diz que consome horas do mesmo mês', () => {
  const lowWageInputs = {
    ...DEFAULT_INPUTS,
    netIncome: 2374,
    workHoursPerDay: 8,
    daysPerWeek: 5,
    onsiteDaysPerWeek: 5,
    commuteMinutesPerDay: 90,
    unpaidExtraMinutesPerDay: 30,
    transportCost: 380,
    foodOutCost: 520,
    otherWorkCost: 150,
  };
  const result = calculateRealHourly(lowWageInputs);
  assert.ok(Math.abs(result.realHourly - 6.1107692) < 0.01);

  const amountBRL = 5400;
  const evaluation = evaluateTradeoff(result, amountBRL, 1);
  assert.ok(evaluation.realWorkHours > 883 && evaluation.realWorkHours < 884.5);
  assert.ok(evaluation.workMonthsRequired > 4.0);

  const copy = describeItemTimeCost(result, evaluation, amountBRL);
  assert.equal(copy.headline, '884 h');
  assert.match(copy.detail, /meses inteiros de trabalho/);
  assert.match(copy.detail, /dias úteis/);
  assert.doesNotMatch(copy.detail, /do seu mês/);
  assert.match(copy.nominalHint, /meses de contrato/);
});

test('invariante algébrica: workMonthsRequired equivale exatamente a amountBRL / effectiveNetIncome', () => {
  const result = calculateRealHourly({
    ...DEFAULT_INPUTS,
    netIncome: 4200,
    transportCost: 300,
    foodOutCost: 400,
    otherWorkCost: 100,
  });
  for (const amountBRL of [120, 600, 3400, 12500]) {
    const evaluation = evaluateTradeoff(result, amountBRL, 2);
    const expectedMonths = amountBRL / result.effectiveNetIncome;
    assert.ok(Math.abs(evaluation.workMonthsRequired - expectedMonths) < 1e-9);
  }
});

test('item multi-anual usa escala de anos e formata milhar em pt-BR', () => {
  const result = calculateRealHourly({
    ...DEFAULT_INPUTS,
    netIncome: 2374,
  });
  const evaluation = evaluateTradeoff(result, 80000, 1);
  assert.ok(evaluation.workYearsRequired > 1);

  const copy = describeItemTimeCost(result, evaluation, 80000);
  assert.match(copy.headline, /^\d{1,3}(\.\d{3})+ h$/);
  assert.match(copy.detail, /anos de trabalho/);
  assert.match(copy.detail, /meses inteiros da sua sobra líquida/);
  assert.doesNotMatch(copy.detail, /do seu mês/);
});

test('escalas abaixo de 1 mês nunca excedem 100% do mês de trabalho', () => {
  const result = calculateRealHourly(DEFAULT_INPUTS);

  const subDay = evaluateTradeoff(result, 30, 1);
  assert.ok(subDay.workDaysRequired < 1);
  assert.ok(subDay.monthSharePct < 100);
  const subDayCopy = describeItemTimeCost(result, subDay, 30);
  assert.match(subDayCopy.detail, /menos de 1 dia útil/);
  assert.match(subDayCopy.detail, /% do seu mês de trabalho/);

  const multiDay = evaluateTradeoff(result, 600, 1);
  assert.ok(multiDay.workDaysRequired >= 1);
  assert.ok(multiDay.workMonthsRequired < 1);
  assert.ok(multiDay.monthSharePct < 100);
  const multiDayCopy = describeItemTimeCost(result, multiDay, 600);
  assert.match(multiDayCopy.detail, /dias úteis de trabalho/);
  assert.match(multiDayCopy.detail, /% do seu mês de trabalho/);
});

test('sobra líquida zerada ou negativa não exibe 0 min e sinaliza Sem sobra / déficit', () => {
  const deficitResult = calculateRealHourly({
    ...DEFAULT_INPUTS,
    netIncome: 1000,
    transportCost: 1200,
    foodOutCost: 0,
    otherWorkCost: 0,
  });

  assert.equal(deficitResult.effectiveNetIncome, 0);
  assert.equal(deficitResult.realHourly, 0);
  assert.equal(deficitResult.monthlyDeficit, 200);

  const itemEval = evaluateTradeoff(deficitResult, 500, 4);
  assert.equal(itemEval.canAfford, false);
  assert.equal(itemEval.worthIt, false);

  const itemCopy = describeItemTimeCost(deficitResult, itemEval, 500);
  assert.equal(itemCopy.headline, 'Sem sobra');
  assert.doesNotMatch(itemCopy.headline, /0 min/);
  assert.match(itemCopy.detail, /gastos do trabalho consomem toda a renda/);

  const savingCopy = describeTimeSavingTradeoff(deficitResult, itemEval, 500, 4);
  assert.equal(savingCopy.headline, 'Sem sobra');
  assert.match(savingCopy.detail, /déficit no mês/);
});

test('teto físico de 24h por dia impede mês com mais de 730h ou ano com mais de 365 dias em trânsito', () => {
  const extremeInputs = {
    netIncome: 8000,
    workHoursPerDay: 20,
    daysPerWeek: 7,
    onsiteDaysPerWeek: 7,
    commuteMinutesPerDay: 480,
    unpaidExtraMinutesPerDay: 300,
    transportCost: 0,
    foodOutCost: 0,
    otherWorkCost: 0,
  };
  const result = calculateRealHourly(extremeInputs);

  assert.equal(result.cappedAt24hPerDay, true);
  assert.ok(result.totalMonthlyHours <= 7 * WEEKS_PER_MONTH * 24 + 1e-6);
  assert.ok(result.totalMonthlyHours <= 730);
  assert.ok(result.yearlyCommuteDays <= 365);

  const sumPct = result.contractedSharePct + result.commuteSharePct + result.extraSharePct;
  assert.ok(Math.abs(sumPct - 100) < 1e-9);
});

test('salário presencial equivalente iguala exatamente a hora real do regime remoto', () => {
  const { rows, equivalentOnsiteSalary } = compareRegimes(DEFAULT_INPUTS);
  const remoteRow = rows.find((r) => r.id === 'remote');
  assert.ok(remoteRow);

  const onsiteWithEquivalent = calculateRealHourly({
    ...DEFAULT_INPUTS,
    onsiteDaysPerWeek: DEFAULT_INPUTS.daysPerWeek,
    netIncome: equivalentOnsiteSalary,
  });

  assert.ok(Math.abs(onsiteWithEquivalent.realHourly - remoteRow.realHourly) < 1e-9);
});

test('modo Economizar tempo avalia worthIt corretamente frente à hora real', () => {
  const result = calculateRealHourly(DEFAULT_INPUTS);

  const badTradeoff = evaluateTradeoff(result, 160, 4);
  assert.equal(badTradeoff.worthIt, false);
  const badCopy = describeTimeSavingTradeoff(result, badTradeoff, 160, 4);
  assert.match(badCopy.detail, /Custa mais caro que sua hora real/);

  const goodTradeoff = evaluateTradeoff(result, 45, 4);
  assert.equal(goodTradeoff.worthIt, true);
  assert.ok(goodTradeoff.netHoursGained > 0);
  const goodCopy = describeTimeSavingTradeoff(result, goodTradeoff, 45, 4);
  assert.match(goodCopy.detail, /Compra tempo livre/);
});

test('formatDuration formata minutos, horas exatas e milhares com separador pt-BR', () => {
  assert.equal(formatDuration(0.5), '30 min');
  assert.equal(formatDuration(2), '2 h');
  assert.equal(formatDuration(8.78), '8 h 47 min');
  assert.equal(formatDuration(883.8), '884 h');
  assert.equal(formatDuration(4388.2), '4.388 h');
});
