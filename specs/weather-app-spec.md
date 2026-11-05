# Weather App — Especificação de Produto

**Status:** Rascunho para validação. Requisitos funcionais e decisões confirmadas estão registrados; perguntas em aberto devem ser resolvidas antes de aprovar a especificação para implementação.

## Overview

### Visão do produto

Uma aplicação web de previsão do tempo que permite pesquisar uma cidade, consultar suas condições meteorológicas atuais e ver a previsão de hoje mais os quatro dias seguintes. O usuário pode alternar a temperatura entre Celsius e Fahrenheit.

### Objetivos

- Permitir que o usuário encontre a cidade desejada e consulte informações meteorológicas correspondentes a esse local.
- Apresentar clima atual e previsão para cinco datas consecutivas.
- Permitir a leitura das temperaturas em Celsius ou Fahrenheit, com Celsius como padrão.
- Disponibilizar a experiência em português do Brasil e utilizável em dispositivos móveis.

### Decisões confirmadas

- Fonte de dados meteorológicos: Open-Meteo, sem API key.
- Período da previsão: hoje mais os quatro dias seguintes.
- Unidade inicial: Celsius.
- Idioma da interface: português do Brasil (pt-BR).
- Sem autenticação e sem persistência de dados no servidor.

## Functional Requirements

- **FR-01 — Buscar e selecionar cidade:** o usuário deve poder informar o nome de uma cidade e selecionar um resultado para consultar suas informações meteorológicas. A busca não exige autenticação.
- **FR-02 — Consultar clima atual:** para a cidade selecionada, a aplicação deve apresentar a temperatura atual e as informações meteorológicas atuais definidas para o produto.
- **FR-03 — Consultar previsão de cinco dias:** para a cidade selecionada, a aplicação deve apresentar a previsão de hoje e dos quatro dias seguintes.
- **FR-04 — Alternar unidade de temperatura:** o usuário deve poder alternar entre Celsius e Fahrenheit. A unidade inicial deve ser Celsius.
- **FR-05 — Comunicar estados da consulta:** a aplicação deve comunicar quando a consulta está em andamento, não retorna resultados ou falha, em vez de deixar a área de resultados sem explicação.

## User Stories

- **US-01 (FR-01):** Como Marina, usuária no dia a dia, quero pesquisar e selecionar minha cidade para consultar informações do local correto.
- **US-02 (FR-02):** Como Marina, usuária no dia a dia, quero ver o clima atual da cidade selecionada para decidir como me preparar para o dia.
- **US-03 (FR-03):** Como Rafael, planejador de viagem, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar os dias da viagem.
- **US-04 (FR-04):** Como Alex, usuário com preferência de unidade, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-05):** Como Rafael, planejador de viagem, quero saber se a consulta está carregando, não encontrou dados ou falhou para não confundir uma falha com uma previsão válida.

## Traceability Matrix

| User Story | Requisito funcional | Acceptance Criteria | Requisitos não funcionais relevantes |
|---|---|---|---|
| US-01 — Buscar e selecionar cidade | FR-01 | AC-01.1, AC-01.2, AC-01.3 | NFR-01 (pt-BR), NFR-02 (mobile), NFR-03 (serviço externo), NFR-05 (acessibilidade), NFR-06 (desempenho/disponibilidade), NFR-07 (rede) |
| US-02 — Consultar clima atual | FR-02 | AC-02.1, AC-02.2 | NFR-01 (pt-BR), NFR-02 (mobile), NFR-03 (Open-Meteo), NFR-05 (acessibilidade), NFR-06 (desempenho/disponibilidade), NFR-07 (rede) |
| US-03 — Consultar previsão de cinco dias | FR-03 | AC-03.1, AC-03.2 | NFR-01 (pt-BR), NFR-02 (mobile), NFR-03 (Open-Meteo), NFR-05 (acessibilidade), NFR-06 (desempenho/disponibilidade), NFR-07 (rede) |
| US-04 — Alternar unidade de temperatura | FR-04 | AC-04.1, AC-04.2, AC-04.3, AC-04.4 | NFR-01 (pt-BR), NFR-02 (mobile), NFR-04 (sem persistência no servidor), NFR-05 (acessibilidade) |
| US-05 — Comunicar estados da consulta | FR-05 | AC-05.1, AC-05.2, AC-05.3, AC-05.4 | NFR-01 (pt-BR), NFR-02 (mobile), NFR-03 (serviço externo), NFR-05 (acessibilidade), NFR-06 (desempenho/disponibilidade), NFR-07 (rede) |

## Acceptance Criteria

Os cenários usam respostas controladas do provedor e um relógio fixo nos testes de datas. Campos meteorológicos adicionais, fuso horário, timeout, persistência da preferência e metas de qualidade continuam sujeitos às perguntas abertas desta especificação.

### FR-01 — Buscar e selecionar cidade

