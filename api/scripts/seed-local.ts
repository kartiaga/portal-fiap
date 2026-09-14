import 'dotenv/config'
import { Pool, type PoolClient } from 'pg'
import { hashPassword } from '../src/lib/password.ts'

const SEED_PASSWORD = '12345678'

type Specialty = 'frontend' | 'backend' | 'cloud' | 'data' | 'career'

interface SeedUser {
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  name: string
}

const KAIQUE: SeedUser = {
  email: 'kaique.luz@fiap.com.br',
  role: 'ADMIN',
  name: 'Kaique Luz',
}

const TEACHERS: (SeedUser & { specialty: Specialty })[] = [
  {
    email: 'ana.ferreira@fiap.com.br',
    role: 'TEACHER',
    name: 'Ana Beatriz Ferreira',
    specialty: 'frontend',
  },
  {
    email: 'carlos.santos@fiap.com.br',
    role: 'TEACHER',
    name: 'Carlos Eduardo Santos',
    specialty: 'backend',
  },
  {
    email: 'marina.oliveira@fiap.com.br',
    role: 'TEACHER',
    name: 'Marina Costa Oliveira',
    specialty: 'cloud',
  },
  {
    email: 'rodrigo.souza@fiap.com.br',
    role: 'TEACHER',
    name: 'Rodrigo Almeida Souza',
    specialty: 'data',
  },
  {
    email: 'beatriz.rocha@fiap.com.br',
    role: 'TEACHER',
    name: 'Beatriz Lima Rocha',
    specialty: 'career',
  },
]

const STUDENTS: SeedUser[] = [
  {
    email: 'joao.silva@fiap.com.br',
    role: 'STUDENT',
    name: 'João Pedro Silva',
  },
  {
    email: 'mariana.pereira@fiap.com.br',
    role: 'STUDENT',
    name: 'Mariana Alves Pereira',
  },
  {
    email: 'lucas.rodrigues@fiap.com.br',
    role: 'STUDENT',
    name: 'Lucas Gabriel Rodrigues',
  },
  {
    email: 'fernanda.martins@fiap.com.br',
    role: 'STUDENT',
    name: 'Fernanda Cristina Martins',
  },
  {
    email: 'gustavo.barbosa@fiap.com.br',
    role: 'STUDENT',
    name: 'Gustavo Henrique Barbosa',
  },
  {
    email: 'juliana.costa@fiap.com.br',
    role: 'STUDENT',
    name: 'Juliana Ribeiro Costa',
  },
  {
    email: 'pedro.nunes@fiap.com.br',
    role: 'STUDENT',
    name: 'Pedro Henrique Nunes',
  },
  {
    email: 'camila.lima@fiap.com.br',
    role: 'STUDENT',
    name: 'Camila Souza Lima',
  },
  {
    email: 'rafael.dias@fiap.com.br',
    role: 'STUDENT',
    name: 'Rafael Augusto Dias',
  },
  {
    email: 'larissa.gomes@fiap.com.br',
    role: 'STUDENT',
    name: 'Larissa Fernandes Gomes',
  },
]

interface PostTopic {
  title: string
  points: string[]
}

