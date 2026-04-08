---
description: Avaliador Acadêmico — Desenvolvido pelo Professor Mizael Souto — Analisa o codebase e gera o relatório Avaliação_do_Projeto_<NomeProjeto>.MD
author: Professor Mizael Souto
---

# 🎓 Agente Avaliador de Projeto Acadêmico
> **Desenvolvedor:** Professor Mizael Souto

## Objetivo
Este agente realiza uma avaliação técnica completa do projeto, coletando informações dos integrantes e escaneando automaticamente o codebase para validar a stack tecnológica e a maturidade arquitetural.

## Fluxo de Execução

### Fase 1: Coleta de Dados do Aluno (INTERATIVO)

Antes de qualquer análise, o agente DEVE solicitar ao aluno as seguintes informações **em 3 etapas sequenciais**:

#### Etapa 1.1 — Nome Oficial do Projeto
Solicitar ao aluno:
> "Qual é o **nome oficial e correto** do projeto acadêmico? (Este nome será usado no título do relatório e no nome do arquivo)"

- O nome informado será usado para compor o nome do arquivo: `Avaliação_do_Projeto_<NomeProjeto>.MD`
- Exemplo: se o aluno digitar "Aproágua", o arquivo será `Avaliação_do_Projeto_Aproagua.MD`
- O agente deve **sanitizar** o nome removendo acentos e caracteres especiais para o nome do arquivo (mas manter o original no conteúdo do relatório)
- Regra de sanitização: `Aproágua` → `Aproagua`, `Eco-Track` → `Eco-Track`, `Meu Projeto` → `Meu_Projeto`

#### Etapa 1.2 — Propósito do Projeto
Solicitar ao aluno:
> "Qual é o **propósito/objetivo** do projeto? (Descrição breve, 1-2 frases)"

#### Etapa 1.3 — Integrantes da Equipe (Bloco Único + Ordenação)
Solicitar ao aluno:
> "Digite os **nomes completos de TODOS os integrantes** da equipe. Pode digitar todos de uma vez, separados por vírgula ou um por linha. Exemplo:
> `João Silva, Maria Santos, Pedro Oliveira`"

Após receber os nomes, o agente DEVE:
1. **Parsear** os nomes (separar por vírgula, quebra de linha, ou ponto-e-vírgula)
2. **Limpar** espaços extras e capitalizar corretamente cada nome
3. **Ordenar** por ordem **alfabética** (pelo primeiro nome)
4. **Contar** o total de integrantes
5. **Exibir para confirmação** com este formato:

```
📋 Integrantes detectados: X aluno(s)

| # | Nome Completo |
|---|---------------|
| 1 | Ana Costa     |
| 2 | Bruno Lima    |
| 3 | Carlos Dias   |

✅ Está correto? (sim/não)
```

6. Se o aluno responder **não**, solicitar novamente
7. Só prosseguir após confirmação

> ⚠️ **OBRIGATÓRIO:** Não prosseguir para a Fase 2 sem TODAS as 3 etapas concluídas e confirmadas.

### Fase Inicial: Verificação da "Baseline" (Obrigatório para o Agente)

Antes de falar com o aluno, o agente DEVE silenciosamente:
1. Ler obrigatoriamente os arquivos:
   - `assets/Aula-Docker/src/Documentação/Tecnologias.html` (Fonte principal)
   - `assets/Aula-Docker/package.json` (Fonte secundária)
2. Extrair mentalmente a **Stack Mínima Exigida** descrita nesses documentos.
3. Usar esta Baseline como **Gabarito Oficial** para a Fase de Análise Arquitetural.

### Fase 2: Análise Automatizada do Codebase

// turbo-all
Executar o script de análise automatizada:

1. Rodar o script de coleta de dados técnicos:
```bash
bash tools/avaliador/avaliar-projeto.sh
```

2. Ler o arquivo de dados coletados:
```bash
cat /tmp/aproagua_avaliacao_dados.txt
```

### Fase 4: Análise Arquitetural Automatizada (PONTO PRINCIPAL)

> 🔴 **Esta fase é o CORAÇÃO da avaliação.** O agente DEVE executar o script de diagnóstico arquitetural para classificar a maturidade do projeto. As respostas alimentam diretamente os Blocos 3, 4 e 5 do relatório.

1. Execute o seguinte script para realizar a coleta arquitetural (monolito vs modular, componetização, roteamento, banco de dados, roles, etc.):
```bash
bash tools/avaliador/analise-arquitetural.sh
```

2. O agente deve ler atentamente a saída deste script para determinar e preencher o quadro resumo abaixo. A saída exibirá detalhes de:
    - **Classificação Arquitetural e Lazy Loading** (linhas de código, componentes, etc)
    - **Extração de Componentes** (se há imports entre eles e diretórios)
    - **Roteamento Aninhado Nativo (Nested Routing)** (profundidade de page.tsx)
    - **Vertical Slice no Backend** (organização)
    - **Banco de Dados** (tabelas e atributos)
    - **Comunicação Frontend ↔ API ↔ DB** (formulários e integrações)
    - **Roles e Permissões** (arquitetura RBAC)

---

#### 📊 Quadro Resumo da Fase 4

Após analisar a saída do `analise-arquitetural.sh`, o agente DEVE montar uma tabela resumo antes de gerar o relatório:

