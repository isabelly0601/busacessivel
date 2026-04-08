---
description: Avaliador Acadêmico (Versão Simples) — Desenvolvido pelo Professor Mizael Souto — Analisa o codebase e gera o relatório Avaliação_do_Projeto_<NomeProjeto>.MD
author: Professor Mizael Souto
---

# 🎓 Agente Avaliador de Projeto Acadêmico (Versão Simples)
> **Desenvolvedor:** Professor Mizael Souto

## Objetivo
Este agente realiza uma avaliação técnica básica do projeto, coletando informações dos integrantes e checando a infraestrutura essencial no codebase de forma direta.

## Fluxo de Execução

### Fase 1: Coleta de Dados do Aluno (INTERATIVO)

Antes de qualquer análise, o agente DEVE solicitar ao aluno as seguintes informações **em 3 etapas sequenciais**:

#### Etapa 1.1 — Nome Oficial do Projeto
Solicitar ao aluno:
> "Qual é o **nome oficial e correto** do projeto acadêmico? (Este nome será usado no título do relatório e no nome do arquivo)"

- O nome informado será usado para compor o nome do arquivo: `Avaliação_do_Projeto_<NomeProjeto>.MD`
- Exemplo: se o aluno digitar "Aproágua", o arquivo será `Avaliação_do_Projeto_Aproagua.MD`
- O agente deve **sanitizar** o nome removendo acentos e caracteres especiais para o nome do arquivo (mas manter o original no conteúdo do relatório)

#### Etapa 1.2 — Propósito do Projeto
Solicitar ao aluno:
> "Qual é o **propósito/objetivo** do projeto? (Descrição breve, 1-2 frases)"

#### Etapa 1.3 — Integrantes da Equipe (Bloco Único + Ordenação)
Solicitar ao aluno:
> "Digite os **nomes completos de TODOS os integrantes** da equipe. Pode digitar todos de uma vez, separados por vírgula ou um por linha."

Após receber os nomes, o agente DEVE:
1. **Parsear**, **Limpar**, e **Ordenar** por ordem alfabética.
2. Contar o total e exibir para confirmação em formato de tabela Markdown.
3. Perguntar: *"Está correto? (sim/não)"*
4. Só prosseguir após confirmação.

> ⚠️ **OBRIGATÓRIO:** Não prosseguir para a Fase 2 sem TODAS as etapas concluídas.

### Fase 2: Análise Automatizada do Codebase

// turbo-all
Executar o script base de análise:

1. Rodar o script de coleta de dados técnicos:
```bash
bash tools/avaliador/avaliar-projeto.sh
```

2. Ler o arquivo de dados coletados:
```bash
cat /tmp/aproagua_avaliacao_dados.txt
```

### Fase 3: Análise Complementar pelo Agente

O agente deve complementar a análise com algumas verificações manuais de bash:

1. **Verificar histórico Git**
```bash
git log --oneline -20 --format="%h %ad %s" --date=short
```

2. **Verificar estrutura modular Frontend**
```bash
ls -la aproagua-web/src/app/ aproagua-web/src/components/
```

3. **Verificar Vertical Slice no backend**
```bash
ls -la aproagua-api/src/
```

4. **Verificar Infraestrutura Docker e Nginx**
```bash
cat docker-compose.yml | head -5
ls nginx/conf.d/
```

5. **Verificar Certbot SSL**
```bash
grep -ri "certbot\|ssl\|443" nginx/conf.d/ 2>/dev/null || echo "Certbot não encontrado na config local"
```

### Fase 4: Geração do Relatório

Com todos os dados coletados das fases acima, gerar o arquivo:

**`Avaliação_do_Projeto_<NomeProjeto>.MD`** na raiz do projeto.

> ⚠️ **REGRA DE PROTEÇÃO DE ARQUIVO:** Antes de criar o relatório, veja se o nome já existe. Se sim, JAMAIS sobrescrever. Use sequência numérica:
> - `Avaliação_do_Projeto_Aproagua.MD` 
> - `Avaliação_do_Projeto_Aproagua_2.MD`

O relatório deve seguir a estrutura: `tools/avaliador/TEMPLATE_AVALIACAO.md`.

### Regras Importantes
1. Tecnologias não oficiais → `<span style="color:red">nome</span>`
2. Perguntas 12-17 de MAIOR PESO
3. O checklist usa ✅ e ❌
4. Porcentagem = automática
5. Apor data e hora.
6. NUNCA usar `Overwrite: true` ao gerar artefato.