const TOPICS: Record<Specialty, PostTopic[]> = {
  frontend: [
    {
      title: 'Componentização em Vue 3: Composition API na prática',
      points: [
        'A lógica é organizada por funcionalidade, não por tipo de opção',
        'Composables reaproveitam estado e comportamento entre componentes',
        'Funções isoladas ficam mais fáceis de testar',
      ],
    },
    {
      title: 'Options API vs Composition API: quando usar cada uma',
      points: [
        'Options API favorece a leitura padronizada em times grandes',
        'Composition API brilha em lógica complexa e compartilhada',
        'A escolha deve seguir a convenção do projeto, não a preferência pessoal',
      ],
    },
    {
      title: 'Gerenciando estado com Pinia',
      points: [
        'Stores centralizam dados que várias telas precisam compartilhar',
        'Getters evitam duplicar lógica de derivação de estado',
        'Actions organizam efeitos colaterais como chamadas de API',
      ],
    },
    {
      title: 'Acessibilidade (a11y) não é opcional',
      points: [
        'Labels e atributos ARIA ajudam leitores de tela a interpretar a interface',
        'Contraste de cor adequado beneficia todos os usuários, não só quem tem baixa visão',
        'Navegação por teclado é um requisito, não um extra',
      ],
    },
    {
      title: 'Design systems e consistência visual com Vuetify',
      points: [
        'Tokens de cor e espaçamento evitam decisões ad-hoc em cada tela',
        'Componentes reutilizáveis aceleram a entrega de novas features',
        'Consistência visual reduz a carga cognitiva do usuário',
      ],
    },
    {
      title: 'Performance no frontend: lazy loading e code splitting',
      points: [
        'Carregar só o necessário reduz o tempo até a tela ficar interativa',
        'Rotas divididas em chunks menores aceleram o carregamento inicial',
        'Imagens otimizadas continuam sendo o maior ganho de performance percebido',
      ],
    },
    {
      title: 'TypeScript no dia a dia do frontend',
      points: [
        'Tipos explícitos pegam erros antes de chegar em produção',
        'Autocomplete melhora a produtividade em componentes grandes',
        'Interfaces bem definidas documentam o contrato entre componentes',
      ],
    },
    {
      title: 'Testes de componentes com Vitest e Vue Test Utils',
      points: [
        'Testar comportamento, não implementação, deixa os testes mais duráveis',
        'Mocks de API isolam o componente do que é externo a ele',
        'Testes de componente pegam regressões antes do teste manual',
      ],
    },
    {
      title: 'Formulários complexos: validação e UX',
      points: [
        'Mensagens de erro claras evitam frustração do usuário',
        'Validação em tempo real precisa equilibrar utilidade e excesso de ruído',
        'Estados de loading e disabled evitam envios duplicados',
      ],
    },
    {
      title: 'Responsividade: mobile first de verdade',
      points: [
        'Projetar para a tela pequena primeiro simplifica as decisões de layout',
        'Breakpoints devem seguir o conteúdo, não dispositivos específicos',
        'Testar em dispositivos reais revela problemas que o emulador não mostra',
      ],
    },
    {
      title: 'Vue Router: navegação e guards de rota',
      points: [
        'Guards de navegação centralizam regras de acesso por rota',
        'Rotas nomeadas evitam links quebrados quando a URL muda',
        'Lazy loading de rotas reduz o bundle inicial da aplicação',
      ],
    },
    {
      title: 'Consumindo APIs REST com Axios e tratamento de erros',
      points: [
        'Interceptors centralizam autenticação e tratamento de erro',
        'Estados de erro precisam de uma resposta visual clara para o usuário',
        'Timeouts evitam que a interface fique esperando para sempre',
      ],
    },
    {
      title: 'Boas práticas de CSS: BEM, utility-first e organização',
      points: [
        'Convenções de nomenclatura evitam conflitos de estilo entre componentes',
        'Classes utilitárias aceleram protótipos, mas exigem disciplina para não virar bagunça',
        'CSS bem organizado é tão importante quanto o código JavaScript',
      ],
    },
    {
      title: 'Web Components e o futuro da reutilização de UI',
      points: [
        'Componentes nativos do navegador funcionam em qualquer framework',
        'Encapsulamento via Shadow DOM evita vazamento de estilos',
        'A adoção ainda é gradual, mas vale acompanhar o ecossistema',
      ],
    },
    {
      title: 'SSR e SEO: quando o frontend também pensa em busca',
      points: [
        'Conteúdo renderizado no servidor chega pronto para os motores de busca',
        'Meta tags dinâmicas melhoram o compartilhamento em redes sociais',
        'Nem toda aplicação precisa de SSR — avalie o cenário real',
      ],
    },
    {
      title: 'Dark mode: implementando temas com carinho',
      points: [
        'Variáveis CSS facilitam a troca de paletas de cor',
        'Contraste precisa ser revisado em ambos os temas, não só no claro',
        'Respeitar a preferência do sistema operacional é um bom padrão',
      ],
    },
    {
      title: 'Microfrontends: vale a pena para o seu projeto?',
      points: [
        'Times independentes ganham autonomia para publicar no próprio ritmo',
        'A complexidade de integração aumenta e precisa ser bem gerenciada',
        'Nem todo projeto justifica esse nível de separação',
      ],
    },
    {
      title: 'Debugging no navegador: DevTools além do console.log',
      points: [
        'Breakpoints condicionais economizam tempo em bugs difíceis de reproduzir',
        'A aba de performance revela gargalos de renderização',
        'Vue DevTools mostra o estado dos componentes em tempo real',
      ],
    },
    {
      title: 'Animações com propósito: motion design na web',
      points: [
        'Transições ajudam o usuário a entender mudanças de contexto',
        'Animações devem respeitar preferências de redução de movimento',
        'Exagerar na animação pode atrapalhar mais do que ajudar',
      ],
    },
    {
      title: 'Do protótipo ao código: trabalhando com Figma',
      points: [
        'Specs de espaçamento e cor evitam retrabalho na implementação',
        'Componentes do design devem espelhar componentes do código',
        'Conversar com quem desenhou a tela esclarece decisões não óbvias',
      ],
    },
  ],
  backend: [
    {
      title: 'Arquitetura em camadas: por que separar responsabilidades',
      points: [
        'Cada camada tem uma razão única para mudar',
        'Regras de negócio isoladas facilitam testes automatizados',
        'Trocar um banco de dados não deveria quebrar a regra de negócio',
      ],
    },
    {
      title: 'Clean Code: nomes que contam a história do sistema',
      points: [
        'Um bom nome elimina a necessidade de um comentário explicativo',
        'Funções pequenas e bem nomeadas facilitam a leitura do fluxo',
        'Código lido é código lido muito mais vezes do que escrito',
      ],
    },
    {
      title: 'SOLID na prática com TypeScript',
      points: [
        'Responsabilidade única evita classes que fazem de tudo um pouco',
        'Depender de abstrações facilita trocar implementações no futuro',
        'Interfaces pequenas são mais fáceis de implementar corretamente',
      ],
    },
    {
      title: 'Node.js e o event loop: entendendo a assincronia',
      points: [
        'Operações de I/O não bloqueiam a thread principal',
        'Callbacks, promises e async/await resolvem o mesmo problema de formas diferentes',
        'Bloquear o event loop com processamento pesado afeta toda a aplicação',
      ],
    },
    {
      title: 'Fastify vs Express: escolhendo o framework certo',
      points: [
        'Performance de serialização JSON é um diferencial do Fastify',
        'Plugins encapsulados ajudam a organizar módulos grandes',
        'A escolha também depende da familiaridade do time',
      ],
    },
    {
      title: 'Modelagem de banco de dados relacional',
      points: [
        'Normalização evita duplicidade e inconsistência de dados',
        'Chaves estrangeiras garantem integridade referencial',
        'Índices bem pensados aceleram consultas frequentes',
      ],
    },
    {
      title: 'Migrations: versionando o esquema do banco',
      points: [
        'Cada mudança de schema fica documentada e reversível',
        'Times diferentes conseguem sincronizar o banco sem conflito',
        'Rodar migrations em produção exige cuidado com dados existentes',
      ],
    },
    {
      title: 'Autenticação com JWT: armadilhas comuns',
      points: [
        'Tokens sem expiração viram um risco de segurança',
        'Dados sensíveis não deveriam estar no payload do token',
        'Refresh tokens exigem uma estratégia de revogação clara',
      ],
    },
    {
      title: 'Paginação por cursor: por que ela escala melhor',
      points: [
        'Cursores evitam problemas de deslocamento em tabelas grandes',
        'A performance da consulta não degrada conforme o usuário avança nas páginas',
        'Cursores lidam melhor com dados inseridos durante a navegação',
      ],
    },
    {
      title: 'Testes automatizados: pirâmide de testes na prática',
      points: [
        'Testes unitários são rápidos e cobrem a maior parte dos casos',
        'Testes de integração validam a colaboração entre módulos',
        'Poucos testes end-to-end bem escolhidos valem mais que muitos frágeis',
      ],
    },
    {
      title: 'Tratamento de erros: exceptions que fazem sentido',
      points: [
        'Erros de negócio e erros técnicos merecem tratamentos diferentes',
        'Mensagens claras ajudam quem consome a API a se corrigir',
        'Capturar e ignorar um erro sem log é um problema escondido',
      ],
    },
    {
      title: 'Design Patterns: Repository e Use Case no backend',
      points: [
        'O Repository isola o acesso a dados da regra de negócio',
        'Use Cases descrevem exatamente o que o sistema faz para o usuário',
        'Essa separação facilita testar regra de negócio sem banco de dados real',
      ],
    },
    {
      title: 'APIs RESTful: contratos claros, times alinhados',
      points: [
        'Verbos HTTP usados corretamente comunicam intenção sem ambiguidade',
        'Documentação viva evita que o contrato fique desatualizado',
        'Versionamento de API protege quem já está integrado',
      ],
    },
    {
      title: 'Rate limiting e proteção contra abuso de API',
      points: [
        'Limitar requisições protege o serviço de picos inesperados',
        'Respostas 429 bem formadas orientam o consumidor da API',
        'Rate limiting também é uma camada de segurança contra ataques automatizados',
      ],
    },
    {
      title: 'Logs estruturados: depurando em produção sem sofrimento',
      points: [
        'Logs em formato estruturado são fáceis de buscar e filtrar',
        'Correlacionar logs por requisição acelera a investigação de incidentes',
        'Logar dado sensível é um erro que vira incidente de segurança',
      ],
    },
    {
      title: 'Cache: quando, onde e por que usar',
      points: [
        'Cache reduz carga em consultas repetidas e custosas',
        'Invalidação de cache é a parte difícil, não a implementação',
        'Nem todo dado deveria ser cacheado por padrão',
      ],
    },
    {
      title: 'Filas e processamento assíncrono',
      points: [
        'Filas desacoplam tarefas demoradas da resposta imediata ao usuário',
        'Reprocessamento com retry lida melhor com falhas temporárias',
        'Idempotência evita efeitos colaterais duplicados no reprocessamento',
      ],
    },
    {
      title: 'Segurança de APIs: OWASP Top 10 no dia a dia',
      points: [
        'Validar entrada do usuário evita boa parte dos ataques comuns',
        'Autorização precisa ser verificada em cada recurso, não só no login',
        'Dependências desatualizadas são uma porta de entrada frequente para ataques',
      ],
    },
    {
      title: 'Code review: crítica construtiva gera código melhor',
      points: [
        'Revisar código é sobre o sistema, não sobre quem escreveu',
        'Comentários específicos e acionáveis valem mais que críticas genéricas',
        'Um bom review também ensina, não só aponta problemas',
      ],
    },
    {
      title: 'Do monólito aos módulos: organizando o crescimento',
      points: [
        'Fronteiras claras entre módulos evitam acoplamento silencioso',
        'Nem todo sistema precisa virar microsserviços para crescer bem',
        'Organização por domínio facilita encontrar onde cada regra vive',
      ],
    },
  ],
  cloud: [
    {
      title: 'Docker na prática: containers do zero ao deploy',
      points: [
        'Imagens reproduzem o mesmo ambiente do laptop até a produção',
        'Camadas bem organizadas deixam o build mais rápido',
        'Containers menores reduzem superfície de ataque e tempo de deploy',
      ],
    },
    {
      title: 'CI/CD: automatizando o caminho até produção',
      points: [
        'Pipelines automatizados reduzem erro humano no deploy',
        'Testes na esteira dão confiança para publicar com frequência',
        'Deploys pequenos e frequentes são mais fáceis de investigar quando falham',
      ],
    },
    {
      title: 'Infraestrutura como código com Terraform',
      points: [
        'Infraestrutura versionada pode ser revisada como qualquer outro código',
        'Ambientes reproduzíveis eliminam o "na minha máquina funciona"',
        'Mudanças de infraestrutura passam a ter histórico e revisão',
      ],
    },
    {
      title: 'Observabilidade: métricas, logs e traces',
      points: [
        'Métricas mostram o que está acontecendo, traces mostram onde',
        'Dashboards bons respondem perguntas antes que alguém precise perguntar',
        'Observabilidade é investimento que se paga no primeiro incidente',
      ],
    },
    {
      title: 'Kubernetes para quem vem do Docker Compose',
      points: [
        'Pods e services organizam o que antes era um arquivo compose',
        'Auto-scaling responde a picos de tráfego sem intervenção manual',
        'A curva de aprendizado é real, mas compensa em escala',
      ],
    },
    {
      title: 'Deploy azul-verde: zero downtime é possível',
      points: [
        'Dois ambientes idênticos permitem trocar de versão sem interrupção',
        'Rollback vira uma troca de rota, não uma correção emergencial',
        'Validar o ambiente novo antes de rotear tráfego evita surpresas',
      ],
    },
    {
      title: 'Gerenciando segredos e variáveis de ambiente com segurança',
      points: [
        'Segredos nunca deveriam estar versionados no repositório',
        'Cofres de segredo centralizam acesso e permitem rotação',
        'Cada ambiente precisa das próprias credenciais, sem reaproveitamento',
      ],
    },
    {
      title: 'Escalabilidade horizontal: pensando além de um servidor',
      points: [
        'Aplicações sem estado escalam horizontalmente com muito mais facilidade',
        'Balanceamento de carga distribui requisições entre instâncias saudáveis',
        'Escalar automaticamente exige métricas confiáveis para decidir quando agir',
      ],
    },
    {
      title: 'Custos na nuvem: otimizando sem perder performance',
      points: [
        'Recursos ociosos são o vazamento de custo mais comum',
        'Instâncias certas para a carga certa evitam pagar por capacidade não usada',
        'Monitorar custo deveria ser tão rotineiro quanto monitorar performance',
      ],
    },
    {
      title: 'Monitoramento proativo: alertas que realmente importam',
      points: [
        'Alertas em excesso ensinam a equipe a ignorá-los',
        'Cada alerta deveria vir com um próximo passo claro',
        'Monitorar sintomas do usuário é mais útil que só monitorar servidores',
      ],
    },
    {
      title: 'Backup e disaster recovery: planejando o pior cenário',
      points: [
        'Um backup nunca testado é uma esperança, não um plano',
        'RTO e RPO definem o quanto a empresa tolera perder',
        'Testar a restauração é tão importante quanto fazer o backup',
      ],
    },
    {
      title: 'Serverless: quando funções sem servidor fazem sentido',
      points: [
        'Cargas de trabalho esporádicas se beneficiam de pagar só pelo uso',
        'Cold start é um custo real que precisa entrar na decisão',
        'Nem toda aplicação se encaixa bem no modelo serverless',
      ],
    },
    {
      title: 'Redes na nuvem: VPCs, subnets e segurança de perímetro',
      points: [
        'Isolar recursos em sub-redes reduz a superfície exposta',
        'Regras de firewall restritivas por padrão evitam exposições acidentais',
        'Entender a topologia de rede ajuda a diagnosticar problemas de conectividade',
      ],
    },
    {
      title: 'GitOps: versionando também a infraestrutura',
      points: [
        'O estado desejado do sistema vive em um repositório Git',
        'Mudanças passam por revisão antes de chegar ao cluster',
        'Reverter uma mudança de infraestrutura vira um simples git revert',
      ],
    },
    {
      title: 'Load balancing: distribuindo tráfego com inteligência',
      points: [
        'Health checks tiram instâncias com problema da rotação automaticamente',
        'Algoritmos de balanceamento diferentes servem a cenários diferentes',
        'Um bom balanceador é transparente até o momento em que falha',
      ],
    },
    {
      title: 'Ambientes de homologação: espelhando a produção',
      points: [
        'Diferenças entre ambientes escondem bugs até o pior momento possível',
        'Dados de teste realistas revelam problemas que dados fake não mostram',
        'Homologação confiável reduz surpresas no dia do deploy',
      ],
    },
    {
      title: 'Health checks e self-healing em sistemas distribuídos',
      points: [
        'Um serviço que se reinicia sozinho reduz o tempo de indisponibilidade',
        'Health checks precisam refletir a saúde real da aplicação, não só o processo vivo',
        'Self-healing não substitui investigar a causa raiz do problema',
      ],
    },
    {
      title: 'Pipeline de deploy: da branch ao ambiente do usuário',
      points: [
        'Cada etapa do pipeline deveria falhar rápido quando algo está errado',
        'Aprovações manuais fazem sentido em etapas de maior risco',
        'Visibilidade do pipeline dá confiança para o time inteiro',
      ],
    },
    {
      title: 'Multi-cloud: vantagens, riscos e quando considerar',
      points: [
        'Evitar dependência de um único provedor tem um custo de complexidade',
        'Ferramentas específicas de cada nuvem dificultam a portabilidade total',
        'A decisão deveria vir de uma necessidade real, não de modismo',
      ],
    },
    {
      title: 'Cultura DevOps: pessoas antes de ferramentas',
      points: [
        'Ferramentas não resolvem times que não conversam entre si',
        'Responsabilidade compartilhada pelo que está em produção muda o comportamento do time',
        'DevOps é uma forma de trabalhar antes de ser um conjunto de ferramentas',
      ],
    },
  ],
  data: [
    {
      title: 'SQL além do básico: joins, índices e performance',
      points: [
        'Entender o plano de execução explica por que uma query é lenta',
        'Índices aceleram leitura, mas têm custo em escrita',
        'Joins mal pensados são a causa mais comum de lentidão em relatórios',
      ],
    },
    {
      title: 'NoSQL: quando o modelo relacional não é o ideal',
      points: [
        'Documentos flexíveis se encaixam bem em dados que mudam de formato',
        'Escalar horizontalmente costuma ser mais natural em bancos não relacionais',
        'A escolha do modelo depende de como os dados serão consultados',
      ],
    },
    {
      title: 'Modelagem dimensional para relatórios e dashboards',
      points: [
        'Fatos e dimensões organizam dados para consultas analíticas rápidas',
        'Tabelas desnormalizadas propositalmente facilitam a leitura do negócio',
        'Um bom modelo dimensional acompanha a pergunta que o negócio faz',
      ],
    },
    {
      title: 'Introdução à ciência de dados para desenvolvedores',
      points: [
        'Estatística básica já resolve grande parte das perguntas de negócio',
        'Bibliotecas como pandas aceleram a exploração inicial dos dados',
        'Visualizar antes de modelar evita conclusões precipitadas',
      ],
    },
    {
      title: 'Machine Learning: da teoria ao primeiro modelo',
      points: [
        'Um modelo simples e explicável costuma valer mais que um complexo obscuro',
        'A qualidade dos dados de treino define o teto de qualidade do modelo',
        'Avaliar o modelo com métricas erradas gera falsa confiança',
      ],
    },
    {
      title: 'Qualidade de dados: o combustível de qualquer análise',
      points: [
        'Dados duplicados e inconsistentes distorcem qualquer métrica calculada sobre eles',
        'Validações na entrada evitam propagar sujeira pelo resto do sistema',
        'Qualidade de dado é responsabilidade de todo mundo que insere dado',
      ],
    },
    {
      title: 'ETL e pipelines de dados confiáveis',
      points: [
        'Pipelines idempotentes podem ser reexecutados sem gerar dado duplicado',
        'Falhas parciais precisam de um plano claro de recuperação',
        'Monitorar o pipeline é tão importante quanto monitorar a aplicação',
      ],
    },
    {
      title: 'Big Data: quando o volume muda a abordagem',
      points: [
        'Processamento distribuído se torna necessário quando um servidor não é mais suficiente',
        'Nem todo problema de dado grande é um problema de Big Data',
        'A arquitetura certa depende do volume, da velocidade e da variedade dos dados',
      ],
    },
    {
      title: 'LLMs no dia a dia: da curiosidade à aplicação prática',
      points: [
        'Prompts bem estruturados melhoram drasticamente a qualidade da resposta',
        'Modelos de linguagem erram com confiança — validação humana continua necessária',
        'Casos de uso bem delimitados entregam mais valor do que soluções genéricas',
      ],
    },
    {
      title: 'Ética e viés em modelos de inteligência artificial',
      points: [
        'Um modelo aprende os vieses presentes nos dados de treino',
        'Auditar decisões automatizadas evita perpetuar desigualdades existentes',
        'Transparência sobre limitações do modelo é parte da responsabilidade técnica',
      ],
    },
    {
      title: 'Visualização de dados que conta uma história',
      points: [
        'O gráfico certo depende da pergunta que está sendo respondida',
        'Excesso de informação em um único gráfico confunde mais do que esclarece',
        'Cores e escalas mal escolhidas podem enganar quem está lendo',
      ],
    },
    {
      title: 'Índices de banco de dados: acelerando consultas',
      points: [
        'Índices compostos precisam respeitar a ordem das colunas mais filtradas',
        'Índices demais desaceleram operações de escrita',
        'Analisar consultas lentas é o primeiro passo antes de criar um índice novo',
      ],
    },
    {
      title: 'Data warehouses vs data lakes',
      points: [
        'Data warehouses guardam dados já estruturados para análise',
        'Data lakes armazenam dado bruto, em qualquer formato, para uso futuro',
        'Escolher entre os dois depende da maturidade analítica da equipe',
      ],
    },
    {
      title: 'A/B testing: decisões guiadas por dados',
      points: [
        'Um bom teste A/B começa com uma hipótese clara, não com uma ideia solta',
        'Significância estatística evita decisões baseadas em ruído aleatório',
        'Testar uma variável por vez facilita entender o que realmente funcionou',
      ],
    },
    {
      title: 'Privacidade e LGPD no tratamento de dados',
      points: [
        'Coletar só o dado necessário reduz risco e responsabilidade',
        'Consentimento claro é a base de qualquer coleta de dado pessoal',
        'Anonimização bem feita permite análise sem expor identidade',
      ],
    },
    {
      title: 'Feature engineering: onde o modelo realmente melhora',
      points: [
        'Boas features costumam importar mais que o algoritmo escolhido',
        'Combinar variáveis existentes pode revelar padrões que estavam escondidos',
        'Features vazadas do futuro geram modelos que parecem bons e não são',
      ],
    },
    {
      title: 'Analytics de produto: entendendo o comportamento do usuário',
      points: [
        'Eventos bem definidos permitem reconstruir a jornada real do usuário',
        'Métricas de vaidade escondem o que realmente importa para o negócio',
        'Funis de conversão mostram exatamente onde o usuário desiste',
      ],
    },
    {
      title: 'Bancos de dados vetoriais e busca semântica',
      points: [
        'Embeddings representam significado, não apenas palavras exatas',
        'Busca semântica encontra resultados relevantes mesmo sem termos idênticos',
        'A escolha do modelo de embedding afeta diretamente a qualidade da busca',
      ],
    },
    {
      title: 'Automatizando relatórios com dados confiáveis',
      points: [
        'Relatórios automatizados só têm valor se a fonte de dado for confiável',
        'Alertas de anomalia evitam que um erro passe despercebido por semanas',
        'Documentar a origem de cada métrica evita divergência entre times',
      ],
    },
    {
      title: 'Do dado bruto à decisão de negócio',
      points: [
        'Uma análise só gera valor quando vira uma decisão concreta',
        'Contexto de negócio é tão importante quanto rigor estatístico',
        'Comunicar o resultado de forma simples é parte do trabalho de análise',
      ],
    },
  ],
  career: [
    {
      title: 'Como montar um portfólio que conta a sua história',
      points: [
        'Poucos projetos bem explicados valem mais que muitos projetos rasos',
        'Contar o porquê das decisões técnicas mostra mais maturidade que só o código',
        'Um bom README é o primeiro contato de quem avalia o seu trabalho',
      ],
    },
    {
      title: 'Scrum na prática: papéis, cerimônias e valor entregue',
      points: [
        'Cada cerimônia existe para responder uma pergunta específica do time',
        'Sprint sem objetivo claro vira só uma lista de tarefas',
        'O Scrum Master remove obstáculos, não distribui tarefas',
      ],
    },
    {
      title: 'Kanban: visualizando o fluxo de trabalho',
      points: [
        'Limitar o trabalho em andamento reduz o efeito multitarefa',
        'O quadro visual expõe gargalos que ficariam escondidos em uma lista',
        'Fluxo contínuo se adapta bem a times com demanda imprevisível',
      ],
    },
    {
      title: 'Soft skills que fazem diferença na carreira tech',
      points: [
        'Comunicação clara evita retrabalho gerado por mal-entendido',
        'Saber pedir ajuda no momento certo acelera o próprio aprendizado',
        'Empatia com quem vai usar o sistema muda decisões técnicas',
      ],
    },
    {
      title: 'Como se preparar para entrevistas técnicas',
      points: [
        'Explicar o raciocínio importa tanto quanto chegar na resposta certa',
        'Revisar fundamentos vale mais na véspera do que decorar soluções prontas',
        'Perguntar sobre o time e o processo mostra interesse genuíno na vaga',
      ],
    },
    {
      title: 'Trabalho em equipe: comunicação assíncrona que funciona',
      points: [
        'Mensagens completas evitam idas e vindas desnecessárias',
        'Documentar decisões poupa tempo de quem chega depois na conversa',
        'Nem tudo precisa de reunião — muita coisa resolve em um texto bem escrito',
      ],
    },
    {
      title: 'Feedback: como dar e como receber',
      points: [
        'Feedback específico e oportuno é mais útil que feedback genérico e tardio',
        'Separar a crítica ao trabalho da crítica à pessoa evita defensividade',
        'Pedir feedback com frequência acelera o próprio desenvolvimento',
      ],
    },
    {
      title: 'Gestão do tempo para quem estuda e trabalha',
      points: [
        'Blocos de foco protegidos rendem mais que um dia cheio de interrupções',
        'Priorizar poucas coisas importantes vale mais que tentar fazer tudo',
        'Descanso também é parte do planejamento, não uma exceção a ele',
      ],
    },
    {
      title: 'Primeiro emprego em tecnologia: por onde começar',
      points: [
        'Projetos pessoais mostram iniciativa mesmo sem experiência formal',
        'Candidatar-se sem preencher 100% dos requisitos costuma valer a pena',
        'A primeira vaga não precisa ser perfeita, só precisa ser um bom começo',
      ],
    },
    {
      title: 'Mentoria: acelerando o aprendizado através da troca',
      points: [
        'Um mentor ajuda a evitar erros que já foram cometidos por outra pessoa',
        'Mentorar também é uma forma poderosa de consolidar o próprio conhecimento',
        'A relação funciona melhor quando as expectativas são combinadas desde o início',
      ],
    },
    {
      title: 'Impostor syndrome: você é mais capaz do que pensa',
      points: [
        'Comparar o próprio começo com o meio da jornada de outra pessoa distorce a percepção',
        'Errar durante o aprendizado é sinal de que você está sendo desafiado',
        'Falar sobre a insegurança com colegas normalmente revela que não é só você',
      ],
    },
    {
      title: 'Contribuindo com projetos open source',
      points: [
        'Corrigir documentação é uma ótima porta de entrada para o open source',
        'Ler código de outras pessoas ensina padrões que livro nenhum ensina sozinho',
        'Contribuições pequenas e consistentes valem mais que uma grande de uma vez só',
      ],
    },
    {
      title: 'Networking genuíno na comunidade tech',
      points: [
        'Ajudar sem esperar retorno imediato constrói relações mais duradouras',
        'Eventos da área são oportunidades de aprender, não só de se promover',
        'Manter contato ao longo do tempo importa mais que trocar cartões uma vez',
      ],
    },
    {
      title: 'LinkedIn: construindo uma presença profissional relevante',
      points: [
        'Compartilhar o que você está aprendendo atrai conversas interessantes',
        'Um perfil claro sobre o que você faz facilita ser encontrado',
        'Consistência importa mais que viralizar um único post',
      ],
    },
    {
      title: 'Certificações: quando valem o investimento',
      points: [
        'Uma certificação vale mais quando comprova conhecimento que você já aplica',
        'Nem toda vaga exige certificação — avalie o retorno para o seu objetivo',
        'O aprendizado do processo costuma valer mais que o certificado em si',
      ],
    },
    {
      title: 'Trabalho remoto: disciplina e rotina saudável',
      points: [
        'Um espaço dedicado para trabalhar ajuda a separar rotina pessoal da profissional',
        'Combinar horários de foco com o time evita mal-entendidos de disponibilidade',
        'Pausas reais ao longo do dia sustentam produtividade no longo prazo',
      ],
    },
    {
      title: 'Retrospectivas: transformando erros em aprendizado de equipe',
      points: [
        'Um ambiente seguro é pré-requisito para uma retrospectiva honesta',
        'Poucas ações concretas valem mais que uma lista longa de boas intenções',
        'Revisitar ações da retrospectiva anterior mostra que o processo é levado a sério',
      ],
    },
    {
      title: 'Liderança técnica: influenciar sem precisar mandar',
      points: [
        'Explicar o porquê de uma decisão técnica convence mais que impor a decisão',
        'Ouvir a equipe antes de decidir melhora a qualidade da decisão final',
        'Liderança técnica também é sobre remover obstáculos do caminho do time',
      ],
    },
    {
      title: 'Planejamento de carreira: onde você quer estar em 5 anos',
      points: [
        'Metas claras ajudam a filtrar quais oportunidades realmente importam agora',
        'Nem toda evolução de carreira precisa ser virar gestor',
        'Revisar o plano periodicamente é tão importante quanto criá-lo',
      ],
    },
    {
      title: 'Aprendizado contínuo: mantendo-se relevante em tecnologia',
      points: [
        'Aprender os fundamentos envelhece melhor do que aprender só a ferramenta da moda',
        'Ensinar o que você aprendeu é uma das formas mais eficazes de fixar o conteúdo',
        'Curiosidade constante importa mais que tentar saber tudo de uma vez',
      ],
    },
  ],
}

