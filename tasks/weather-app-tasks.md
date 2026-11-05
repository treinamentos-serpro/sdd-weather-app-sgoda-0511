# Backlog de Tarefas — Weather App

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md). A sequência segue decisões e contratos → tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dependências listadas são pré-requisitos obrigatórios; tarefas no mesmo estágio podem ser paralelizadas quando não houver dependência direta.

## Rastreabilidade dos requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de teste/verificação | Cobertura |
|---|---|---|---|
| FR-01 — Buscar e selecionar cidade | T-07, T-08, T-10, T-11, T-15 | T-18, T-19, T-21, T-22, T-25, T-26 | Coberto |
| FR-02 — Consultar clima atual | T-07, T-09, T-10, T-12, T-15 | T-18, T-20, T-21, T-23, T-25, T-26 | Coberto |
| FR-03 — Consultar previsão de cinco dias | T-06, T-07, T-09, T-10, T-12, T-15 | T-17, T-18, T-20, T-21, T-23, T-26 | Coberto |
| FR-04 — Alternar unidade de temperatura | T-06, T-10, T-13, T-15 | T-16, T-21, T-24, T-25, T-26 | Coberto |
| FR-05 — Comunicar estados da consulta | T-07, T-08, T-09, T-10, T-11, T-15 | T-18, T-19, T-20, T-21, T-22, T-25, T-26 | Coberto |

Não há requisito funcional sem tarefa correspondente. A implementação dos campos meteorológicos e das datas permanece condicionada às decisões OQ-02 e OQ-03, tratadas em T-01.

## Prioridade e tamanho

Prioridade: **P0** bloqueia a primeira fatia funcional; **P1** é necessária para confiança/aceite de release; **P2** pode ser concluída depois do primeiro fluxo funcional. Tamanho relativo: **P** é escopo estreito; **M** envolve vários passos ou até dois arquivos; **G** envolve várias decisões, concorrência ou fluxos/ambientes distintos. Prioridade não substitui dependências.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | G |
| T-02 | P0 | M |
| T-03 | P0 | G |
| T-04 | P0 | M |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | G |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | P |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P1 | P |
| T-17 | P2 | P |
| T-18 | P1 | M |
| T-19 | P1 | M |
| T-20 | P1 | M |
| T-21 | P1 | M |
| T-22 | P1 | M |
| T-23 | P1 | M |
| T-24 | P1 | P |
| T-25 | P1 | M |
| T-26 | P1 | G |
| T-27 | P1 | P |
| T-28 | P1 | M |

## Sequência sugerida de entrega

1. **Desbloqueio:** concluir T-01 a T-04 em paralelo quando possível. Resultado: contratos de produto/provedor registrados antes de fixar a integração.
2. **Primeira fatia vertical visível:** executar T-05 a T-15 respeitando dependências. Resultado: busca e seleção de cidade, clima atual, cinco dias, troca de unidade e estados da consulta na tela integrada.
3. **Confiança funcional:** executar T-16 a T-25. Priorize T-19 a T-25 para cobrir serviços, concorrência, estados visíveis e integração; T-17 é cobertura de data adiável, já apoiada pelos testes de previsão/E2E.
4. **Aceite de release:** concluir T-26 a T-28, incluindo o fluxo principal em desktop/mobile, comandos de engenharia e gates externos.

**Ponto de atenção:** T-15 depende de T-13 e T-14, então a tela integrada só aparece depois do seletor de unidade e do layout responsivo. Se o prazo para a primeira demonstração for crítico, divida T-15 em uma integração mínima de busca/clima/previsão (Celsius) após T-12 e uma tarefa posterior para conectar unidade/estilos; mantenha os testes E2E e de release nas etapas seguintes.

## Entrega 1 — Decisões, tipos e funções puras

### T-01 — Definir o contrato de busca e previsão

- **Descrição:** Resolver decisões sobre busca, geolocalização opcional, campos meteorológicos, fuso/datas e atualização dos dados.
- **Critérios de aceite:**
  - OQ-01 a OQ-04 e OQ-10 têm uma decisão aprovada ou um bloqueio explícito registrado na spec.
  - A spec identifica dados de desambiguação, campos de clima atual/diário, regra das cinco datas, frequência e idade máxima aceitável dos dados.
  - A spec confirma se geolocalização permanece fora do escopo ou registra a mudança e seus impactos no plano.
  - Decisões que alterem arquitetura aparecem também no plano, sem contradição entre documentos.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Tipo:** Infra
