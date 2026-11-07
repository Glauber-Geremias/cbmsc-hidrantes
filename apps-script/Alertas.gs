/* Alertas das unidades de saúde (ex.: "Sem Raio X", "Sem Tomografia").
   Fica na planilha pai (Extensões → Apps Script) e é publicado como
   "App da Web". Passo a passo em ALERTAS.md.

   - Qualquer pessoa com o app pode registrar ou apagar um alerta.
   - Cada alerta vale 24 horas; os vencidos são apagados da aba a cada
     consulta (não há histórico).
   - As opções de anormalidade são definidas no app (ALERTA_OPCOES no
     index.html); aqui só se confere o tamanho dos textos. */

const ABA = 'Alertas';
const VALIDADE_MS = 24 * 60 * 60 * 1000;
const CABECALHO = ['ID', 'Chave da unidade', 'Unidade', 'Cidade', 'Alerta', 'Registrado em', 'Expira em'];

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(CABECALHO);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* Apaga os vencidos e devolve os ativos. */
function ativos_(sh) {
  const valores = sh.getDataRange().getValues();
  const agora = Date.now();
  const lista = [];
  for (let i = valores.length - 1; i >= 1; i--) {
    const [id, chave, unidade, cidade, alerta, criado, expira] = valores[i];
    const fim = new Date(expira).getTime();
    if (!id || !(fim > agora)) { sh.deleteRow(i + 1); continue; }
    lista.push({ id: String(id), chave: String(chave), unidade: String(unidade), cidade: String(cidade),
      alerta: String(alerta), criado: new Date(criado).getTime(), expira: fim });
  }
  return lista.reverse();
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function texto_(v, max) {
  const s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  if (!s || s.length > max) throw new Error('dados inválidos');
  // Evita que um texto seja interpretado como fórmula na planilha.
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function comTrava_(fn) {
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    return resposta_(fn(aba_()));
  } catch (e) {
    return resposta_({ ok: false, erro: e.message });
  } finally {
    trava.releaseLock();
  }
}

/* Leitura: lista dos alertas ativos. */
function doGet() {
  return comTrava_(sh => ({ ok: true, agora: Date.now(), alertas: ativos_(sh) }));
}

/* Gravação: { acao: 'criar', chave, unidade, cidade, alertas: [...] } ou { acao: 'apagar', id }. */
function doPost(e) {
  return comTrava_(sh => {
    const d = JSON.parse(e.postData.contents);
    let lista = ativos_(sh);
    if (d.acao === 'criar') {
      const chave = texto_(d.chave, 200), unidade = texto_(d.unidade, 150), cidade = texto_(d.cidade || '-', 80);
      const pedidos = Array.isArray(d.alertas) ? d.alertas.slice(0, 10) : [];
      if (!pedidos.length) throw new Error('nenhum alerta informado');
      const agora = new Date();
      for (const p of pedidos) {
        const alerta = texto_(p, 60);
        // O mesmo alerta já ativo nesta unidade não é duplicado.
        if (lista.some(a => a.chave === chave && a.alerta === alerta)) continue;
        sh.appendRow([Utilities.getUuid(), chave, unidade, cidade, alerta, agora, new Date(agora.getTime() + VALIDADE_MS)]);
      }
      lista = ativos_(sh);
    } else if (d.acao === 'apagar') {
      const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
      for (let i = ids.length - 1; i >= 1; i--) if (String(ids[i][0]) === String(d.id)) sh.deleteRow(i + 1);
      lista = ativos_(sh);
    } else {
      throw new Error('ação desconhecida');
    }
    return { ok: true, agora: Date.now(), alertas: lista };
  });
}
