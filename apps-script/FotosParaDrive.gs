/* Fotos dos hidrantes do 4º BBM: My Maps -> Google Drive.
   Abre a planilha pelo ID (não depende da aba aberta) e, em todas as abas,
   procura as linhas cuja coluna "Foto (link)" tem link do My Maps
   (mymaps.usercontent.google.com). Para cada uma:
   1. baixa a foto;
   2. salva na pasta do Drive como "[Cidade]-[Endereço].png";
   3. escreve o link do Drive na coluna N da mesma linha.

   Pode rodar de novo sem duplicar: linhas com a coluna N preenchida são
   puladas, e um arquivo com o mesmo nome já na pasta é reaproveitado. */

const PLANILHA_ID = '1r4l1EQOIQNy0CF_t6A2HoP2JU3BSGgJ4zxmOJojj64U';
const PASTA_ID = '1tDbtcvcoVmumGIrFeOIQJZvuspiEkRDc';
const COLUNA_SAIDA = 14; // N

const norm_ = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const limpa_ = s => String(s).replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
const MYMAPS = /mymaps\.usercontent\.google\.com/;

function fotosParaDrive() {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);
  const pasta = DriveApp.getFolderById(PASTA_ID);
  const relatorio = [];

  for (const sh of ss.getSheets()) {
    const dados = sh.getDataRange().getValues();
    if (dados.length < 2) continue;
    const cab = dados[0].map(norm_);
    const cCid = cab.indexOf('cidade'), cEnd = cab.indexOf('endereco'),
          cRef = cab.indexOf('ponto de referencia'), cFoto = cab.indexOf('foto (link)');
    if (cCid < 0 || cEnd < 0 || cFoto < 0) continue;
    if (!dados.some((l, i) => i > 0 && MYMAPS.test(String(l[cFoto])))) continue;

    sh.getRange(1, COLUNA_SAIDA).setValue('Foto (Drive)');
    const usados = {};
    let feitos = 0, pulados = 0;
    const erros = [];

    for (let i = 1; i < dados.length; i++) {
      const linha = dados[i], url = String(linha[cFoto]).trim();
      if (!MYMAPS.test(url)) continue;

      // Nome do arquivo: [Cidade]-[Endereço].png; repetidos ganham " (2)", " (3)"...
      const end = String(linha[cEnd]).trim() || (cRef >= 0 ? String(linha[cRef]).trim() : '');
      const base = limpa_(linha[cCid] + '-' + end);
      usados[base] = (usados[base] || 0) + 1;
      const nome = (usados[base] > 1 ? base + ' (' + usados[base] + ')' : base) + '.png';

      if (String(linha[COLUNA_SAIDA - 1]).trim()) { pulados++; continue; }

      try {
        const existentes = pasta.getFilesByName(nome);
        let arquivo;
        if (existentes.hasNext()) {
          arquivo = existentes.next();
        } else {
          const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
          if (resp.getResponseCode() !== 200) throw new Error('download HTTP ' + resp.getResponseCode());
          arquivo = pasta.createFile(resp.getBlob().setName(nome));
        }
        try { arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* herda da pasta */ }
        sh.getRange(i + 1, COLUNA_SAIDA).setValue('https://drive.google.com/file/d/' + arquivo.getId() + '/view');
        SpreadsheetApp.flush();
        feitos++;
      } catch (e) {
        erros.push('  linha ' + (i + 1) + ': ' + e.message);
      }
    }
    relatorio.push('Aba "' + sh.getName() + '": ' + feitos + ' link(s) gravados na coluna N, ' + pulados + ' já estavam prontos.' +
      (erros.length ? '\n Falharam:\n' + erros.join('\n') : ''));
  }

  const msg = relatorio.length
    ? relatorio.join('\n\n')
    : 'Nenhuma aba com links do My Maps na coluna "Foto (link)" foi encontrada na planilha.';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
}
