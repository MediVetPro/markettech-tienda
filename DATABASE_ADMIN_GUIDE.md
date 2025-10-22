# Guia de Administração da Base de Dados

## Visão Geral

O sistema de administração da base de dados permite aos administradores gerenciar completamente os dados da aplicação, incluindo limpeza, backup e restore. **ATENÇÃO: Estas operações são irreversíveis e devem ser usadas com extrema cautela.**

## Funcionalidades

### 1. Limpeza Parcial
- **O que faz**: Remove todos os dados exceto usuários
- **Inclui**: Produtos, pedidos, mensagens, notificações, carrinho, reviews, etc.
- **Preserva**: Todos os usuários e suas contas
- **Acesso**: Apenas administradores

### 2. Limpeza Completa
- **O que faz**: Remove TODOS os dados, mantendo apenas a conta do administrador atual
- **Inclui**: Todos os usuários (exceto admin atual), produtos, pedidos, mensagens, etc.
- **Preserva**: Apenas a conta do administrador que executa a operação
- **Acesso**: Apenas administradores
- **Confirmação**: Requer digitação de "LIMPAR TUDO" para confirmar

### 3. Backup e Restore
- **Backup**: Cria um arquivo SQL completo da base de dados
- **Restore**: Restaura a base de dados a partir de um arquivo de backup
- **Formato**: Arquivos .sql compatíveis com PostgreSQL

### 4. Visualização da Estrutura
- **Mostra**: Tabelas, colunas, relacionamentos e índices
- **Estatísticas**: Número de registros por tabela
- **Relacionamentos**: Chaves estrangeiras entre tabelas

## Como Usar

### Acessar o Painel
1. Faça login como administrador
2. Acesse o painel administrativo
3. Clique em "Base de Dados" (ícone vermelho)

### Limpeza Parcial
1. Clique em "Limpar Dados (Manter Usuários)"
2. Confirme a operação no popup
3. Aguarde a conclusão

### Limpeza Completa
1. Clique em "Limpar Tudo (Só Admin)"
2. Confirme a operação no popup
3. Digite "LIMPAR TUDO" para confirmar
4. Aguarde a conclusão

### Backup
1. Clique em "Criar Backup"
2. O arquivo será baixado automaticamente
3. Guarde o arquivo em local seguro

### Restore
1. Clique em "Escolher arquivo"
2. Selecione um arquivo .sql de backup
3. Confirme a operação
4. Aguarde a conclusão

### Ver Estrutura
1. Clique em "Ver Estrutura"
2. Visualize as tabelas e relacionamentos
3. Veja estatísticas de registros

## Segurança

### Validações Implementadas
- ✅ Apenas usuários com role "ADMIN" podem acessar
- ✅ Verificação de token JWT em todas as operações
- ✅ Confirmações duplas para operações destrutivas
- ✅ Transações de base de dados para consistência
- ✅ Limpeza de arquivos temporários

### Permissões
- **Administradores**: Acesso completo
- **Administradores de Vendas**: Sem acesso
- **Clientes**: Sem acesso

## Estrutura da Base de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `products` - Produtos
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `messages` - Mensagens
- `notifications` - Notificações
- `product_images` - Imagens dos produtos

### Relacionamentos
- Usuários → Produtos (1:N)
- Usuários → Pedidos (1:N)
- Pedidos → Itens (1:N)
- Produtos → Imagens (1:N)
- Usuários → Mensagens (1:N)

## Backup e Restore

### Formato do Backup
- **Tipo**: SQL plain text
- **Inclui**: Dados, estrutura, índices, relacionamentos
- **Compatível**: PostgreSQL
- **Tamanho**: Varia conforme quantidade de dados

### Processo de Restore
1. Validação do arquivo (.sql)
2. Criação de arquivo temporário
3. Execução do comando psql
4. Limpeza de arquivos temporários

## Limpeza de Dados

### Limpeza Parcial - Tabelas Afetadas
```sql
-- Dados de produtos
product_ratings, review_votes, reviews, wishlist_items, 
saved_comparisons, coupon_usages, coupons, cart_items, 
user_carts, inventory_alerts, inventory_movements, 
inventory, product_images, products

-- Dados de pedidos
seller_payouts, pix_payments, payments, order_items, orders

-- Dados de comunicação
chat_participants, chat_messages, chat_rooms, messages, 
notifications, notification_logs, notification_preferences, 
push_subscriptions

-- Dados de analytics
user_events, user_sessions, analytics_metrics

-- Dados de pagamento
payment_methods, global_payment_methods, global_payment_profiles

-- Dados de comissão
commission_settings

-- Dados de WhatsApp
whatsapp_messages, whatsapp_sessions
```

### Limpeza Completa - Tabelas Afetadas
- **Todas as tabelas da limpeza parcial**
- **Mais**: Todos os usuários exceto o administrador atual
- **Resultado**: Base de dados limpa com apenas o admin atual

## Arquivos e Imagens

### Limpeza de Arquivos
- **Imagens de produtos**: Deletadas do sistema de arquivos
- **Uploads**: Diretório limpo completamente
- **Backups temporários**: Removidos após uso

### Estrutura de Arquivos
```
public/
├── uploads/
│   ├── products/     # Imagens dos produtos
│   └── site-config/  # Configurações do site
└── temp/            # Arquivos temporários (backup/restore)
```

## Monitoramento

### Logs
- Todas as operações são logadas no console
- Erros são capturados e reportados
- Operações bem-sucedidas são confirmadas

### Estatísticas
- Contagem de registros por tabela
- Tamanho dos arquivos
- Status das operações

## Troubleshooting

### Problemas Comuns
1. **Erro de permissão**: Verificar se o usuário é ADMIN
2. **Erro de backup**: Verificar se pg_dump está instalado
3. **Erro de restore**: Verificar se o arquivo é válido
4. **Erro de limpeza**: Verificar conexão com a base de dados

### Soluções
1. Verificar logs do servidor
2. Confirmar permissões do usuário
3. Verificar configuração da base de dados
4. Testar operações individuais

## Recomendações

### Antes de Usar
1. **SEMPRE** fazer backup antes de limpezas
2. Testar em ambiente de desenvolvimento primeiro
3. Informar todos os usuários sobre manutenção
4. Ter plano de rollback preparado

### Melhores Práticas
1. Fazer backups regulares
2. Documentar operações realizadas
3. Manter logs de auditoria
4. Treinar equipe sobre uso correto

## Suporte

Para problemas ou dúvidas:
1. Verificar logs do sistema
2. Consultar documentação técnica
3. Contatar administrador do sistema
4. Reportar bugs ou melhorias

---

**⚠️ AVISO IMPORTANTE**: Estas operações são irreversíveis. Use com extrema cautela e sempre faça backup antes de qualquer operação destrutiva.
