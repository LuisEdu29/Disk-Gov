# Disk Gov — Protótipo Mobile

Protótipo de alta fidelidade para um aplicativo que reúne serviços públicos essenciais em um único lugar.

## Objetivo

Facilitar a localização e o acesso a serviços como Polícia, Bombeiros, SAMU, Conselho Tutelar, Defesa Civil e Guarda Municipal.

## Requisitos da atividade aplicados

### 1. Zona do polegar
- Navegação principal fixa na parte inferior.
- Botões com área de toque confortável.
- Ações principais posicionadas em regiões acessíveis em uma tela mobile.

### 2. Skeleton Screen / antecipação aos dados
- Ao abrir o protótipo, a interface apresenta uma tela de carregamento com skeleton.
- Depois de um pequeno intervalo, o conteúdo real aparece.

### 3. Confirmação por gestos
- A lista de atendimentos recentes permite arrastar um item para a esquerda.
- Ao arrastar suficientemente, o item é removido.
- Existe uma área visual indicando a ação de exclusão.

### 4. Microinterações progressivas
- Framer Motion é usado para:
  - entrada da interface;
  - feedback de toque nos cards;
  - abertura/fechamento do modal;
  - toast de confirmação;
  - gesto de arrastar;
  - transições entre páginas.


## Observação

Este é um protótipo de interface. Os números e a localização são apresentados para demonstrar o fluxo; uma versão de produção deve validar os contatos oficiais e integrar um serviço de mapas/localização.