const OPENINGS: Record<Specialty, string[]> = {
  frontend: [
    'No desenvolvimento frontend, pequenas decisões de arquitetura têm grande impacto na experiência do usuário.',
    'Quem constrói interfaces sabe: o detalhe é o que separa um produto bom de um produto memorável.',
    'A cada sprint, a nossa disciplina de frontend evolui — e hoje quero compartilhar um pouco sobre isso.',
    'Construir para a web é construir para todo mundo: dispositivos, conexões e pessoas diferentes.',
  ],
  backend: [
    'No backend, cada decisão de arquitetura ecoa por todo o sistema — por isso vale parar para refletir sobre ela.',
    'Sistemas confiáveis não nascem prontos: eles são construídos com boas práticas, uma decisão de cada vez.',
    'Hoje quero compartilhar algumas reflexões sobre um tema essencial para quem programa no back-end.',
    'Um bom backend é invisível para o usuário e sólido para quem o mantém.',
  ],
  cloud: [
    'A nuvem mudou a forma como entregamos software — e ainda estamos aprendendo a usá-la bem.',
    'Automatizar não é sobre substituir pessoas, é sobre eliminar trabalho repetitivo para focar no que importa.',
    'Hoje o assunto é infraestrutura, mas o objetivo continua o mesmo: entregar valor com confiança.',
    'Quem trabalha com DevOps sabe que a estabilidade em produção começa muito antes do deploy.',
  ],
  data: [
    'Todo sistema gera dados — a pergunta é o que fazemos com eles.',
    'Dados bons geram decisões boas; dados ruins geram certezas erradas.',
    'A inteligência artificial está em toda parte, mas o fundamento continua sendo dado de qualidade.',
    'Hoje vamos além do código e falamos sobre o que os números contam.',
  ],
  career: [
    'Carreira em tecnologia não é uma corrida de 100 metros, é uma maratona — e vale correr no seu ritmo.',
    'Além do código, existem habilidades que fazem toda a diferença na sua trajetória profissional.',
    'Recebo muitas perguntas sobre carreira, e hoje quero compartilhar algumas reflexões sobre o assunto.',
    'O mercado de tecnologia valoriza quem sabe técnica e também sabe se comunicar.',
  ],
}

