# Hidrantes pela planilha do Google

Cada quartel cadastra os seus hidrantes numa aba de uma planilha do Google
Planilhas, e o app lê a planilha sempre que é aberto. Não é preciso publicar
nada: basta a planilha estar compartilhada por link.

## Como o app lê a planilha

```
Aba "Quartéis" (1ª aba)        Abas dos quartéis
┌──────────────────────┐       ┌─ Araranguá ──────────────┐
│ Aba                  │ ───>  ├─ Balneário Arroio do Silva┤ ───> App
│ Araranguá            │       ├─ Maracajá ───────────────┤
│ Balneário Arroio...  │       └─ (novos quartéis...) ────┘
│ Maracajá             │
└──────────────────────┘
```

O app abre a aba **Quartéis**, lê a lista de nomes da coluna **Aba** e baixa
cada uma dessas abas. Se uma aba falhar (por exemplo, por nome digitado
errado), as outras continuam aparecendo e o app mostra um aviso amarelo
dizendo qual falhou.

## 1. Criar a planilha a partir do modelo

1. No Google Drive, clique em **Novo → Upload de arquivo** e envie
   `Hidrantes CBMSC - Modelo v2.xlsx`.
2. Abra o arquivo e clique em **Arquivo → Salvar como Planilhas Google**.
   Daqui em diante, use só essa cópia em formato Google.
3. Confira que **Quartéis** é a **primeira aba**. Se o nome de uma aba listada
   não existir, o Google devolve a primeira aba no lugar dela. Sendo a
   Quartéis, o app percebe o erro e avisa, em vez de duplicar hidrantes.

O modelo já vem com:
- os 21 hidrantes atuais;
- os 3 de Araranguá que estão sem localização (eles ficam fora do mapa até
  ganharem coordenadas);
- a lista suspensa de **Condição**, com as cores.

Revise a coluna Condição de cada hidrante.

## 2. Compartilhar

Em **Compartilhar**:

- **Acesso geral**: "Qualquer pessoa com o link" → **Leitor**. O app precisa
  disso para ler a planilha.
- Adicione como **Editor** os e-mails dos responsáveis de cada quartel.

## 3. Proteger as abas (cada quartel edita só a sua)

Para cada aba de quartel: clique com o botão direito na aba →
**Proteger página** → **Definir permissões** → "Restringir quem pode editar
este intervalo" → deixe só você e os e-mails daquele quartel.

Proteja também as abas **Quartéis** e **Instruções**, deixando só os
administradores.

## 4. Ligar o app à planilha

O ID é o trecho do link entre `/d/` e `/edit`:

```
https://docs.google.com/spreadsheets/d/1AbC...xYz/edit#gid=0
                                       └── ID ──┘
```

Coloque o ID no início do script em `index.html`, faça commit e push:

```js
const SHEET_ID = '1AbC...xYz';
```

## Incluir um quartel novo

1. Botão direito numa aba de quartel → **Duplicar**. Renomeie, por exemplo,
   para "Sombrio", e apague as linhas de hidrantes, mantendo o cabeçalho.
2. Na aba **Quartéis**, escreva o nome da nova aba, **exatamente igual**.
3. Proteja a nova aba (passo 3) e adicione os editores daquele quartel.

Não é preciso mexer no app.

## Colunas

| Coluna | Obrigatória | Observação |
|---|---|---|
| Cidade | sim | Nome completo, com acento. Aparece no filtro do app. Se ficar vazia, o app usa o nome da aba. |
| Bairro | não | Aparece no filtro de bairros. |
| Endereço | sim | Rua e esquina/número. |
| Coordenadas | sim | `-28.939028, -49.476444` (copiado do Google Maps) ou `28°56'02.7"S 49°29'00.4"W`. Sem coordenadas, o hidrante não aparece. |
| Ponto de Referência | não | |
| Condição | sim | Boa (verde), Necessita reparo (laranja) ou Inoperante (preto). |
| Estado Geral | não | Texto exibido como "Situação" no app. |
| Vazão, Ações Realizadas, Providências | não | Texto livre. |
| Foto (link) | não | Link de foto no Google Drive (compartilhada por link). Aparece como "📷 Ver foto". |

**Não renomeie as colunas.** O app as encontra pelo nome, então a ordem pode
mudar, mas o nome não.

## Observações

- Alterações na planilha aparecem no app na próxima vez que ele for aberto
  ou recarregado.
- **Sem internet**, o app mostra a última lista baixada.
- Os dados ficam visíveis a qualquer pessoa com o link da planilha. Não
  coloque nomes, telefones ou informações restritas.
- O histórico de quem alterou o quê fica em **Arquivo → Histórico de versões**.
