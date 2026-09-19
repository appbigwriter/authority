# Receipt — diagnóstico das três pastas do Authority Engine

**Data:** 2026-09-19
**Owner:** David
**Escopo:** somente leitura; nenhuma pasta, branch ou worktree removida.

## Conclusão verificada

- `F:/Projetos/_FBR/AuthorityEngine` é a fonte canônica: branch `main`, `origin/main`, HEAD `bf9d704`.
- `F:/Projetos/_FBR/AuthorityEngine-backend-fix` é um worktree Git ligado a `.git/worktrees/AuthorityEngine-backend-fix`, branch `fix/authority-backend-20260918`, HEAD `50f33a7`.
- `F:/Projetos/_FBR/AuthorityEngine-ui-fix` é um worktree Git ligado a `.git/worktrees/AuthorityEngine-ui-fix`, branch `fix/authority-ui-20260918`, HEAD `50f33a7`.
- As duas branches `*-fix` foram criadas no mesmo timestamp (`2026-09-18 14:49:05 -03:00`) a partir do mesmo commit e têm o mesmo conteúdo/HEAD.
- `main` está dois commits à frente das branches `*-fix`: `c00143d` e `bf9d704`.
- Os commits posteriores em `main` incluem o relatório de auditoria e a integração final de dashboard/contratos/receipts; não há diff exclusivo pendente nas duas worktrees.
- Os três diretórios usam o mesmo remote: `https://github.com/appbigwriter/authority.git`.

## Interpretação

As pastas foram deixadas por uma execução paralela de trabalho/subagentes (uma frente backend e outra UI). São ambientes de trabalho Git separados, não três projetos Authority independentes. Os nomes representam o escopo pretendido da execução, mas as branches não receberam commits próprios e permaneceram no ponto-base.

## Recomendação segura

- Usar somente `F:/Projetos/_FBR/AuthorityEngine` para novos testes e alterações.
- Não apagar worktrees/branches automaticamente; antes, confirmar com Sergio se os ambientes não estão sendo usados.
- Se autorizado, fazer limpeza Git explícita com `git worktree remove` e depois remover as branches locais/remotas somente se desejado. Essa limpeza não foi executada.

## Evidência

- `git worktree list --porcelain`
- `git branch -avv`
- `git log --all --graph --decorate --oneline`
- reflogs das três branches
- `git rev-list --left-right --count main...fix/authority-backend-20260918` = `2 0`
- status limpo nas três worktrees durante a inspeção.