- **AC-01.1:** **Given** o serviço de busca retorna uma ou mais cidades para o termo informado, **When** o usuário envia a busca, **Then** a aplicação apresenta cada resultado como uma opção selecionável.
- **AC-01.2:** **Given** a aplicação apresenta pelo menos dois resultados distintos, **When** o usuário seleciona um deles, **Then** esse resultado passa a ser a cidade ativa para as consultas de clima atual e previsão.
- **AC-01.3:** **Given** o serviço de busca retorna uma lista vazia, **When** a busca termina, **Then** a aplicação apresenta o estado de nenhum resultado e não mostra dados meteorológicos como se pertencessem a essa busca.

### FR-02 — Consultar clima atual

- **AC-02.1:** **Given** uma cidade selecionada e uma resposta controlada com temperatura atual de 18 °C, **When** a consulta termina sem preferência de unidade, **Then** a interface exibe `18 °C` para essa cidade.
- **AC-02.2:** **Given** uma cidade selecionada e uma resposta válida de clima atual, **When** os dados são exibidos, **Then** a interface identifica a mesma cidade selecionada.

### FR-03 — Consultar previsão de cinco dias

- **AC-03.1:** **Given** um relógio de teste fixado em uma data e uma resposta de previsão contendo essa data e as quatro datas seguintes, **When** a previsão é carregada, **Then** a interface apresenta exatamente essas cinco datas em ordem cronológica.
- **AC-03.2:** **Given** uma cidade selecionada e uma resposta de previsão identificada para essa cidade, **When** os dados são exibidos, **Then** a interface associa a previsão à cidade selecionada.

### FR-04 — Alternar unidade de temperatura

- **AC-04.1:** **Given** não existe preferência de unidade definida e a resposta contém temperatura de 18 °C, **When** os dados são exibidos inicialmente, **Then** a interface mostra `18 °C`.
- **AC-04.2:** **Given** a interface apresenta temperaturas de 0 °C e 100 °C, **When** o usuário seleciona Fahrenheit, **Then** os valores correspondentes são exibidos como `32 °F` e `212 °F`.
- **AC-04.3:** **Given** temperaturas estão sendo exibidas em Fahrenheit, **When** o usuário seleciona Celsius, **Then** os valores e rótulos retornam aos valores e rótulos em Celsius.
- **AC-04.4:** **Given** uma cidade e sua previsão já estão carregadas, **When** o usuário alterna a unidade, **Then** a cidade selecionada e as cinco datas da previsão permanecem inalteradas.

### FR-05 — Comunicar estados da consulta

- **AC-05.1:** **Given** uma consulta foi enviada e a resposta ainda não chegou, **When** a interface aguarda a resposta, **Then** ela apresenta um indicador de carregamento.
- **AC-05.2:** **Given** o serviço de busca retorna uma lista vazia, **When** a consulta termina, **Then** a interface apresenta o estado de nenhum resultado descrito em AC-01.3.
- **AC-05.3:** **Given** o provedor retorna uma falha para uma consulta de clima atual ou previsão, **When** a aplicação processa a resposta, **Then** a interface apresenta um estado de erro e não apresenta essa falha como dado meteorológico válido.
- **AC-05.4:** **Given** a consulta de clima atual ou previsão não recebe resposta dentro do limite de timeout configurado no teste, **When** esse limite é atingido, **Then** a interface apresenta um estado de erro em vez de permanecer indefinidamente no estado de carregamento.

## Non-Functional Requirements

- **NFR-01 — Idioma:** a interface do usuário deve estar em português do Brasil (pt-BR).
- **NFR-02 — Dispositivos móveis:** as principais funcionalidades devem ser utilizáveis em dispositivos móveis. A matriz de navegadores, dispositivos e larguras de tela ainda precisa ser definida em OQ-07.
- **NFR-03 — Fonte de dados:** os dados meteorológicos devem vir do Open-Meteo, sem exigir API key para a integração definida para o produto. Termos de uso, atribuição, cobertura e limites devem ser confirmados em OQ-08.
- **NFR-04 — Contas e persistência no servidor:** o produto não deve exigir autenticação nem persistir dados de usuário em servidor.
- **NFR-05 — Acessibilidade:** o nível de conformidade e os critérios verificáveis ainda não foram acordados; devem ser definidos em OQ-07 antes da aprovação final.
- **NFR-06 — Desempenho e disponibilidade:** metas quantitativas ainda não foram acordadas. Limites de resposta e disponibilidade devem ser definidos em OQ-09.
- **NFR-07 — Dependência de rede:** a consulta de dados depende de conexão à internet e da disponibilidade do provedor. O comportamento detalhado em falhas segue FR-05 e OQ-06.

## Edge Cases

