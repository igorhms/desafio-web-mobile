# Desafio Técnico — Dashboard Web + Mobile

Implementação completa do desafio com uma experiência unificada entre Web (Angular 16+) e Mobile (Ionic + Angular) consumindo APIs públicas e mantendo cache offline.

## Visão geral

- **Web** (`/src`): dashboard moderno com filtros por intervalo de datas, dark/light mode, loaders, mensagens de erro, layout responsivo e 2 gráficos com ECharts.
- **Mobile** (`/mobile-dashboard`): mesma tela com componentes Ionic, suporte a pull-to-refresh e cache local via Capacitor Preferences para uso offline.
- **Domínio compartilhado** (`/libs/domain`): tipos, utilitários de análise (KPIs, agregações) e catálogo de fontes de dados reutilizados pelos dois apps.

### Fonte de dados

A aplicação consome dados da API **Open-Meteo** (https://archive-api.open-meteo.com) para obter séries horárias de temperatura em São Paulo.

Os dados são normalizados para gerar:
- 4 KPIs (média, máximo, mínimo, variação %)
- Gráfico de linha/área (série temporal)
- Gráfico de barras (média diária)

## Como executar

### 1. Pré-requisitos

- Node 20+
- npm 10+
- Ionic CLI opcionalmente (`npm install -g @ionic/cli`) para rodar em dispositivos/emuladores

### 2. Aplicação Web (Angular)

```bash
cd desafio-tecnico
npm install
npm start           # abre em http://localhost:4200
npm run build       # build de produção
npm test            # testes unitários (Karma + Jasmine)
```

Principais decisões:
- Standalone components + signals para estado local.
- Angular Material para formulários/feedback.
- ngx-echarts para gráficos com builders dedicados.
- ThemeService controla dark/light mode persistido em `localStorage`.

### 3. Aplicação Mobile (Ionic + Angular)

#### 3.1. Executar no navegador (desenvolvimento)

```bash
cd mobile-dashboard
npm install
npm run start       # abre em http://localhost:4200
npm run test        # testes unitários
```

#### 3.2. Build e execução nativa (Android/iOS)

**Pré-requisitos para Android:**
- Android Studio instalado
- Android SDK configurado
- Variável de ambiente `ANDROID_HOME` configurada
- Emulador Android configurado OU dispositivo físico conectado via USB com depuração USB ativada

**Pré-requisitos para iOS (apenas macOS):**
- Xcode instalado
- CocoaPods instalado (`sudo gem install cocoapods`)
- Simulador iOS configurado OU dispositivo físico conectado

**Passo a passo para Android:**

1. **Adicionar plataforma Android (primeira vez):**
   ```bash
   cd mobile-dashboard
   npx cap add android
   ```

2. **Build e sincronizar:**
   ```bash
   npm run build              # build do Angular
   npm run cap:sync           # sincroniza com Capacitor
   ```

3. **Executar no emulador/dispositivo:**
   ```bash
   npm run cap:run:android    # build + sync + run (tudo em um comando)
   # OU
   npm run cap:open:android   # abre no Android Studio para debug
   ```

**Passo a passo para iOS (apenas macOS):**

1. **Adicionar plataforma iOS (primeira vez):**
   ```bash
   cd mobile-dashboard
   npx cap add ios
   ```

2. **Instalar dependências CocoaPods:**
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

3. **Build e sincronizar:**
   ```bash
   npm run build              # build do Angular
   npm run cap:sync           # sincroniza com Capacitor
   ```

4. **Executar no simulador/dispositivo:**
   ```bash
   npm run cap:run:ios        # build + sync + run (tudo em um comando)
   # OU
   npm run cap:open:ios       # abre no Xcode para debug
   ```

**Scripts disponíveis:**
- `npm run build` - Build do Angular
- `npm run build:prod` - Build de produção
- `npm run cap:sync` - Sincroniza código web com plataformas nativas
- `npm run cap:copy` - Copia apenas os arquivos web (mais rápido que sync)
- `npm run cap:open:android` - Abre projeto no Android Studio
- `npm run cap:open:ios` - Abre projeto no Xcode
- `npm run cap:run:android` - Build + sync + executa no Android
- `npm run cap:run:ios` - Build + sync + executa no iOS

**Principais decisões:**
- Mesmo conjunto de filtros/KPIs/gráficos da web.
- `ion-refresher` e loaders nativos para feedback.
- Cache offline com `@capacitor/preferences`: ao perder rede o app exibe a última coleta salva automaticamente.
- Build de debug configurado para desenvolvimento e testes em dispositivos reais/emuladores.

## Estrutura de pastas

```
├── libs/domain             # modelos e utilitários compartilhados
├── src                     # app Angular (web)
│   ├── app/core            # serviços (dados, tema)
│   ├── app/features        # dashboard (component + charts)
│   └── app/shared          # componentes reutilizáveis (KPI, chart-card, toggle)
└── mobile-dashboard        # app Ionic
    ├── src/app/services    # dashboard-data service com cache
    ├── src/app/home        # tela principal
    └── src/app/utils       # opções dos gráficos (ECharts)
```

## Testes

### Testes Unitários

Ambos os projetos possuem testes unitários básicos garantindo a criação do shell principal e integração dos providers críticos (`HttpClient`, ECharts, etc.). Execute `npm test` em cada projeto para validar.

### Teste do Cache Offline (Mobile)

Para testar o cache offline no app mobile:

1. **Primeiro, carregue dados com internet:**
   - Execute o app no dispositivo/emulador
   - Aguarde os dados serem carregados da API
   - Verifique se os KPIs e gráficos aparecem corretamente

2. **Teste o modo offline:**
   - **Android:** Desative o Wi-Fi e dados móveis nas configurações do dispositivo/emulador
   - **iOS:** Ative o Modo Avião nas configurações do dispositivo/simulador
   - **Navegador (Chrome DevTools):** Abra DevTools → Network → Marque "Offline"

3. **Verifique o comportamento:**
   - Faça pull-to-refresh (arraste para baixo) ou clique em "Aplicar filtros"
   - O app deve exibir uma mensagem: "Modo offline: exibindo dados em cache"
   - Os KPIs e gráficos devem continuar visíveis com os últimos dados carregados
   - Se não houver cache, uma mensagem de erro será exibida

4. **Reative a conexão:**
   - Reative a internet
   - Faça pull-to-refresh novamente
   - Os dados devem ser atualizados da API e o cache será atualizado automaticamente