- **Rastreabilidade:** OQ-01, OQ-02, OQ-03, OQ-04, OQ-10; FR-01, FR-02, FR-03; AC-01.1, AC-03.1

### T-02 — Definir comportamento de unidade e falhas

- **Descrição:** Resolver persistência da unidade e política de retry, cache e dados potencialmente desatualizados.
- **Critérios de aceite:**
  - OQ-05 e OQ-06 têm decisão aprovada ou bloqueio explícito registrado na spec.
  - A spec define duração da preferência, retry automático/manual, uso de cache e apresentação de dados desatualizados.
  - Decisões que alterem fluxo/estado aparecem também no plano, sem contradição com a spec.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Tipo:** Infra
- **Rastreabilidade:** OQ-05, OQ-06; FR-04, FR-05; AC-04.1, AC-04.4, AC-05.3, AC-05.4; NFR-04, NFR-07

### T-03 — Definir metas de produto, compatibilidade e qualidade

- **Descrição:** Definir público/indicadores de sucesso e critérios mensuráveis de dispositivos, acessibilidade, desempenho e disponibilidade.
- **Critérios de aceite:**
  - OQ-07, OQ-09 e OQ-11 têm decisão aprovada ou bloqueio explícito registrado na spec.
  - A spec identifica público prioritário e pelo menos um indicador de sucesso com método de medição definido.
  - A spec lista navegadores/dispositivos/larguras suportados e critérios verificáveis de acessibilidade.
  - Metas de desempenho e disponibilidade incluem valores-alvo e condições de medição.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`
- **Tipo:** Infra
- **Rastreabilidade:** OQ-07, OQ-09, OQ-11; NFR-02, NFR-05, NFR-06

### T-04 — Validar requisitos de uso do Open-Meteo

- **Descrição:** Confirmar as condições de uso e operação do provedor externo para este produto.
- **Critérios de aceite:**
  - OQ-08 registra conclusão ou bloqueio explícito para termos, atribuição, cobertura regional, limites e CORS.
  - Spec e plano registram se chamadas diretas do navegador foram aprovadas ou se a arquitetura precisa ser revista.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`
- **Tipo:** Infra
- **Rastreabilidade:** OQ-08; NFR-03

### T-05 — Definir os tipos internos de clima

- **Descrição:** Criar contratos compartilhados para cidade, clima atual, previsão diária, unidade, estado assíncrono e erros.
- **Critérios de aceite:**
  - `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `AsyncState`, `WeatherError` e `WeatherViewState` são definidos sem tipos do payload Open-Meteo.
  - Campos opcionais aceitam ausência; temperatura atual obrigatória e estados idle/loading/success/empty/error são tipados.
  - O contrato representa cinco datas ordenadas e mantém `Unit` separado das temperaturas em Celsius.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-01 a FR-05; AC-01.2, AC-02.2, AC-03.2, AC-04.4, AC-05.1 a AC-05.4; NFR-04

### T-06 — Implementar conversão de temperatura e formatação de datas

- **Descrição:** Criar funções puras para conversão Celsius/Fahrenheit e formatação de datas civis no fuso aprovado.
- **Critérios de aceite:**
  - `toFahrenheit(0)` retorna `32`, `toFahrenheit(100)` retorna `212`, e a conversão inversa desses resultados retorna `0` e `100`.
  - A formatação retorna a data civil no fuso aprovado para instantes antes e depois da meia-noite local.
  - Funções não importam React, não fazem chamadas de rede e não modificam seus argumentos.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/date.ts`
- **Tipo:** Data
- **Rastreabilidade:** AC-03.1; AC-04.2, AC-04.3; OQ-03

## Entrega 2 — Services e normalização

### T-07 — Validar e mapear respostas Open-Meteo

