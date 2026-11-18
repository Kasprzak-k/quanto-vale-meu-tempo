import { CalcInputs, CalcResult, formatDecimal } from '../lib/calculator';
import { COMMUTE_PHOTO } from '../lib/media';
import { NumericField } from './NumericField';

interface CorrosionBentoProps {
  inputs: CalcInputs;
  result: CalcResult;
  onUpdateField: <K extends keyof CalcInputs>(field: K, value: CalcInputs[K]) => void;
}

export function CorrosionBento({ inputs, result, onUpdateField }: CorrosionBentoProps) {
  const paidPct = Math.round(result.contractedSharePct);
  const commutePct = Math.round(result.commuteSharePct);
  const extraPct = Math.max(0, 100 - paidPct - commutePct);

  return (
    <section id="anatomia" className="page-section" aria-labelledby="anatomia-title">
      <div className="container">
        <div className="section-head">
          <h2 id="anatomia-title">ONDE SEU SALÁRIO ENCOLHE</h2>
          <p className="lead">
            Horas não pagas e despesas do expediente derrubam o ganho.
          </p>
        </div>

        <div className="cells bento-grid">
          <div
            className="bento-diagram well--ink"
            data-slot="hours-diagram"
            data-kind="product"
            data-alt="Gráfico proporcional de horas contratadas contra trânsito e extras"
          >
            <div>
              <span className="label-muted">Tempo entregue fora do contrato</span>
              <strong className="display-num bento-big-num">
                {Math.round(result.yearlyUnpaidHours)} h por ano
              </strong>
            </div>

            <div>
              <div
                className="bar-track"
                role="img"
                aria-label={`Distribuição do tempo mensal: ${paidPct}% pagas no contrato, ${commutePct}% em trânsito, ${extraPct}% em preparo e extras`}
              >
                <span
                  className="bar-segment--paid"
                  style={{ width: `${result.contractedSharePct}%` }}
                />
                <span
                  className="bar-segment--commute"
                  style={{ width: `${result.commuteSharePct}%` }}
                />
                <span
                  className="bar-segment--extra"
                  style={{ width: `${result.extraSharePct}%` }}
                />
              </div>

              <ul className="bar-legend">
                <li className="legend-item">
                  <span className="legend-swatch bar-segment--paid" aria-hidden="true" />
                  <span>
                    Contrato: {formatDecimal(result.contractedMonthlyHours)} h ({paidPct}%)
                  </span>
                </li>
                <li className="legend-item">
                  <span className="legend-swatch bar-segment--commute" aria-hidden="true" />
                  <span>
                    Trânsito: {formatDecimal(result.monthlyCommuteHours)} h ({commutePct}%)
                  </span>
                </li>
                <li className="legend-item">
                  <span className="legend-swatch bar-segment--extra" aria-hidden="true" />
                  <span>
                    Preparo e extras: {formatDecimal(result.monthlyExtraHours)} h ({extraPct}%)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <figure className="bento-photo-cell">
            <div
              className="bento-photo-frame"
              data-slot="commute-photo"
              data-alt={COMMUTE_PHOTO.alt}
            >
              <img
                src={COMMUTE_PHOTO.src}
                width={COMMUTE_PHOTO.width}
                height={COMMUTE_PHOTO.height}
                sizes="(min-width: 60rem) 40vw, 100vw"
                alt={COMMUTE_PHOTO.alt}
                style={{ objectPosition: COMMUTE_PHOTO.objectPosition }}
              />
            </div>
            <figcaption className="bento-caption">
              {formatDecimal(result.yearlyCommuteDays)} dias inteiros por ano gastos no deslocamento.
            </figcaption>
          </figure>

          <div
            className="bento-levers"
            data-slot="cost-levers"
            data-kind="product"
            data-alt="Controles detalhados de dias presenciais, transporte, alimentação na rua e preparo diário"
          >
            <NumericField
              label="Dias trabalhados por semana"
              value={inputs.daysPerWeek}
              min={1}
              max={7}
              step={1}
              onChange={(val) => onUpdateField('daysPerWeek', Math.round(val))}
              helpText={`${formatDecimal(result.monthlyWorkDays)} dias úteis por mês`}
              errorLabel="Informe entre 1 e 7 dias."
            />
            <NumericField
              label="Dias presenciais por semana"
              value={inputs.onsiteDaysPerWeek}
              min={0}
              max={inputs.daysPerWeek}
              step={1}
              onChange={(val) => onUpdateField('onsiteDaysPerWeek', Math.round(val))}
              helpText={`De ${inputs.daysPerWeek} dias de trabalho`}
              errorLabel={`Informe entre 0 e ${inputs.daysPerWeek} dias.`}
            />
            <NumericField
              label="Preparo e extras (min/dia)"
              value={inputs.unpaidExtraMinutesPerDay}
              min={0}
              max={300}
              step={5}
              onChange={(val) => onUpdateField('unpaidExtraMinutesPerDay', val)}
              helpText={`${formatDecimal(result.monthlyExtraHours)} h/mês fora do relógio`}
              errorLabel="Informe entre 0 e 300 min."
            />
            <NumericField
              label="Transporte mensal"
              prefix="R$"
              value={inputs.transportCost}
              min={0}
              max={100_000}
              step={20}
              onChange={(val) => onUpdateField('transportCost', val)}
              helpText="Passagem, combustível e estacionamento."
              errorLabel="Informe R$ 0 ou mais."
            />
            <NumericField
              label="Alimentação na rua"
              prefix="R$"
              value={inputs.foodOutCost}
              min={0}
              max={100_000}
              step={20}
              onChange={(val) => onUpdateField('foodOutCost', val)}
              helpText="Almoço, café e lanches do expediente."
              errorLabel="Informe R$ 0 ou mais."
            />
            <NumericField
              label="Outros custos do trabalho"
              prefix="R$"
              value={inputs.otherWorkCost}
              min={0}
              max={100_000}
              step={20}
              onChange={(val) => onUpdateField('otherWorkCost', val)}
              helpText="Roupas, ferramentas, internet e taxas."
              errorLabel="Informe R$ 0 ou mais."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
