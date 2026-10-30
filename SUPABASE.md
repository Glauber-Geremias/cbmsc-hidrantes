# Configuração do banco (Supabase)

O mapa é público. Só **gestores** cadastrados podem incluir, editar ou excluir
hidrantes, e apenas nas cidades da sua unidade. Essas regras ficam no próprio
banco: mesmo que alguém altere o app, o banco recusa a gravação.

Enquanto o Supabase não estiver configurado, o app continua lendo
`hidrantes.csv`, como antes.

## 1. Criar o projeto

1. Crie uma conta em <https://supabase.com>. O ideal é usar um e-mail
   institucional, não pessoal.
2. Clique em **New project**. Região: **South America (São Paulo)**.
3. Guarde a senha do banco em local seguro.

## 2. Criar as tabelas e carregar os hidrantes atuais

No menu **SQL Editor**:

1. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
2. Cole todo o conteúdo de [`supabase/seed.sql`](supabase/seed.sql) e clique em **Run**.
   Isso carrega os 21 hidrantes do 17º BBM.

## 3. Fechar o cadastro público de usuários

Em **Authentication → Sign In / Providers**:

- Desative **Allow new users to sign up**. Assim, só o administrador cria contas.
- Mantenha o provedor **Email** ativo.

## 4. Ligar o app ao banco

Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**
e cole no início do script em `index.html`:

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

A chave *anon* pode ficar pública: ela só permite o que as regras do banco
autorizam, ou seja, ler hidrantes. **Nunca** coloque a chave `service_role` no app.

Faça commit e push. O botão **🔐 Gestor** aparece no cabeçalho.

## 5. Cadastrar um gestor

1. Em **Authentication → Users → Add user → Create new user**, informe o
   e-mail e uma senha provisória e marque **Auto Confirm User**.
2. No **SQL Editor**, vincule o usuário à unidade e às cidades dele:

```sql
insert into public.gestores (user_id, nome, unidade, cidades)
select id, 'Sgt Fulano', '17º BBM / 1ª Cia', array['Araranguá', 'Maracajá']
from auth.users where email = 'fulano@cbm.sc.gov.br';
```

Para um **administrador**, que pode editar qualquer cidade:

```sql
insert into public.gestores (user_id, nome, unidade, admin)
select id, 'Seu nome', '17º BBM', true
from auth.users where email = 'seu.email@cbm.sc.gov.br';
```

> O nome da cidade precisa ser escrito **exatamente** como aparece nos
> hidrantes, com acentos: `Araranguá`, `Balneário Arroio do Silva`.

### Outras tarefas comuns

```sql
-- Incluir uma cidade na área de um gestor
update public.gestores set cidades = array_append(cidades, 'Sombrio')
where user_id = (select id from auth.users where email = 'fulano@cbm.sc.gov.br');

-- Ver todos os gestores
select u.email, g.nome, g.unidade, g.cidades, g.admin
from public.gestores g join auth.users u on u.id = g.user_id order by g.unidade;

-- Ver quem alterou cada hidrante por último
select h.cidade, h.endereco, h.atualizado_em, u.email
from public.hidrantes h left join auth.users u on u.id = h.atualizado_por
order by h.atualizado_em desc;
```

Para remover um gestor, exclua o usuário em **Authentication → Users**. O
vínculo em `gestores` é apagado junto. Para trocar uma senha esquecida, use
**Send password recovery** ou defina uma nova senha na mesma tela.

## Observações

- **Sem internet**, o app mostra a última lista de hidrantes baixada no aparelho.
- O plano gratuito do Supabase **pausa projetos sem acesso por 7 dias**. Com uso
  diário isso não acontece. Se acontecer, basta reativar no painel. Para uso
  oficial, avalie o plano pago ou uma conta institucional.