- **Descrição:** Validar respostas de geocoding e previsão e mapeá-las para os contratos internos.
- **Critérios de aceite:**
  - Geocoding sem `results` ou com lista vazia resulta em `City[]` vazio; dados válidos mapeiam nome e coordenadas.
  - Campos opcionais ausentes resultam em `undefined`; coordenadas/nome inválidos não geram `City` válido.
  - Forecast sem temperatura atual, com quantidade diferente de cinco datas ou arrays de comprimentos diferentes retorna erro tipado.
  - JSON malformado retorna `invalid-response` com razão `malformed-json`.
- **Dependências:** T-01, T-05, T-06.
- **Arquivos prováveis:** `src/services/openMeteoMapper.ts`
- **Tipo:** Data
- **Rastreabilidade:** AC-01.3; AC-02.1, AC-02.2; AC-03.1, AC-03.2; AC-05.3, AC-05.4; OQ-02, OQ-03

### T-08 — Implementar service de geocoding

- **Descrição:** Encapsular busca de cidades, parâmetros, timeout e normalização de falhas.
- **Critérios de aceite:**
  - Requisição usa `name`, limite aprovado, `language=pt` e `format=json`.
  - Serviço retorna `Promise<City[]>` normalizado; resultado vazio não é erro.
  - Rede, HTTP, timeout e parsing retornam erros tipados; cancelamento não é erro de consulta.
  - Módulo não importa React nem expõe payload externo.
- **Dependências:** T-01, T-02, T-05, T-07.
- **Arquivos prováveis:** `src/services/openMeteoGeocoding.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-01; AC-01.1, AC-01.2, AC-01.3; AC-05.3, AC-05.4; OQ-01, OQ-06; NFR-03

### T-09 — Implementar service de previsão

- **Descrição:** Encapsular consulta de clima atual e cinco dias para as coordenadas selecionadas.
- **Critérios de aceite:**
  - Requisição usa coordenadas, campos, fuso e unidades aprovados e mantém temperaturas em Celsius.
  - Resposta válida produz `WeatherData` associado à cidade solicitada e com cinco datas cronológicas.
  - Rede, HTTP, timeout, parsing e resposta incompleta resultam em erros tipados sem payload bruto exposto à UI.
  - Timeout e cancelamento seguem as políticas aprovadas.
- **Dependências:** T-01, T-02, T-05, T-06, T-07.
- **Arquivos prováveis:** `src/services/openMeteoForecast.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-05.3, AC-05.4; OQ-02, OQ-03, OQ-06; NFR-03

## Entrega 3 — Hook e orquestração

### T-10 — Implementar o hook `useWeather`

- **Descrição:** Orquestrar busca, seleção, previsão, unidade e estados independentes de busca/clima.
- **Critérios de aceite:**
  - Busca e clima percorrem idle/loading/success/empty/error conforme `WeatherViewState`.
  - Busca vazia não invoca forecast; nova seleção limpa o snapshot anterior antes de exibir novos dados.
  - Com duas seleções resolvidas fora de ordem, somente a última atualiza `weather`.
  - Alternar unidade não invoca serviços; retry aparece somente para categorias aprovadas em OQ-06.
- **Dependências:** T-02, T-05, T-06, T-08, T-09.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data
- **Rastreabilidade:** FR-01 a FR-05; AC-01.2, AC-01.3, AC-02.2, AC-03.2, AC-04.4, AC-05.1 a AC-05.4; OQ-05, OQ-06

## Entrega 4 — Componentes e integração

### T-11 — Implementar busca e seleção de cidades

- **Descrição:** Criar campo de busca, resultados selecionáveis e estados da busca.
- **Critérios de aceite:**
  - Campo tem nome acessível; Enter envia busca e cada resultado pode ser selecionado por teclado.
  - É renderizada uma opção por cidade, usando os campos de desambiguação aprovados em T-01.
  - Loading, lista vazia e erro têm mensagem visível em pt-BR; lista vazia não mostra clima de outra busca.
  - Componente recebe dados/callbacks por props e não importa services nem chama `fetch`.