- Consulta vazia, composta apenas por espaços ou sem correspondência de cidade.
- Mais de uma cidade com o mesmo nome ou nomes de cidade com grafias alternativas.
- Resultado de busca sem região ou país suficientes para distingui-lo de outro resultado.
- Cidade selecionada sem dados atuais ou sem previsão disponível.
- Timeout, indisponibilidade, limite de requisições ou resposta inválida do provedor.
- Resposta do provedor com campos ausentes, nulos ou unidades diferentes das esperadas.
- Mudança de data local da cidade durante a consulta, especialmente perto da meia-noite.
- Temperaturas negativas, valores extremos, arredondamento e conversão entre unidades.
- Alternância de unidade enquanto os dados estão carregando ou após erro de consulta.
- Tela móvel estreita, conteúdo longo ou aumento de texto que possa ocultar controles ou dados.
- Preferência local de unidade ausente, inválida ou indisponível em outro navegador/dispositivo.

## Assumptions

- O usuário informa uma cidade; a consulta não depende de permissão de geolocalização.
- Clima atual e previsão referem-se à mesma cidade selecionada.
- A aplicação necessita de conexão com a internet para obter dados meteorológicos.
- A previsão contém cinco datas consecutivas: hoje e os quatro dias seguintes.
- Celsius é a unidade padrão; Fahrenheit é uma unidade alternativa de exibição.
- A interface inicial será oferecida em pt-BR.
- Não haverá conta de usuário nem armazenamento de dados em servidor.
- A persistência local da unidade não está decidida e não deve ser presumida.

## Risks

| Risco | Impacto | Mitigação |
|---|---|---|
| Indisponibilidade, lentidão, limites ou mudança no serviço Open-Meteo | Consultas podem falhar ou ficar incompletas | Confirmar termos e limites; validar respostas; tratar timeout, erro e dados ausentes conforme FR-05. |
| Seleção de cidade homônima ou incorreta | O usuário pode receber dados de outro local | Definir os dados de desambiguação e validar o fluxo de seleção em OQ-01. |
| Fuso horário não definido | As datas da previsão podem começar ou terminar no dia errado | Resolver OQ-03 e testar limites de data no fuso da cidade. |
| Campos e atualização da previsão indefinidos | UI e integração podem exigir retrabalho quando o contrato for fechado | Aprovar os campos e a frequência de atualização em OQ-02 e OQ-04 antes do plano técnico. |
| Conversão ou rótulo incorreto de unidade | Temperaturas podem ser interpretadas incorretamente | Manter critérios com valores de referência em AC-04.2 e cobrir valores extremos nos testes. |
| Suporte móvel e acessibilidade sem alvo mensurável | A experiência pode variar ou excluir usuários | Acordar matriz de dispositivos e critérios de acessibilidade em OQ-07. |
| Dependência de conexão sem política de cache definida | O usuário pode ficar sem dados durante falhas de rede | Definir retry, cache e apresentação de dados antigos em OQ-06. |

## Out of Scope

- Autenticação, contas de usuário e dados persistidos em servidor.
- Interface em idiomas diferentes de pt-BR nesta versão.
- Alertas, notificações push, radar, mapas meteorológicos ou previsão para além dos cinco dias definidos.
- Geolocalização automática como requisito do fluxo; eventual opção de localização do dispositivo depende de OQ-10.
- Persistência local de preferências até que OQ-05 seja respondida.

## Open Questions

- **OQ-01 — Busca:** haverá sugestões/autocomplete? Quais informações (por exemplo, região e país) serão apresentadas para distinguir cidades homônimas?
- **OQ-02 — Campos:** quais campos devem aparecer no clima atual e em cada dia da previsão, além da temperatura atual?
- **OQ-03 — Fuso e datas:** qual fuso horário define “hoje” e os limites das cinco datas para cada cidade?
- **OQ-04 — Atualização:** qual frequência de atualização é esperada e qual idade máxima dos dados é aceitável?
- **OQ-05 — Preferência de unidade:** a escolha de Celsius/Fahrenheit dura apenas durante a sessão ou deve ser salva localmente no navegador?
- **OQ-06 — Falhas:** em timeout ou indisponibilidade, deve haver nova tentativa automática/manual ou exibição de dados em cache? Como sinalizar dados possivelmente desatualizados?
- **OQ-07 — Compatibilidade e acessibilidade:** quais navegadores, dispositivos e larguras mínimas são suportados? Qual nível ou padrão de acessibilidade deve ser atendido?
- **OQ-08 — Open-Meteo:** quais termos de uso, atribuição, cobertura regional e limites de requisições se aplicam ao contexto de uso do produto?
- **OQ-09 — Metas de qualidade:** quais metas de desempenho e disponibilidade devem ser atendidas e em quais condições de rede/operação?
- **OQ-10 — Geolocalização:** a localização do dispositivo deve ser oferecida como atalho opcional ou a busca será exclusivamente por nome de cidade?
- **OQ-11 — Público e sucesso:** qual público é prioritário e quais indicadores demonstrarão que o app atende à necessidade?