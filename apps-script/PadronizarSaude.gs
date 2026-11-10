/* Padroniza a aba "Saúde" das planilhas dos batalhões.

   Em todas:
   - Coluna Atendimento 24h (H2:H1000): "Sim" em verde e "Não" em cinza.
     As regras antigas dessa coluna são trocadas (não duplica ao rodar de novo);
     regras de outras colunas ficam como estão.

   Opções de cada batalhão (em PLANILHAS):
   - listaCidade:
       true  = coluna Cidade da Saúde (A2:A1000) com lista suspensa vinda da aba
               Cidades; valor fora da lista só ganha aviso, nada é bloqueado.
       false = lista suspensa retirada (texto livre).
   - completarCidades:
       true  = as cidades usadas na Saúde ou nos Hidrantes que faltam na aba
               Cidades são acrescentadas no fim dela (cidades com "*" entram com
               o asterisco: próximas, fora da área do CBMSC, mas com recursos
               de emergência).
       false = a aba Cidades não é mexida.

   Nenhum dado das abas Saúde e Hidrantes é alterado.
   Para incluir outro batalhão, acrescente uma linha em PLANILHAS. */

const PLANILHAS = {
  '17º BBM': { id: '1MPN93U730i8wVSoFUOGP0NWa22noiBrnHAMbIjIuN1c', listaCidade: false, completarCidades: false },
  '4º BBM':  { id: '1r4l1EQOIQNy0CF_t6A2HoP2JU3BSGgJ4zxmOJojj64U', listaCidade: false, completarCidades: true },
};

/* Acrescenta na aba Cidades as cidades usadas na Saúde/Hidrantes que faltam nela. */
function completarCidades_(ss, cidades) {
  const lista = cidades.getRange('A2:A400').getValues().flat().map(v => String(v).trim()).filter(Boolean);
  const usadas = [];
  for (const nomeAba of ['Saúde', 'Hidrantes']) {
    const aba = ss.getSheetByName(nomeAba);
    if (!aba || aba.getLastRow() < 2) continue;
    aba.getRange(2, 1, aba.getLastRow() - 1, 1).getValues().flat()
      .map(v => String(v).trim()).filter(Boolean).forEach(c => usadas.push(c));
  }
  const novas = [...new Set(usadas.filter(c => !lista.includes(c)))];
  if (novas.length) {
    // Depois da última linha preenchida, para nunca escrever por cima de uma cidade.
    cidades.getRange(Math.max(cidades.getLastRow(), 1) + 1, 1, novas.length, 1).setValues(novas.map(c => [c]));
  }
  return novas;
}

function padronizarSaude() {
  const relatorio = [];
  for (const [nome, cfg] of Object.entries(PLANILHAS)) {
    try {
      const ss = SpreadsheetApp.openById(cfg.id);
      const saude = ss.getSheetByName('Saúde');
      if (!saude) throw new Error('aba "Saúde" não encontrada');
      const linhas = [];

      const cidades = ss.getSheetByName('Cidades');
      if ((cfg.listaCidade || cfg.completarCidades) && !cidades) throw new Error('aba "Cidades" não encontrada');

      // Aba Cidades
      if (cfg.completarCidades) {
        const novas = completarCidades_(ss, cidades);
        if (novas.length) linhas.push('Cidades: incluídas ' + novas.join(', '));
      }

      // Coluna Cidade da Saúde
      const colCidade = saude.getRange('A2:A1000');
      if (cfg.listaCidade) {
        colCidade.setDataValidation(SpreadsheetApp.newDataValidation()
          .requireValueInRange(cidades.getRange('A2:A400'), true)
          .setAllowInvalid(true)
          .setHelpText('Escolha uma cidade da aba Cidades.')
          .build());
        linhas.push('Saúde: lista suspensa de Cidade aplicada');
      } else {
        colCidade.clearDataValidations();
        linhas.push('Saúde: lista suspensa de Cidade retirada');
      }

      // Cores do Atendimento 24h
      const alvo = 'H2:H1000';
      const outras = saude.getConditionalFormatRules()
        .filter(r => !r.getRanges().some(g => g.getA1Notation() === alvo));
      const faixa = saude.getRange(alvo);
      const sim = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Sim').setBold(true).setFontColor('#1E6B41').setBackground('#D5F0DF')
        .setRanges([faixa]).build();
      const nao = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Não').setBold(true).setFontColor('#888888').setBackground('#EEEEEE')
        .setRanges([faixa]).build();
      saude.setConditionalFormatRules(outras.concat([sim, nao]));
      linhas.push('Saúde: cores do Atendimento 24h aplicadas');

      relatorio.push(nome + ':\n  ' + linhas.join('\n  '));
    } catch (e) {
      relatorio.push(nome + ': ERRO - ' + e.message);
    }
  }
  const msg = relatorio.join('\n');
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
}