- **Dependências:** T-05, T-10.
- **Arquivos prováveis:** `src/components/WeatherSearch.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-01, FR-05; AC-01.1, AC-01.2, AC-01.3, AC-05.1, AC-05.2; NFR-01, NFR-05

### T-12 — Implementar clima atual e previsão

- **Descrição:** Apresentar condições atuais e cinco itens diários com os campos aprovados.
- **Critérios de aceite:**
  - Fixture com 18 °C é exibida como `18 °C` e identifica a cidade selecionada.
  - Fixture com cinco datas exibe exatamente essas datas em ordem cronológica, associadas à cidade selecionada.
  - Campo opcional ausente não é renderizado como zero; componentes não importam services nem acessam payload Open-Meteo.
- **Dependências:** T-01, T-05, T-06, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-02.2, AC-03.1, AC-03.2; OQ-02, OQ-03; NFR-01, NFR-05

### T-13 — Implementar seletor de unidade

- **Descrição:** Permitir alternar entre Celsius e Fahrenheit para as temperaturas exibidas.
- **Critérios de aceite:**
  - Unidade inicial é Celsius; selecionar Fahrenheit com 0 °C e 100 °C exibe `32 °F` e `212 °F`.
  - Selecionar Celsius restaura valores/rótulos; cidade e cinco datas permanecem iguais.
  - Controle tem nome acessível, opera por teclado e alternar unidade não dispara service de dados.
- **Dependências:** T-06, T-10.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-04; AC-04.1, AC-04.2, AC-04.3, AC-04.4; NFR-04, NFR-05

### T-14 — Aplicar layout responsivo e estilos globais

- **Descrição:** Ajustar estilos globais e layout dos componentes às metas aprovadas para mobile e acessibilidade.
- **Critérios de aceite:**
  - Em cada viewport definido em T-03, busca, cidade, temperatura, previsão e unidade permanecem visíveis e operáveis sem sobreposição/corte.
  - Verificação automatizada de acessibilidade não encontra violações dos critérios adotados em T-03 nos fluxos principais.
  - `pnpm lint` termina com código zero após a alteração.
- **Dependências:** T-03, T-11, T-12, T-13.
- **Arquivos prováveis:** `src/styles/index.css`
- **Tipo:** UI
- **Rastreabilidade:** FR-01 a FR-05; NFR-02, NFR-05; OQ-07

### T-15 — Compor a tela da aplicação

- **Descrição:** Conectar componentes e hook na tela raiz, incluindo estados da consulta e retry.
- **Critérios de aceite:**
  - Busca, clima atual, cinco dias e unidade são conectados por `useWeather`; a tela não acessa services diretamente.
  - Ao selecionar cidade B após cidade A, dados de A não permanecem visíveis enquanto B carrega nem após B retornar.
  - Loading tem indicador; vazio, erro e retry têm mensagem/ação em pt-BR conforme AC-05 e OQ-06.
- **Dependências:** T-10, T-11, T-12, T-13, T-14.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** FR-01 a FR-05; AC-01.1 a AC-01.3, AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-04.1 a AC-04.4, AC-05.1 a AC-05.4; NFR-01

## Entrega 5 — Testes

### T-16 — Testes unitários da conversão de unidade

- **Descrição:** Testar isoladamente as conversões Celsius/Fahrenheit com testes unitários determinísticos.
- **Critérios de aceite:**
-  - Asserções cobrem `0 °C → 32 °F`, `100 °C → 212 °F`, e as conversões inversas `32 °F → 0 °C`, `212 °F → 100 °C`.
-  - Alternar a conversão não modifica os valores de entrada.
-  - `pnpm test -- temperature` termina com código zero e sem rede.
- **Dependências:** T-06, T-15.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-04; AC-04.1, AC-04.2, AC-04.3

### T-17 — Testar formatação de datas

- **Descrição:** Cobrir formatação de datas civis e timezone com testes unitários determinísticos.
- **Critérios de aceite:**
  - Testes fixam relógio/fuso e verificam a data antes e depois da meia-noite local.
  - `pnpm test -- date` termina com código zero, sem rede e independentemente do timezone padrão da máquina.
- **Dependências:** T-06, T-15.
- **Arquivos prováveis:** `tests/unit/date.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-03; AC-03.1; OQ-03

### T-18 — Testar mapeadores Open-Meteo

