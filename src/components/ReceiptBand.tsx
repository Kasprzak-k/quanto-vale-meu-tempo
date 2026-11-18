import { Check, Copy, Link } from 'lucide-react';
import { CalcInputs, CalcResult, buildPlainTextReceipt } from '../lib/calculator';

interface ReceiptBandProps {
  inputs: CalcInputs;
  result: CalcResult;
  onCopyReceipt: () => void;
  copiedReceipt: boolean;
  onCopyLink: () => void;
  copiedLink: boolean;
}

export function ReceiptBand({
  inputs,
  result,
  onCopyReceipt,
  copiedReceipt,
  onCopyLink,
  copiedLink,
}: ReceiptBandProps) {
  const receiptText = buildPlainTextReceipt(inputs, result);

  return (
    <section
      id="resumo"
      className="page-section page-section--ink band--ink"
      aria-labelledby="resumo-title"
    >
      <div className="container receipt-grid">
        <div className="receipt-copy">
          <h2 id="resumo-title">SALVE O RECIBO DESTA CONTA</h2>
          <p className="lead">
            Copie os números por hora em texto puro ou salve o link.
          </p>
          <div className="receipt-actions">
            <button type="button" className="btn btn--on-dark" onClick={onCopyReceipt}>
              {copiedReceipt ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span>{copiedReceipt ? 'Recibo copiado' : 'Copiar recibo'}</span>
            </button>
            <button type="button" className="btn btn--on-dark" onClick={onCopyLink}>
              {copiedLink ? <Check size={16} aria-hidden="true" /> : <Link size={16} aria-hidden="true" />}
              <span>{copiedLink ? 'Link copiado' : 'Copiar link'}</span>
            </button>
          </div>
        </div>

        <div
          data-slot="receipt-box"
          data-kind="product"
          data-alt="Recibo de texto puro com resumo copiável e link compartilhável"
        >
          <pre className="receipt-pre">{receiptText}</pre>
        </div>
      </div>
    </section>
  );
}
