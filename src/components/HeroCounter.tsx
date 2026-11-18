import { Check, Copy } from 'lucide-react';
import { CalcInputs, CalcResult, formatBRL, formatDecimal } from '../lib/calculator';
import { NumericField } from './NumericField';

interface HeroCounterProps {
  inputs: CalcInputs;
  result: CalcResult;
  onUpdateField: <K extends keyof CalcInputs>(field: K, value: CalcInputs[K]) => void;
  onUpdateTotalCosts: (total: number) => void;
  onSelectRegime: (onsiteDays: number) => void;
  onCopyReceipt: () => void;
  copiedReceipt: boolean;
}

export function HeroCounter({
  inputs,
  result,
  onUpdateField,
  onUpdateTotalCosts,
  onSelectRegime,
  onCopyReceipt,
  copiedReceipt,
}: HeroCounterProps) {
  const isOnsiteFull = inputs.onsiteDaysPerWeek >= inputs.daysPerWeek;
  const isRemote = inputs.onsiteDaysPerWeek === 0;
  const isHybrid = !isOnsiteFull && !isRemote;

  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="container counter-layout">
        <div className="counter-copy">
          <h1 id="hero-title">QUANTO VALE SUA HORA REAL</h1>
          <p className="lead">
            Veja <mark>quanto sobra</mark> após trânsito e gastos.
          </p>
          <div className="counter-actions">
            <a href="#anatomia" className="btn btn--ink">
              Abrir diagnóstico
            </a>
            <button type="button" className="btn" onClick={onCopyReceipt}>
              {copiedReceipt ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span>{copiedReceipt ? 'Recibo copiado' : 'Copiar recibo'}</span>
            </button>
          </div>
        </div>

        <div
          className="cells"
          data-slot="hero-calculator"
          data-kind="product"
          data-alt="Calculadora ao vivo do valor real da hora com campos de renda, jornada, deslocamento e gastos mensais"
        >
          <div className="well--ink workbench-header">
            <div>
              <span className="label-muted">Valor real da sua hora</span>
              <strong className="display-num counter-hourly-value" aria-live="polite">
                {formatBRL(result.realHourly)}
                <span className="unit-lower">/h</span>
              </strong>
            </div>
            <div className="workbench-meta">
              <span className="workbench-stat-line">
                No papel: {formatBRL(result.nominalHourly)}/h
              </span>
              <span className="workbench-stat-line">
                Corrosão: -{formatDecimal(result.corrosionPct)}%
              </span>
              <span className="label-muted">
                {formatDecimal(result.totalMonthlyHours)} h entregues no mês
              </span>
            </div>
          </div>

          <div className="regime-strip" role="group" aria-label="Modelo de trabalho">
            <button
              type="button"
              className={isOnsiteFull ? 'regime-btn is-chosen' : 'regime-btn'}
              aria-pressed={isOnsiteFull}
              onClick={() => onSelectRegime(inputs.daysPerWeek)}
            >
              Presencial
            </button>
            <button
              type="button"
              className={isHybrid ? 'regime-btn is-chosen' : 'regime-btn'}
              aria-pressed={isHybrid}
              onClick={() => onSelectRegime(Math.min(2, inputs.daysPerWeek))}
            >
              Híbrido
            </button>
            <button
              type="button"
              className={isRemote ? 'regime-btn is-chosen' : 'regime-btn'}
              aria-pressed={isRemote}
              onClick={() => onSelectRegime(0)}
            >
              Remoto
            </button>
          </div>

          <div className="counter-inputs-grid">
            <NumericField
              label="Renda líquida mensal"
              prefix="R$"
              value={inputs.netIncome}
              min={0}
              max={1_000_000}
              step={100}
              onChange={(val) => onUpdateField('netIncome', val)}
              helpText={
                result.monthlyDeficit > 0
                  ? `Déficit mensal de ${formatBRL(result.monthlyDeficit)}`
                  : `Sobra efetiva: ${formatBRL(result.effectiveNetIncome)}`
              }
              errorLabel="Informe uma renda de R$ 0 ou mais."
            />
            <NumericField
              label="Jornada contratada (h/dia)"
              value={inputs.workHoursPerDay}
              min={1}
              max={18}
              step={0.5}
              onChange={(val) => onUpdateField('workHoursPerDay', val)}
              helpText={`${formatDecimal(result.contractedMonthlyHours)} h no contrato`}
              errorLabel="Informe entre 1 h e 18 h por dia."
            />
            <NumericField
              label="Deslocamento ida e volta (min)"
              value={inputs.commuteMinutesPerDay}
              min={0}
              max={480}
              step={5}
              disabled={isRemote}
              onChange={(val) => onUpdateField('commuteMinutesPerDay', val)}
              helpText={
                isRemote
                  ? 'Sem deslocamento no regime remoto.'
                  : result.cappedAt24hPerDay
                    ? 'Limitado ao teto físico de 24 h por dia.'
                    : `${formatDecimal(result.monthlyCommuteHours)} h por mês no trânsito`
              }
              errorLabel="Informe entre 0 e 480 min."
            />
            <NumericField
              label="Custos mensais do trabalho"
              prefix="R$"
              value={result.totalWorkCosts}
              min={0}
              max={100_000}
              step={20}
              onChange={onUpdateTotalCosts}
              helpText="Transporte, refeição na rua e outros."
              errorLabel="Informe um custo de R$ 0 ou mais."
            />
          </div>

          <div className="workbench-foot">
            <div className="workbench-foot-cell">
              <span className="label-muted">Tempo invisível por ano</span>
              <strong className="workbench-foot-val">
                {Math.round(result.yearlyUnpaidHours)} h não pagas
              </strong>
            </div>
            <div className="workbench-foot-cell">
              <span className="label-muted">Escala na semana</span>
              <strong className="workbench-foot-val">
                {inputs.daysPerWeek} dias ({inputs.onsiteDaysPerWeek} presenciais)
              </strong>
            </div>
            <div className="workbench-foot-cell">
              <span className="label-muted">Desconto nos gastos</span>
              <strong className="workbench-foot-val">
                {formatBRL(result.totalWorkCosts, false)} por mês
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