- **Descrição:** Verificar validação e normalização dos formatos externos para modelos internos.
- **Critérios de aceite:**
  - Asserções cobrem geocoding vazio, mapeamento de nome/coordenadas, dados opcionais ausentes e cidade inválida.
  - Asserções cobrem temperatura atual ausente, zero/quatro/seis datas, arrays divergentes e JSON malformado, verificando o erro esperado.
  - `pnpm test -- openMeteoMapper` termina com código zero e sem rede real.
- **Dependências:** T-07, T-15.
- **Arquivos prováveis:** `tests/unit/openMeteoMapper.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** AC-01.3; AC-02.1, AC-02.2; AC-03.1, AC-03.2; AC-05.3, AC-05.4; OQ-02, OQ-03

### T-19 — Testar service de geocoding com fetch mockado

- **Descrição:** Testar requisição e tratamento de falhas do geocoding com `fetch` mockado.
- **Critérios de aceite:**
  - Asserções verificam `name`, `count`, idioma/formato, mapeamento de cidade e resposta sem resultados.
  - Asserções verificam HTTP, rede, timeout, JSON inválido e abort; cada caso termina no estado/erro esperado.
  - `pnpm test -- openMeteoGeocoding` termina com código zero, `fetch` mockado e zero chamadas externas.
- **Dependências:** T-08, T-15.
- **Arquivos prováveis:** `tests/unit/openMeteoGeocoding.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-01; AC-01.1, AC-01.2, AC-01.3; AC-05.3, AC-05.4; OQ-01, OQ-06; NFR-03

### T-20 — Testar service de previsão com fetch mockado

- **Descrição:** Testar parâmetros e falhas do forecast com `fetch` mockado.
- **Critérios de aceite:**
  - Asserções verificam coordenadas, campos aprovados, cinco dias, fuso e unidades configuradas.
  - Asserções verificam resposta válida, rede, HTTP/retry, timeout, parsing e snapshot incompleto com o resultado tipado esperado.
  - `pnpm test -- openMeteoForecast` termina com código zero, `fetch` mockado e zero chamadas externas.
- **Dependências:** T-09, T-15.
- **Arquivos prováveis:** `tests/unit/openMeteoForecast.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-05.3, AC-05.4; OQ-02, OQ-03, OQ-06; NFR-03

### T-21 — Testar transições e concorrência do hook

- **Descrição:** Verificar o fluxo geocoding → seleção → forecast e as transições assíncronas.
- **Critérios de aceite:**
  - Testes assertam estados de busca/clima, seleção e busca vazia sem chamada de forecast.
  - Com duas respostas resolvidas em ordem inversa, cidade e clima da última seleção permanecem ativos; abort não produz estado error.
  - Alternar unidade preserva cidade/cinco datas e não aumenta chamadas de serviço.
- **Dependências:** T-10, T-15.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-01 a FR-05; AC-01.2, AC-01.3, AC-02.2, AC-03.2, AC-04.4, AC-05.1 a AC-05.4; OQ-06

### T-22 — Testar estados loading/erro/vazio da busca

- **Descrição:** Cobrir o componente de busca com Testing Library.
- **Critérios de aceite:**
  - Testes assertam envio da consulta, uma opção por resultado, seleção do escolhido e ausência de opções para resultado vazio.
  - Em cenários independentes, o componente renderiza loading, erro e vazio com mensagem em pt-BR e sem opções/dados indevidos.
  - Testes verificam o indicador de loading, mensagem de erro e mensagem de nenhum resultado por role/texto acessível.
  - Teste de teclado envia busca com Enter e seleciona uma opção sem mouse.
- **Dependências:** T-11, T-15.
- **Arquivos prováveis:** `tests/unit/WeatherSearch.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** FR-01, FR-05; AC-01.1, AC-01.2, AC-01.3, AC-05.1, AC-05.2; NFR-01, NFR-05

### T-23 — Testar apresentação do clima e previsão

- **Descrição:** Cobrir componentes de clima atual e previsão de cinco dias.
- **Critérios de aceite:**
  - Fixture de 18 °C resulta no texto `18 °C` e na cidade esperada.
  - Fixture de cinco dias resulta nos mesmos cinco rótulos, na mesma ordem; campos ausentes não resultam em zero renderizado.
  - Testes usam relógio/fuso fixos e valores determinísticos.
