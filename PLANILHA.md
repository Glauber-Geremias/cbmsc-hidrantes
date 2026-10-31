# Hidrantes pelas planilhas do Google

Cada **batalhão** mantém a sua própria planilha com os hidrantes de todas as
suas cidades. Uma **planilha pai** lista os batalhões e o link da planilha de
cada um. O app lê tudo sempre que é aberto: não é preciso publicar nada,
basta as planilhas estarem compartilhadas por link.

## Estrutura

```
PLANILHA PAI (administrador estadual)            ID configurado no app (SHEET_ID)
 aba "Batalhões"
 ┌──────────┬─────────────┬──────────────────┬───────┐
 │ Batalhão │ Cidade-sede │ Link da planilha │ Ativo │
 ├──────────┼─────────────┼──────────────────┼───────┤
 │ 17º BBM  │ Araranguá   │ https://docs...  │ Sim   │──> PLANILHA DO 17º BBM
 │ 4º BBM   │ Criciúma    │ https://docs...  │ Não   │      ├─ Instruções
 └──────────┴─────────────┴──────────────────┴───────┘      ├─ Hidrantes  ← o app lê esta aba
                                                            └─ Cidades    (lista suspensa)
```

Ordem de leitura do app:
1. Abre a planilha pai, na aba **Batalhões**.
2. Para cada linha com **Ativo** diferente de "Não", segue o **Link da planilha**.
3. Lê a aba **Hidrantes** de cada batalhão. Os batalhões são lidos ao mesmo
   tempo.

Se um batalhão tiver problema (link vazio, planilha não compartilhada ou aba
Hidrantes ausente), os outros continuam aparecendo. O app mostra uma faixa
amarela dizendo qual batalhão falhou e por quê.

No app, o filtro **Batalhão** aparece automaticamente quando há mais de um
batalhão com hidrantes. Os filtros Cidade e Bairro passam a mostrar só as
opções do batalhão escolhido.

## Modelos

Os arquivos ficam na pasta `Hidrantes - Modelos Estaduais`:

| Arquivo | Uso |
|---|---|
| `Modelo - Planilha Batalhões.xlsx` | Planilha pai. Já criada. |
| `Modelo - Planilha do Batalhão.xlsx` | Em branco. Enviar a cada batalhão novo. |
| `17º BBM - Hidrantes.xlsx` | O 17º BBM já no formato novo. Já criada. |

Para transformar um `.xlsx` em planilha Google: Google Drive → **Novo →
Upload de arquivo**, abra o arquivo e use **Arquivo → Salvar como Planilhas
Google**.

## Incluir um batalhão (sem mexer no app)

**Responsável do batalhão:**
1. Recebe o `Modelo - Planilha do Batalhão.xlsx` e o converte em planilha
   Google.
2. Escreve as cidades do batalhão na aba **Cidades**. Elas alimentam a lista
   suspensa da coluna Cidade.
3. Cadastra os hidrantes na aba **Hidrantes**.
4. Em **Compartilhar → Acesso geral**, escolhe "Qualquer pessoa com o link"
   → **Leitor**, e adiciona o administrador estadual como **Editor**.
5. Envia o link da planilha ao administrador.

**Administrador estadual:**
1. Na planilha pai, aba **Batalhões**, cria uma linha com o nome do batalhão,
   a cidade-sede e o link. Pode ser o link completo da barra do navegador.
2. Deixa **Ativo = Não** enquanto o batalhão ainda está preenchendo, e muda
   para **Sim** quando estiver pronto. O batalhão aparece no app na próxima
   abertura.

## Regras para não quebrar a leitura

- Planilha pai: a aba **Batalhões** deve ser a **primeira** e manter esse
  nome. Não renomeie as colunas Batalhão, Link da planilha e Ativo.
- Planilha do batalhão: a aba deve se chamar exatamente **Hidrantes**. Não
  renomeie as colunas. O app as encontra pelo nome, então a ordem pode mudar.
- Se a aba Hidrantes não existir, o Google devolve a primeira aba
  (Instruções). O app percebe que não há coluna Coordenadas e avisa.
- **Todas** as planilhas (pai e batalhões) precisam estar como "Qualquer
  pessoa com o link → Leitor".

## Colunas da aba Hidrantes

| Coluna | Obrigatória | Observação |
|---|---|---|
| Cidade | sim | Escolhida na lista (aba Cidades). Aparece no filtro do app. |
| Bairro | não | Aparece no filtro de bairros. |
| Endereço | sim | Rua e esquina/número. |
| Coordenadas | sim | `-28.939028, -49.476444` (copiado do Google Maps) ou `28°56'02.7"S 49°29'00.4"W`. Sem coordenadas, o hidrante não aparece no mapa. |
| Ponto de Referência | não | |
| Condição | sim | Boa (verde), Necessita reparo (laranja) ou Inoperante (preto). |
| Estado Geral | não | Aparece como "Situação" no app. |
| Vazão, Ações Realizadas, Providências | não | Texto livre. |
| Data da Vistoria | não | Aparece como "Última vistoria" no app. |
| Foto (link) | não | Link de foto no Google Drive (compartilhada por link). Aparece como "📷 Ver foto". |

## Observações

- Alterações nas planilhas aparecem no app na próxima vez que ele for aberto
  ou recarregado.
- **Sem internet**, o app mostra a última lista baixada.
- Os dados ficam visíveis a qualquer pessoa com o link. Não coloque nomes,
  telefones ou informações restritas.
- O histórico de alterações de cada planilha fica em **Arquivo → Histórico
  de versões**.
