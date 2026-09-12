# CHAMOU, FALOU 🚨

Aplicativo mobile para facilitar o acesso a serviços públicos e de
emergência em um único lugar.

## Sobre o projeto

O **CHAMOU, FALOU** é um protótipo de alta fidelidade com foco em acesso
rápido, baixa carga cognitiva, acessibilidade e navegação simples em
dispositivos móveis.

## Principais funcionalidades

-   🚨 Acesso rápido a Polícia, SAMU e Bombeiros.
-   ⭐ Serviços salvos/favoritos com ação direta.
-   🔥 Seção de serviços mais usados.
-   🔎 Busca de serviços.
-   🕘 Atendimentos recentes com interação por gesto.
-   🌓 Tema claro e escuro.
-   🎨 Identidade visual com roxo e amarelo, concentrada principalmente
    no cabeçalho.
-   📳 Microinterações e transições com Framer Motion.

## Serviços cadastrados

-   Polícia Militar --- 190
-   Bombeiros --- 193
-   SAMU --- 192
-   Conselho Tutelar --- 100
-   Defesa Civil --- 199
-   Guarda Municipal --- 153
-   Polícia Rodoviária Federal --- 191
-   Central de Atendimento à Mulher --- 180
-   Polícia Civil --- 197
-   Procon --- 151
-   Anatel --- 1331
-   Disque Denúncia --- 181
-   CVV --- 188
-   Detran --- 154
-   INSS --- 135
-   Vigilância Sanitária --- 150
-   Ministério Público --- 127
-   Defensoria Pública --- 129
-   Disque Idoso --- 100
-   Central de Libras --- número variável conforme a cidade

> **Importante:** os contatos devem ser validados com fontes oficiais
> antes de uma publicação em produção.

## Tecnologias

-   React
-   Vite
-   JavaScript / TypeScript
-   Framer Motion
-   Lucide React
-   Capacitor
-   Android / Gradle
-   CSS

## Android

O projeto utiliza **Capacitor** para empacotar a aplicação web como
aplicativo Android.

``` text
React + Vite
      ↓
   Capacitor
      ↓
   Android
      ↓
     APK
```

A plataforma Android fica na pasta:

``` text
android/
```

## Instalação

### Pré-requisitos

-   Node.js LTS
-   Android Studio para gerar o aplicativo Android
-   Android SDK instalado pelo Android Studio

### Instalar dependências

Na pasta que contém `package.json`:

``` bash
npm install
```

No Windows PowerShell, caso o `npm.ps1` esteja bloqueado:

``` powershell
npm.cmd install
```

### Gerar a versão web

``` bash
npm run build
```

No Windows:

``` powershell
npm.cmd run build
```

## Gerar o Android

Se a plataforma ainda não existir:

``` bash
npx cap add android
```

No Windows:

``` powershell
npx.cmd cap add android
```

Depois:

``` bash
npx cap sync android
```

No Windows:

``` powershell
npx.cmd cap sync android
```

Para abrir no Android Studio:

``` bash
npx cap open android
```

No Windows:

``` powershell
npx.cmd cap open android
```

## Gerar o APK

No Android Studio:

**Build → Generate App Bundles or APKs → Generate APKs**

Em algumas versões:

**Build → Build APK(s)**

O APK de debug fica em:

``` text
android/app/build/outputs/apk/debug/app-debug.apk
```

Esse APK é destinado a testes e instalação manual no aparelho.

## Testes recomendados

-   Abertura e navegação.
-   Pesquisa.
-   Favoritos.
-   Serviços recentes.
-   Tema claro/escuro.
-   Botões de ligação.
-   Diferentes tamanhos de tela.
-   Acessibilidade.
-   Comportamento em diferentes condições de conectividade.

> Números de emergência não devem ser acionados apenas para testes.

## Próximas evoluções

Possíveis próximas versões:

-   📍 Compartilhamento de localização.
-   🆘 Modo SOS.
-   👨‍👩‍👧 Contatos de emergência.
-   🧭 Orientações por tipo de ocorrência.
-   🗺️ Serviços públicos próximos.
-   ♿ Mais recursos de acessibilidade.
-   📶 Melhor suporte offline.
-   ⚠️ Alertas da Defesa Civil.
-   🔐 Controles de privacidade para localização e compartilhamento.

Esses itens são propostas de evolução e não significam que já estejam
implementados.

## Contexto acadêmico / protótipo

O projeto foi estruturado para demonstrar princípios de interface
mobile:

### Zona do polegar

-   Navegação principal fixa na parte inferior.
-   Botões com área de toque confortável.
-   Ações principais em regiões acessíveis.

### Skeleton Screen

-   Tela de carregamento.
-   Antecipação visual do conteúdo.

### Confirmação por gestos

-   Arraste de itens recentes.
-   Remoção por gesto.
-   Indicação visual da área de exclusão.

### Microinterações

-   Entrada da interface.
-   Feedback de toque.
-   Abertura e fechamento de modal.
-   Toasts.
-   Gestos de arrastar.
-   Transições entre páginas.

## Status

**Protótipo funcional / aplicativo Android para testes.**

O projeto pode ser compilado para gerar um APK de debug.

Antes de uma publicação em produção, é necessário validar os contatos
oficiais, permissões do Android, acessibilidade, privacidade e
comportamento em diferentes dispositivos.

------------------------------------------------------------------------

## CHAMOU, FALOU

**Encontrou. Acionou.**


## Acessibilidade e inclusão

A versão atual inclui um modo de acessibilidade com narração de telas, comandos de voz, alvos de toque ampliados, foco visual reforçado e integração com recursos de voz do Android.

## Recursos de assistência e emergência

- Modo SOS com acesso rápido a Polícia, SAMU e Bombeiros.
- Compartilhamento da localização atual.
- Rede pessoal de contatos de emergência, salva localmente no aparelho.
- Orientações por situação, como problema de saúde, crime, incêndio, alagamento e acidente de trânsito.
- Serviços próximos com atalhos para pesquisa no mapa.
- Aviso de funcionamento offline para manter os contatos essenciais acessíveis.
- Assistente de voz com comandos para navegar, procurar serviços, ler a tela, abrir o SOS e compartilhar localização.

## Geração rápida do APK no Windows

Depois de instalar as dependências e ter a plataforma Android criada:

```powershell
npm.cmd run android:build
```

O APK de debug será gerado em:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## Versão 1.1.0

Esta versão consolida as melhorias de acessibilidade e uso em smartphone:

- Navegação por gesto entre as telas, incluindo a tela de serviços salvos.
- Gesto da borda esquerda para abrir o menu lateral.
- Gesto para a esquerda dentro do menu para fechá-lo.
- Modo de acessibilidade com narração, comandos de voz e alvos de toque ampliados.
- Assistente de voz com comandos para navegação, SOS, serviços e leitura da tela.
- SOS com compartilhamento de localização e rede de contatos de emergência.
- Orientação por situação e acesso rápido ao serviço indicado.
- Serviços próximos e compartilhamento de localização.
- Suporte visual para estado offline.
- Respeito à área segura do Android (`safe-area-inset-top` e `safe-area-inset-bottom`).
- Ligação real pelo discador do Android após confirmação (`tel:`).

> Para gerar um novo APK após atualizar o projeto, execute `npm.cmd install`, `npm.cmd run build`, `npx.cmd cap sync android` e depois gere o APK no Android Studio.