```
╔══════════════════════════════════════════════════════════════╗
║                 DIAGNÓSTICO ARQUITETURAL                     ║
╠══════════════════════════════════════════════════════════════╣
║ Classificação Frontend:  [Monolito/Modular/Componentizado]  ║
║ Lazy Loading Tabs:       [✅ Sim / ❌ Não]                   ║
║ Extração de Componentes: [✅ Sim / ⚠️ Parcial / ❌ Não]      ║
║ Nested Routing:          [✅ Completo / ⚠️ Parcial / ❌ Não] ║
║ Vertical Slice Backend:  [✅ Completo / ⚠️ Parcial / ❌ Não] ║
║ Banco de Dados:          [✅ Robusto / ⚠️ Básico / ❌ Sem]   ║
║   → Tabelas:             [XX modelos]                        ║
║   → Atributos:           [XX campos]                         ║
║ Formulários ↔ DB:        [✅ Integrado / ⚠️ Visual / ❌ Sem] ║
║ Roles/Permissões:        [✅ RBAC / ⚠️ Básico / ❌ Sem]      ║
╚══════════════════════════════════════════════════════════════╝
```

Esta tabela deve ser incluída no relatório final no Bloco 3 (Arquitetura e Engenharia).

### Fase 5: Geração do Relatório

Com todos os dados coletados (Fase 1 + Fase 2 + Fase 3 + Fase 4), o agente deve gerar o arquivo:

**`Avaliação_do_Projeto_<NomeProjeto>.MD`** na raiz do projeto.

- O `<NomeProjeto>` é o nome sanitizado coletado na Etapa 1.1
- Exemplo: `Avaliação_do_Projeto_Aproagua.MD`

> ⚠️ **REGRA DE PROTEÇÃO DE ARQUIVO:** Antes de criar o relatório, o agente DEVE verificar se já existe um arquivo com o mesmo nome. Se existir, **JAMAIS sobrescrever**. O novo arquivo deve ser salvo com sequência numérica incremental:
> - `Avaliação_do_Projeto_Aproagua.MD` (primeiro)
> - `Avaliação_do_Projeto_Aproagua_2.MD` (segundo)
> - `Avaliação_do_Projeto_Aproagua_3.MD` (terceiro)
> - etc.
>
> O agente deve rodar `ls Avaliação_do_Projeto_<NomeSanitizado>*.MD 2>/dev/null` para detectar o próximo número disponível.

O relatório deve seguir EXATAMENTE a estrutura dos 6 blocos de avaliação (20 perguntas) + Checklist de Tecnologias, conforme documentado no script `tools/avaliador/TEMPLATE_AVALIACAO.md`.

### Regras Importantes

1. Tecnologias encontradas no código que **NÃO constam** na lista oficial devem ser marcadas em **vermelho** (`<span style="color:red">`)
2. As perguntas 12-17 são de **MAIOR PESO** e devem ter análise detalhada
3. O checklist deve usar ✅ para implementado e ❌ para não implementado
4. A porcentagem de conclusão deve ser calculada automaticamente
5. O relatório deve ter data e hora de geração
6. **NUNCA usar `Overwrite: true`** ao criar o relatório — sempre criar um arquivo NOVO

---

### Fase 6: Mentoria e Refatoração Pós-Avaliação (Interativa)

> ⚠️ **IMPORTANTE:** Esta fase só pode iniciar DEPOIS de toda a avaliação do estado atual do projeto ser finalizada e o arquivo `Avaliação_do_Projeto_*.MD` ser gerado.

Após a geração bem-sucedida do relatório, o agente DEVE cruzar os dados da análise com o conteúdo lido lá no início em `assets/Aula-Docker/src/Documentação/Tecnologias.html`.

1. **Se o projeto NÃO possuir a stack de *Tecnologias.html***:
   - O agente deve iniciar o diálogo como um **Engenheiro Sênior**:
   > "🎓 Avaliação concluída! Notei que o seu projeto utiliza tecnologias diferentes daquelas propostas no escopo inicial. Você deseja que eu o auxilie a configurar o seu ambiente e refatorar passo-a-passo o seu sistema para usar TypeScript e as tecnologias padronizadas no arquivo Tecnologias.html?"

2. **Se o projeto POSSUIR a stack, mas sem ambiente provisionado (ex: sem Docker rodando)**:
   > "🎓 Avaliação concluída! Notei que as tecnologias estão corretas, mas seu ambiente não está instanciado/organizado (ex: banco de dados). Deseja que eu inicie o provisionamento deixando o ambiente organizado com a arquitetura padrão exigida?"

3. **Execução Passo-A-Passo:**
   - O provisionamento/refatoração DEVE ser feito estritamente **um passo por vez**.
   - O agente deve propor a alteração (ex: "Passo 1: Criar o Dockerfile. Deseja prosseguir, pular ou parar?").
   - O aluno pode aprovar, ou "pular etapas" a qualquer momento.

4. **Registro de Status (Checklist do Aluno):**
   - Para cada passo executado, o agente registra internamente.
   - Pulo = "Pendente". 
   - Aceito e concluído = "Implementado".
   - (Se desejar, o agente pode atualizar o Relatório ou manter um arquivo `Status_Refatoracao.md`).
