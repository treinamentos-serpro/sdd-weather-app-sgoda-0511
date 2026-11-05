# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa solicitou uma aplicação para consultar informações meteorológicas por cidade. O briefing identifica quatro necessidades centrais: buscar cidades, consultar o clima atual, ver a previsão de cinco dias e alternar a unidade de temperatura entre Celsius e Fahrenheit. A aplicação também deve poder ser usada em dispositivos móveis.

Esta análise organiza o entendimento inicial do problema. As decisões confirmadas estão registradas ao final; detalhes da experiência e critérios de qualidade ainda precisam ser confirmados antes da especificação do produto.

## Personas

Estas proto-personas são hipóteses iniciais derivadas do briefing e devem ser validadas com usuários.

- **Marina — usuária no dia a dia:** quer conferir rapidamente as condições na cidade onde está. Usa principalmente o celular antes de sair; considera sucesso encontrar a cidade e entender o clima atual em menos de 30 segundos.
- **Rafael — planejador de viagem:** quer consultar a previsão de cinco dias para um destino. Usa principalmente desktop antes da viagem e pode consultar no celular durante o trajeto; considera sucesso localizar o destino e consultar as cinco datas sem confundir cidades ou dias.
- **Alex — usuário com preferência de unidade:** quer interpretar temperaturas na unidade que prefere, alternando entre Celsius e Fahrenheit. Usa celular ou desktop; considera sucesso alternar a unidade e compreender os valores exibidos sem confusão.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o local cujas informações meteorológicas deseja consultar.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar a exibição da temperatura entre Celsius e Fahrenheit.

## Requisitos Não-Funcionais

- **RNF-01 — Uso em dispositivos móveis:** a aplicação deve ser utilizável em dispositivos móveis. O briefing não define dispositivos, navegadores ou dimensões mínimas de tela suportados.
- Outros atributos de qualidade, como acessibilidade, desempenho e comportamento com conexão instável, ainda precisam de critérios acordados.

## Riscos

- **Ambiguidade na busca:** nomes de cidades podem se repetir ou ter grafias alternativas, levando à seleção do local incorreto.
- **Dependência de dados externos:** indisponibilidade, lentidão ou dados desatualizados da fonte meteorológica podem impedir ou degradar as consultas.
- **Interpretação da previsão:** “cinco dias” pode significar dias corridos ou períodos de 24 horas; a apresentação pode divergir da expectativa do usuário.
- **Conversão de unidades:** conversão ou rotulagem incorreta pode exibir temperaturas enganosas.
- **Experiência em telas pequenas:** busca e previsões podem ficar difíceis de consultar se a interface não se adaptar bem a dispositivos móveis.

## Perguntas em Aberto

1. A busca deve sugerir cidades enquanto o usuário digita? Como distinguir cidades com o mesmo nome (por exemplo, estado ou país)?
2. Quais informações devem compor o clima atual e cada dia da previsão (temperatura mínima/máxima, precipitação, vento, umidade, descrição ou ícone)?
3. Em qual fuso horário devem ser definidos os limites de cada dia da previsão? Qual nível de detalhe e frequência de atualização são esperados?
4. A unidade escolhida deve permanecer apenas durante a sessão ou ser salva localmente no navegador entre visitas?
5. A busca deve usar localização atual do dispositivo, ou somente uma cidade informada pelo usuário?
6. Quais navegadores e dispositivos precisam ser suportados? Há requisitos de acessibilidade?
7. Como a aplicação deve se comportar quando não houver resultados, a conexão falhar ou os dados não estiverem disponíveis?

## Suposições

- O usuário informa uma cidade para consultar o clima; a busca não depende de permissão de geolocalização do dispositivo.
- Clima atual e previsão referem-se à mesma cidade selecionada.
- A opção entre Celsius e Fahrenheit altera a unidade exibida, sem mudar a cidade consultada.
- A aplicação depende de uma conexão com a internet e de uma fonte externa de dados meteorológicos.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** Justificativa: permite consultar dados meteorológicos sem criar ou distribuir uma chave de API. Resolve a pergunta sobre qual fonte usar e a necessidade de credenciais; cobertura, disponibilidade e limites aplicáveis ainda devem ser considerados no plano técnico.
- **Período da previsão — hoje mais os quatro dias seguintes.** Justificativa: define “cinco dias” como cinco datas consecutivas, em vez de uma janela móvel de 120 horas. Resolve a ambiguidade sobre a extensão do período; o fuso horário que determina a data local continua em aberto.
- **Unidade padrão — Celsius.** Justificativa: estabelece uma apresentação inicial consistente com o idioma da interface. Resolve a escolha da unidade inicial; não define se a preferência do usuário será salva localmente.
- **Autenticação e persistência — sem autenticação e sem persistência de dados no servidor.** Justificativa: mantém o escopo sem contas de usuário nem armazenamento centralizado. Resolve se haverá login e armazenamento no servidor; a persistência local da unidade continua em aberto.
- **Idioma da interface — português do Brasil (pt-BR).** Justificativa: define o idioma inicial da experiência. Resolve a escolha do idioma da UI; suporte a outros idiomas não faz parte da decisão atual.