- **Dependências:** T-12, T-15.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastList.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** FR-02, FR-03; AC-02.1, AC-02.2, AC-03.1, AC-03.2; NFR-01

### T-24 — Testar seletor de unidade

- **Descrição:** Cobrir acessibilidade e alternância de unidade no controle.
- **Critérios de aceite:**
  - Testes verificam unidade inicial Celsius, seleção Celsius/Fahrenheit e nome acessível do controle.
  - Com valores de 0 °C e 100 °C, Fahrenheit exibe 32 °F e 212 °F; retornar a Celsius restaura os valores originais.
  - Alternância não aumenta chamadas de serviço nem altera o objeto de dados de entrada.
- **Dependências:** T-13, T-15.
- **Arquivos prováveis:** `tests/unit/TemperatureUnitToggle.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** FR-04; AC-04.1, AC-04.2, AC-04.3, AC-04.4; NFR-05

### T-25 — Testar composição da aplicação

- **Descrição:** Verificar integração entre tela raiz, hook e estados de previsão.
- **Critérios de aceite:**
  - Testes verificam busca, seleção, cidade ativa, temperatura, cinco datas, loading, vazio e erro.
  - Na troca de cidade, dados anteriores não permanecem; retry chama novamente apenas o service correspondente.
  - Todos os services são mockados e `fetch` real não é chamado.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** FR-01 a FR-05; AC-01.1 a AC-01.3, AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-04.1 a AC-04.4, AC-05.1 a AC-05.4

### T-26 — Testar fluxo principal E2E em desktop e mobile

- **Descrição:** Validar fluxos principais com Playwright e fixtures Open-Meteo determinísticas.
- **Critérios de aceite:**
  - O fluxo principal completo busca uma cidade, seleciona um resultado, mostra a cidade ativa, `18 °C` e exatamente cinco datas, e permite alternar para Fahrenheit.
  - O fluxo principal completo passa em um viewport desktop e em um viewport móvel da matriz definida em T-03.
  - Cenários separados verificam busca vazia, erro HTTP e timeout; todas as rotas Open-Meteo são interceptadas e o relógio é fixado.
- **Dependências:** T-15, T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-24, T-25.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** FR-01 a FR-05; AC-01.1 a AC-01.3, AC-02.1, AC-02.2, AC-03.1, AC-03.2, AC-04.1 a AC-04.4, AC-05.1 a AC-05.4; NFR-02, NFR-03, NFR-05, NFR-07

## Entrega 6 — Hardening e aceite

### T-27 — Executar verificações de engenharia

- **Descrição:** Rodar os comandos de lint, build e testes unitários/E2E exigidos pelo projeto.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com código de saída zero.
  - Testes unitários e E2E interceptam chamadas Open-Meteo; nenhuma chamada de rede externa ocorre durante os comandos.
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-24, T-25, T-26.
- **Arquivos prováveis:** Nenhum; validação por comandos.
- **Tipo:** Test
- **Rastreabilidade:** FR-01 a FR-05; AC-01.1 a AC-05.4; NFR-03, NFR-07

### T-28 — Aprovar gates externos de lançamento

- **Descrição:** Registrar o aceite de privacidade/provedor e confirmar que metas de qualidade não aprovadas impedem o lançamento.
- **Critérios de aceite:**
  - Spec/README registram evidência e status aprovado/bloqueado para termos, CORS, limites, atribuição e divulgação do envio da busca ao provedor.
  - Há resultado registrado para cada navegador/largura, critério de acessibilidade e meta de desempenho/disponibilidade de T-03.
  - Qualquer item não aprovado deixa o status explicitamente “bloqueado para lançamento”.
  - Busca não exige autenticação e não há persistência em servidor; exceções exigem decisão arquitetural documentada.
- **Dependências:** T-03, T-04, T-27.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `README.md`
- **Tipo:** Infra
- **Rastreabilidade:** NFR-02, NFR-03, NFR-04, NFR-05, NFR-06; OQ-07, OQ-08, OQ-09