const CLOSINGS: Record<Specialty, string[]> = {
  frontend: [
    'Bons estudos e até a próxima aula!',
    'Deixem suas dúvidas nos comentários, vamos aprofundar isso juntos em sala.',
    'Pratiquem no próprio projeto do Tech Challenge — é a melhor forma de fixar o conteúdo.',
    'Na próxima aula trago mais exemplos práticos sobre esse tema.',
  ],
  backend: [
    'Revisem o código de vocês com esse olhar — o ganho é imediato.',
    'Tragam suas dúvidas para o próximo plantão de dúvidas.',
    'Apliquem esse conceito no projeto do Tech Challenge e me mostrem o resultado.',
    'Até a próxima aula, e bons commits!',
  ],
  cloud: [
    'Testem esse fluxo no ambiente de estudos antes de aplicar em produção.',
    'Compartilhem no fórum da turma como vocês resolveram isso nos seus projetos.',
    'Na próxima aula prática, vamos colocar tudo isso em um pipeline real.',
    'Fiquem à vontade para chamar no horário de monitoria.',
  ],
  data: [
    'Explorem essas técnicas com o dataset que estamos usando em aula.',
    'Tragam suas análises para discutirmos no próximo encontro.',
    'Qualquer dúvida, me procurem no horário de atendimento.',
    'Bons estudos, e cuidado com conclusões precipitadas nos dados!',
  ],
  career: [
    'Conto com vocês na próxima roda de conversa sobre carreira.',
    'Levem essas reflexões para o próximo passo da jornada de vocês.',
    'Estou à disposição para conversar individualmente sobre isso.',
    'Sucesso, e continuem construindo a carreira de vocês com intenção.',
  ],
}

