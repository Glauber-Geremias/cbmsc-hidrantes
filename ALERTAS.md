# Alertas das unidades de saúde

Na janela de um hospital ou UPA, o botão **⚠️ Alerta** registra uma anormalidade
pontual (*Sem Raio X*, *Sem Tomografia*, *Sem vaga de UTI*).

- Qualquer pessoa com o app pode registrar um alerta ou apagá-lo pelo botão **Resolvido**.
- Cada alerta vale **24 horas** e depois some sozinho. Se o problema continuar, registre de novo no dia seguinte.
- Não há histórico: alertas vencidos ou resolvidos são apagados da planilha.
- No mapa, a unidade com alerta ganha contorno laranja e um **!**; com o mapa afastado, o grupo que a contém ganha contorno laranja.
- O app busca alertas novos ao abrir, a cada 2 minutos e ao voltar para a tela.

Os alertas ficam na aba **Alertas** da planilha pai (a mesma da aba *Batalhões*),
gravada por um pequeno script do Google ([apps-script/Alertas.gs](apps-script/Alertas.gs)).

## Instalação (uma vez)

1. Abra a **planilha pai** no Google Planilhas.
2. Menu **Extensões → Apps Script**.
3. Apague o que estiver no editor, cole todo o conteúdo de `apps-script/Alertas.gs` e clique em **Salvar** (💾).
4. Clique em **Implantar → Nova implantação**.
5. Na engrenagem ao lado de "Selecionar tipo", escolha **App da Web** e preencha:
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
6. Clique em **Implantar** e depois em **Autorizar acesso**. Escolha sua conta.
   Se aparecer "O Google não verificou este app", clique em **Avançado → Acessar (não seguro)**: o app é o seu próprio script.
7. Copie o **URL do app da Web** (termina em `/exec`).
8. No `index.html`, cole esse endereço em `ALERTAS_URL` e publique. Sem ele, o botão Alerta não aparece.

A aba **Alertas** é criada sozinha no primeiro uso.

## Mudanças depois

- **Opções da lista** (ex.: incluir "Sem Ressonância"): altere `ALERTA_OPCOES` no `index.html`. O script não precisa mudar.
- **Mudou o script?** Use **Implantar → Gerenciar implantações → ✏️ Editar → Versão: Nova versão → Implantar**.
  Assim o endereço continua o mesmo. Uma "Nova implantação" geraria outro endereço.
