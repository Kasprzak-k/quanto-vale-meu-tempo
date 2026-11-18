import { KeyboardEvent, useRef, useState } from 'react';
import {
  CalcInputs,
  DEFAULT_OFFERS,
  OfferSpec,
  compareRegimes,
  compareTwoOffers,
  formatBRL,
  formatDecimal,
} from '../lib/calculator';
import { NumericField } from './NumericField';

interface ScenarioSwitcherProps {
  inputs: CalcInputs;
}

export function ScenarioSwitcher({ inputs }: ScenarioSwitcherProps) {
  const [activeTab, setActiveTab] = useState<'regimes' | 'offers'>('regimes');
  const [offerA, setOfferA] = useState<OfferSpec>(DEFAULT_OFFERS[0]);
  const [offerB, setOfferB] = useState<OfferSpec>(DEFAULT_OFFERS[1]);

  const tabRegimesRef = useRef<HTMLButtonElement>(null);
  const tabOffersRef = useRef<HTMLButtonElement>(null);

  const { rows, equivalentOnsiteSalary } = compareRegimes(inputs);
  const bestRegime = rows.reduce((best, r) => (r.realHourly > best.realHourly ? r : best), rows[0]);
  const offersComparison = compareTwoOffers(offerA, offerB);

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (activeTab === 'regimes') {
        setActiveTab('offers');
        tabOffersRef.current?.focus();
      } else {
        setActiveTab('regimes');
        tabRegimesRef.current?.focus();
      }
    }
  };

  const updateOfferA = <K extends keyof OfferSpec>(field: K, value: OfferSpec[K]) => {
    setOfferA((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'daysPerWeek') next.onsiteDaysPerWeek = Math.min(next.onsiteDaysPerWeek, Number(value));
      return next;
    });
  };

  const updateOfferB = <K extends keyof OfferSpec>(field: K, value: OfferSpec[K]) => {
    setOfferB((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'daysPerWeek') next.onsiteDaysPerWeek = Math.min(next.onsiteDaysPerWeek, Number(value));
      return next;
    });
  };

  return (
    <section
      id="comparador"
      className="page-section page-section--band"
      aria-labelledby="comparador-title"
    >
      <div className="container">
        <div className="section-head">
          <h2 id="comparador-title">PRESENCIAL CONTRA REMOTO</h2>
          <p className="lead">
            Descubra quanto o escritório precisa pagar para empatar em casa.
          </p>
        </div>

        <div
          data-slot="scenario-comparator"
          data-kind="product"
          data-alt="Comparador interativo entre regimes de trabalho e entre duas propostas de emprego"
        >
          <div className="cells tablist" role="tablist" aria-label="Modo de comparação">
            <button
              ref={tabRegimesRef}
              type="button"
              role="tab"
              id="tab-regimes"
              aria-selected={activeTab === 'regimes'}
              aria-controls="panel-regimes"
              tabIndex={activeTab === 'regimes' ? 0 : -1}
              className="switch-tab"
              onClick={() => setActiveTab('regimes')}
              onKeyDown={handleTabKeyDown}
            >
              Regimes na sua renda
            </button>
            <button
              ref={tabOffersRef}
              type="button"
              role="tab"
              id="tab-offers"
              aria-selected={activeTab === 'offers'}
              aria-controls="panel-offers"
              tabIndex={activeTab === 'offers' ? 0 : -1}
              className="switch-tab"
              onClick={() => setActiveTab('offers')}
              onKeyDown={handleTabKeyDown}
            >
              Proposta A contra B
            </button>
          </div>

          <section
            id="panel-regimes"
            role="tabpanel"
            aria-labelledby="tab-regimes"
            hidden={activeTab !== 'regimes'}
          >
            <div className="cells">
              <table className="brutal-table">
                <thead>
                  <tr>
                    <th scope="col">Regime</th>
                    <th scope="col" className="num">
                      Tempo entregue
                    </th>
                    <th scope="col" className="num">
                      Custos do mês
                    </th>
                    <th scope="col" className="num">
                      Sobra efetiva
                    </th>
                    <th scope="col" className="num">
                      Hora real
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={row.id === bestRegime.id ? 'is-best' : undefined}
                    >
                      <td data-label="Regime">{row.label}</td>
                      <td data-label="Tempo entregue" className="num">
                        {formatDecimal(row.totalMonthlyHours)} h/mês
                      </td>
                      <td data-label="Custos do mês" className="num">
                        {formatBRL(row.workCosts, false)}
                      </td>
                      <td data-label="Sobra efetiva" className="num">
                        {formatBRL(row.effectiveNetIncome)}
                      </td>
                      <td data-label="Hora real" className="num">
                        {formatBRL(row.realHourly)}/h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-callout">
                <div>
                  <h3>
                    Salário presencial equivalente: {formatBRL(equivalentOnsiteSalary, false)} líquidos
                  </h3>
                  <p className="label-muted">
                    Necessário para igualar a hora real de quem ganha {formatBRL(inputs.netIncome, false)} em casa.
                  </p>
                </div>
                <span className="mark-fill">
                  Diferença de {formatBRL(Math.max(0, equivalentOnsiteSalary - inputs.netIncome), false)} no mês
                </span>
              </div>
            </div>
          </section>

          <section
            id="panel-offers"
            role="tabpanel"
            aria-labelledby="tab-offers"
            hidden={activeTab !== 'offers'}
          >
            <div className="cells offers-grid">
              <div className="offer-panel">
                <div className="offer-hourly-row">
                  <h3>{offerA.name}</h3>
                  <strong className="offer-hourly-val">
                    {formatBRL(offersComparison.a.realHourly)}/h real
                  </strong>
                </div>
                <div className="offer-inputs">
                  <NumericField
                    label="Salário líquido"
                    prefix="R$"
                    value={offerA.netIncome}
                    min={0}
                    max={1_000_000}
                    step={100}
                    onChange={(val) => updateOfferA('netIncome', val)}
                    helpText={`Papel: ${formatBRL(offersComparison.a.nominalHourly)}/h`}
                  />
                  <NumericField
                    label="Dias presenciais/sem"
                    value={offerA.onsiteDaysPerWeek}
                    min={0}
                    max={offerA.daysPerWeek}
                    step={1}
                    onChange={(val) => updateOfferA('onsiteDaysPerWeek', Math.round(val))}
                    helpText={`${formatDecimal(offersComparison.a.totalMonthlyHours)} h/mês totais`}
                  />
                  <NumericField
                    label="Trânsito (min/dia)"
                    value={offerA.commuteMinutesPerDay}
                    min={0}
                    max={480}
                    step={5}
                    disabled={offerA.onsiteDaysPerWeek === 0}
                    onChange={(val) => updateOfferA('commuteMinutesPerDay', val)}
                    helpText={offerA.onsiteDaysPerWeek === 0 ? 'Remoto sem deslocamento.' : 'Ida e volta.'}
                  />
                  <NumericField
                    label="Custos mensais"
                    prefix="R$"
                    value={offerA.monthlyCosts}
                    min={0}
                    max={100_000}
                    step={20}
                    onChange={(val) => updateOfferA('monthlyCosts', val)}
                    helpText={`Sobra: ${formatBRL(offersComparison.a.effectiveNetIncome, false)}`}
                  />
                </div>
              </div>

              <div className="offer-panel">
                <div className="offer-hourly-row">
                  <h3>{offerB.name}</h3>
                  <strong className="offer-hourly-val">
                    {formatBRL(offersComparison.b.realHourly)}/h real
                  </strong>
                </div>
                <div className="offer-inputs">
                  <NumericField
                    label="Salário líquido"
                    prefix="R$"
                    value={offerB.netIncome}
                    min={0}
                    max={1_000_000}
                    step={100}
                    onChange={(val) => updateOfferB('netIncome', val)}
                    helpText={`Papel: ${formatBRL(offersComparison.b.nominalHourly)}/h`}
                  />
                  <NumericField
                    label="Dias presenciais/sem"
                    value={offerB.onsiteDaysPerWeek}
                    min={0}
                    max={offerB.daysPerWeek}
                    step={1}
                    onChange={(val) => updateOfferB('onsiteDaysPerWeek', Math.round(val))}
                    helpText={`${formatDecimal(offersComparison.b.totalMonthlyHours)} h/mês totais`}
                  />
                  <NumericField
                    label="Trânsito (min/dia)"
                    value={offerB.commuteMinutesPerDay}
                    min={0}
                    max={480}
                    step={5}
                    disabled={offerB.onsiteDaysPerWeek === 0}
                    onChange={(val) => updateOfferB('commuteMinutesPerDay', val)}
                    helpText={offerB.onsiteDaysPerWeek === 0 ? 'Remoto sem deslocamento.' : 'Ida e volta.'}
                  />
                  <NumericField
                    label="Custos mensais"
                    prefix="R$"
                    value={offerB.monthlyCosts}
                    min={0}
                    max={100_000}
                    step={20}
                    onChange={(val) => updateOfferB('monthlyCosts', val)}
                    helpText={`Sobra: ${formatBRL(offersComparison.b.effectiveNetIncome, false)}`}
                  />
                </div>
              </div>
            </div>

            <div className="cells offer-verdict well--ink">
              <div>
                <h3>
                  {offersComparison.winner === 'tie'
                    ? 'As duas propostas empatam no valor real por hora.'
                    : `${offersComparison.winner === 'A' ? offerA.name : offerB.name} paga ${formatBRL(offersComparison.hourlyDiff)} a mais por hora real.`}
                </h3>
                <p className="label-muted">
                  Resultado líquido descontando deslocamento e gastos mensais de cada proposta.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