function buildContent(
  specialty: Specialty,
  index: number,
  points: string[],
): string {
  const opening = OPENINGS[specialty][index % OPENINGS[specialty].length]
  const closing = CLOSINGS[specialty][index % CLOSINGS[specialty].length]
  const bullets = points.map((point) => `- ${point}`).join('\n')

  return `${opening}\n\n${bullets}\n\n${closing}`
}

async function ensureUser(
  client: PoolClient,
  email: string,
  role: string,
  name: string,
): Promise<string> {
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [
    email,
  ])

  let userId: string

  if (existing.rowCount && existing.rowCount > 0) {
    userId = existing.rows[0].id
  } else {
    const hashed = await hashPassword(SEED_PASSWORD)
    const inserted = await client.query(
      'INSERT INTO users(email, password, role) VALUES($1, $2, $3) RETURNING id',
      [email, hashed, role],
    )
    userId = inserted.rows[0].id
  }

  const existingProfile = await client.query(
    'SELECT 1 FROM profiles WHERE user_id = $1',
    [userId],
  )

  if (!existingProfile.rowCount) {
    await client.query('INSERT INTO profiles(name, user_id) VALUES($1, $2)', [
      name,
      userId,
    ])
  }

  return userId
}

async function ensurePost(
  client: PoolClient,
  authorId: string,
  title: string,
  content: string,
  createdAt: Date,
): Promise<void> {
  const existing = await client.query(
    'SELECT 1 FROM posts WHERE title = $1 AND author_id = $2',
    [title, authorId],
  )

  if (existing.rowCount) return

  await client.query(
    'INSERT INTO posts(title, content, author_id, created_at, updated_at) VALUES($1, $2, $3, $4, $4)',
    [title, content, authorId, createdAt],
  )
}

