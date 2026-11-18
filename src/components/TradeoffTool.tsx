import { useState } from 'react';
import {
  CalcResult,
  describeItemTimeCost,
  describeTimeSavingTradeoff,
  evaluateTradeoff,
  formatBRL,
} from '../lib/calculator';
import { NumericField } from './NumericField';

interface TradeoffToolProps {
  result: CalcResult;
}

export function TradeoffTool({ result }: TradeoffToolProps) {
  const [mode, setMode] = useState<'buy-time' | 'item-cost'>('buy-time');
  const [amountBRL, setAmountBRL] = useState(160);
  const [hoursSaved, setHoursSaved] = useState(4);

  const evaluation = evaluateTradeoff(result, amountBRL, hoursSaved);
  const itemCopy = describeItemTimeCost(result, evaluation, amountBRL);
  const savingCopy = describeTimeSavingTradeoff(result, evaluation, amountBRL, hoursSaved);
  const verdict = mode === 'buy-time' ? savingCopy : itemCopy;

  const applyPreset = (nextMode: 'buy-time' | 'item-cost', nextAmount: number, nextHours: number) => {
    setMode(nextMode);
    setAmountBRL(nextAmount);
    setHoursSaved(nextHours);
  };

  return (
    <section id="trocas" className="page-section page-section--large" aria-labelledby="trocas-title">
      <div className="container tradeoff-grid">
        <div className="tradeoff-copy">
          <h2 id="trocas-title">PREÇO EM HORAS DE VIDA</h2>
          <p className="lead">
            Converta qualquer compra ou serviço no tempo real que ele exige.
          </p>
          <div className="tradeoff-presets">
            <button
              type="button"
              className="btn"
              onClick={() => applyPreset('buy-time', 160, 4)}
            >
              Faxina 4 h
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => applyPreset('buy-time', 45, 1)}
            >
              Entrega 1 h
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => applyPreset('item-cost', 600, 1)}
            >
              Item R$ 600
            </button>
          </div>
        </div>

        <div
          className="cells"
          data-slot="tradeoff-converter"
          data-kind="product"
          data-alt="Conversor interativo de compras e serviços terceirizados em horas reais de trabalho"
        >
          <div className="regime-strip regime-strip--two">
            <button
              type="button"
              className={mode === 'buy-time' ? 'regime-btn is-chosen' : 'regime-btn'}
              aria-pressed={mode === 'buy-time'}
              onClick={() => setMode('buy-time')}
            >
              Economizar tempo
            </button>
            <button
              type="button"
              className={mode === 'item-cost' ? 'regime-btn is-chosen' : 'regime-btn'}
              aria-pressed={mode === 'item-cost'}
              onClick={() => setMode('item-cost')}
            >
              Comprar um item
            </button>
          </div>

          <div
            className={
              mode === 'buy-time' ? 'tradeoff-inputs' : 'tradeoff-inputs tradeoff-inputs--single'
            }
          >
            <NumericField
              label="Valor em reais"
              prefix="R$"
              value={amountBRL}
              min={0}
              max={1_000_000}
              step={10}
              onChange={setAmountBRL}
              helpText={itemCopy.nominalHint}
              errorLabel="Informe R$ 0 ou mais."
            />
            {mode === 'buy-time' ? (
              <NumericField
                label="Horas livres ganhas"
                value={hoursSaved}
                min={0.5}
                max={200}
                step={0.5}
                onChange={setHoursSaved}
                helpText={`Sai a ${formatBRL(evaluation.costPerSavedHour)} por hora poupada.`}
                errorLabel="Informe ao menos 0,5 hora."
              />
            ) : null}
          </div>

          <div className="well--ink verdict-box">
            <span className="label-muted">Tempo de vida exigido pela conta</span>
            <strong className="display-num bento-big-num">
              {verdict.headline}
            </strong>
            <p>{verdict.detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
