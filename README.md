# Quanto Vale Meu Tempo? (Hora Real)

Calculadora interativa client-side que desconta tempo de deslocamento, rotina não remunerada e custos diretos do trabalho para calcular o **valor real da sua hora de vida**.

🔗 **Demo:** [https://kasprzak-k.github.io/quanto-vale-meu-tempo/](https://kasprzak-k.github.io/quanto-vale-meu-tempo/)

---

## O Problema

O cálculo tradicional divide o salário pelo total de horas contratuais (ex: R$ 5.000 ÷ 173h = **R$ 28,87/h**).

Esse número ignora:
1. **O tempo que você doa:** trânsito diário, preparação matinal, descompressão e horas extras não pagas.
2. **O dinheiro que você gasta para trabalhar:** passagens, combustível, estacionamento, alimentação fora e roupas/equipamentos obrigatórios.

Ao deduzir esses fatores, a **hora real** costuma ser 25% a 50% menor do que o número na carteira.

---

## Funcionalidades

- **Cálculo da Hora Real vs. Nominal:** Exibe o valor líquido real por hora e a taxa de corrosão do seu tempo e renda.
- **Comparativo de Regimes:** Alterne entre **Presencial**, **Híbrido** e **Remoto**, descobrindo o salário equivalente necessário para uma vaga presencial empatar financeiramente com uma remota.
- **Preço em Horas de Vida:** Converta o preço de itens de consumo (ex: smartphone, carro, aluguel) em horas, dias úteis ou meses de trabalho real necessários para pagá-los.
- **Avaliador de Conveniência:** Verifique matematicamente se vale a pena terceirizar uma tarefa (faxina, delivery, corrida por app) considerando o valor da sua hora livre.
- **Recibo em Texto Puro & Link Permanente:** Compartilhe ou salve o diagnóstico com parâmetros sincronizados na URL (`?salario=...`).
- **100% Client-side:** Nenhum dado financeiro sai do seu navegador.

---

## Fórmulas

$$ \text{Horas Totais Dedicadas} = \text{Horas Contratadas} + (\text{Horas de Trânsito} + \text{Horas Invisíveis}) \times \text{Dias Presenciais} \times 4.33 $$

$$ \text{Sobra Líquida} = \text{Salário Líquido} - \text{Custos de Trabalho (transporte, refeição, outros)} $$

$$ \text{Hora Real} = \frac{\text{Sobra Líquida}}{\text{Horas Totais Dedicadas}} $$

$$ \text{Corrosão} = \frac{\text{Hora Nominal} - \text{Hora Real}}{\text{Hora Nominal}} \times 100\% $$

---

## Stack

- **React 19**
- **TypeScript**
- **Vite 6**
- **Tailwind CSS**
- **Lucide React**
- **Node Test Runner** (`node:test` nativo, sem dependências externas pesadas)

---

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/Kasprzak-k/quanto-vale-meu-tempo.git
cd quanto-vale-meu-tempo

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Rode os testes unitários
npm test

# 5. Gere a build de produção
npm run build
```