async function main() {
  const {
    POSTGRES_USER,
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
  } = process.env

  if (!POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_USER) {
    console.error(
      'Missing POSTGRES_HOST, POSTGRES_DB or POSTGRES_USER in environment variables',
    )
    process.exit(1)
  }

  const pool = new Pool({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT ? parseInt(POSTGRES_PORT, 10) : undefined,
  })

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await ensureUser(client, KAIQUE.email, KAIQUE.role, KAIQUE.name)

    for (const student of STUDENTS) {
      await ensureUser(client, student.email, student.role, student.name)
    }

    let totalPosts = 0
    const now = Date.now()

    for (const teacher of TEACHERS) {
      const teacherId = await ensureUser(
        client,
        teacher.email,
        teacher.role,
        teacher.name,
      )

      const topics = TOPICS[teacher.specialty]

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]
        const content = buildContent(teacher.specialty, i, topic.points)
        const createdAt = new Date(
          now - (topics.length - i) * 8 * 60 * 60 * 1000,
        )

        await ensurePost(client, teacherId, topic.title, content, createdAt)
        totalPosts++
      }
    }

    await client.query('COMMIT')

    console.log('Local seed completed successfully')
    console.log(`Password for all accounts: ${SEED_PASSWORD}`)
    console.log(`- ${KAIQUE.email} (${KAIQUE.role})`)
    for (const teacher of TEACHERS) {
      console.log(`- ${teacher.email} (${teacher.role})`)
    }
    for (const student of STUDENTS) {
      console.log(`- ${student.email} (${student.role})`)
    }
    console.log(`Posts created: ${totalPosts}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed', err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
