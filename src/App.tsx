import { useEffect, useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroCounter } from './components/HeroCounter';
import { CorrosionBento } from './components/CorrosionBento';
import { ScenarioSwitcher } from './components/ScenarioSwitcher';
import { BrutalStatement } from './components/BrutalStatement';
import { TradeoffTool } from './components/TradeoffTool';
import { ReceiptBand } from './components/ReceiptBand';
import { Footer } from './components/Footer';
import {
  CalcInputs,
  buildPlainTextReceipt,
  buildUrlFromInputs,
  calculateRealHourly,
  parseInputsFromUrl,
  syncInputsToUrl,
} from './lib/calculator';

export function App() {
  const [inputs, setInputs] = useState<CalcInputs>(() =>
    parseInputsFromUrl(typeof window !== 'undefined' ? window.location.search : ''),
  );
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const result = useMemo(() => calculateRealHourly(inputs), [inputs]);

  useEffect(() => {
    syncInputsToUrl(inputs);
  }, [inputs]);

  const handleUpdateField = <K extends keyof CalcInputs>(field: K, value: CalcInputs[K]) => {
    setInputs((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'daysPerWeek') {
        next.onsiteDaysPerWeek = Math.min(next.onsiteDaysPerWeek, Number(value));
      }
      return next;
    });
  };

  const handleUpdateTotalCosts = (total: number) => {
    const clean = Math.max(0, Math.round(total));
    setInputs((prev) => {
      const prevTotal = prev.transportCost + prev.foodOutCost + prev.otherWorkCost;
      if (prevTotal <= 0) {
        const transportCost = Math.round(clean * 0.4);
        const foodOutCost = Math.round(clean * 0.45);
        return {
          ...prev,
          transportCost,
          foodOutCost,
          otherWorkCost: Math.max(0, clean - transportCost - foodOutCost),
        };
      }
      const transportCost = Math.round((prev.transportCost / prevTotal) * clean);
      const foodOutCost = Math.round((prev.foodOutCost / prevTotal) * clean);
      const otherWorkCost = Math.max(0, clean - transportCost - foodOutCost);
      return { ...prev, transportCost, foodOutCost, otherWorkCost };
    });
  };

  const handleSelectRegime = (onsiteDays: number) => {
    setInputs((prev) => ({
      ...prev,
      onsiteDaysPerWeek: Math.min(prev.daysPerWeek, Math.max(0, onsiteDays)),
    }));
  };

  const handleCopyReceipt = async () => {
    const text = buildPlainTextReceipt(inputs, result);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      window.setTimeout(() => setCopiedReceipt(false), 2000);
    } catch {
      setCopiedReceipt(false);
    }
  };

  const handleCopyLink = async () => {
    const url = buildUrlFromInputs(inputs);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <>
      <a className="skip" href="#main">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="main">
        <HeroCounter
          inputs={inputs}
          result={result}
          onUpdateField={handleUpdateField}
          onUpdateTotalCosts={handleUpdateTotalCosts}
          onSelectRegime={handleSelectRegime}
          onCopyReceipt={handleCopyReceipt}
          copiedReceipt={copiedReceipt}
        />
        <CorrosionBento
          inputs={inputs}
          result={result}
          onUpdateField={handleUpdateField}
        />
        <ScenarioSwitcher inputs={inputs} />
        <BrutalStatement />
        <TradeoffTool result={result} />
        <ReceiptBand
          inputs={inputs}
          result={result}
          onCopyReceipt={handleCopyReceipt}
          copiedReceipt={copiedReceipt}
          onCopyLink={handleCopyLink}
          copiedLink={copiedLink}
        />
      </main>
      <Footer />
    </>
  );
}

export default App;
