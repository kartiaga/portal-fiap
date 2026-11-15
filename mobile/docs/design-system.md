# Design system do app mobile

Define como o app deve parecer e se comportar. Os valores ficam em `src/theme/index.ts`; este documento explica as regras de uso. Mude os dois juntos.

## Princípio

**A marca decide a cor e o conteúdo; a plataforma decide a navegação.**

Abas, cabeçalhos, voltar, confirmações e o puxar para atualizar são os do sistema (`NativeTabs`, `Stack`, `Alert`, `RefreshControl`), tingidos com o vermelho FIAP. Botões, campos e cartões são componentes próprios em `src/components/`, porque o app roda no Expo Go e não usa bibliotecas de UI nativa. Mesmo assim, eles seguem as medidas e o comportamento do sistema: área de toque mínima, fonte do sistema e respeito ao tamanho de fonte do usuário.

## Cor

Leia sempre pelo `useTheme()`. Nunca escreva hexadecimal em tela ou componente. O app segue o tema do sistema (`userInterfaceStyle: automatic`), e toda tela tem que funcionar em claro e escuro.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `text` | `#19181C` | `#F6F4F5` | Texto principal |
| `textSecondary` | `#5B5964` | `#B1ADBB` | Texto de apoio e metadados |
| `textTertiary` | `#76717F` | `#7D7989` | Placeholder, chevron e conteúdo desabilitado |
| `background` | `#F6F4F5` | `#121114` | Fundo da tela |
| `surface` | `#FFFFFF` | `#1D1C21` | Cartões |
| `backgroundElement` | `#EFEBEC` | `#26252B` | Preenchimento discreto (busca, trilho do segmentado) |
| `backgroundSelected` | `#E6E3EA` | `#33313A` | Item pressionado |
| `border` | `#E6E3EA` | `#33313A` | Bordas de cartão e divisores (decorativos) |
| `borderInput` | `#8A8694` | `#706C7A` | Linha de base dos campos em repouso |
| `segmentSelected` | `#FFFFFF` | `#46444F` | Opção escolhida do controle segmentado |
| `tint` / `tintPressed` / `onTint` | `#E4002B` / `#A3001F` / branco | `#E4002B` / `#C4102E` / branco | Preenchimento da ação primária, pressionado, texto sobre ele |
| `tintText` / `tintSoft` | `#C4102E` / `#FCE8EB` | `#FF4D63` / `#3A1219` | Vermelho como texto / fundo de selo e avatar |
| `success`, `info`, `danger` (+ `*Soft`) | | | Sucesso, informação, erro e ação destrutiva |

Regras:

- **Vermelho é ação.** Uma ação primária por tela. Nunca como fundo de tela ou de cartão, exceto no topo das telas de entrada. Elementos que se repetem numa lista (avatar, selo) usam o vermelho suave (`tintSoft` + `tintText`), não o cheio.
- **`tint` é preenchimento e ícone, `tintText` é texto.** O vermelho cheio passa o mínimo de 3:1 para ícone nos dois temas (4,4:1 no claro, 3,9:1 no escuro), por isso o ícone da aba selecionada usa `tint`. Como texto, no escuro, ele não passa: use `tintText`.
- **O destrutivo se distingue pela forma, não só pela cor.** `danger` é um vermelho próximo do da marca, então a ação destrutiva sempre traz o ícone de lixeira e um formato próprio: só texto e ícone na lista (`dangerGhost`) e contorno na zona de exclusão das telas de edição (`danger`). Erros de campo e de envio usam `danger`.
- **Cor nunca é o único sinal.** Estado vem sempre com texto, ícone, peso ou espessura.
- Todos os pares de texto passam de 4,5:1 nos dois temas. `borderInput` passa de 3:1 sobre o fundo e a superfície. O placeholder (`textTertiary`) fica acima de 4:1.

## Tipografia

Fonte do sistema. Escala em `Typography`:

| Token | Tamanho / peso | Uso |
| --- | --- | --- |
| `display` | 32 / 700 | Título das abas e das telas de entrada |
| `article` | 26 / 700 | Título de uma postagem aberta |
| `title` | 22 / 600 | Nome no perfil |
| `headline` | 17 / 600 | Título de cartão, rótulo de botão |
| `body` | 16 / 400 | Campos e textos curtos |
| `reading` | 17 / 400, entrelinha 28 | Conteúdo de uma postagem aberta |
| `callout` | 14 / 400 | Resumo, apoio, mensagens de campo, frases com data ("Publicada em …") |
| `label` | 13 / 600 | Rótulo de campo, selo, botão pequeno, autor |
| `meta` | 12 / 500, monoespaçada | Só números (datas, contadores) e a marca "PORTAL" |

- A monoespaçada é para número e marca. Numa frase, a palavra fica na fonte do sistema e só o número em `meta` ("Editada **13/09/2026**" no `PostMeta`), ou a frase inteira em `callout`.
- Não desligue o ajuste de tamanho de fonte. Exceções: as iniciais do avatar (tamanho fixo), o título das abas (cresce até 1,3×, como o título grande do iOS) e a marca "FIAP" da abertura (até 1,2×).
- Não use altura fixa em contêiner de texto.

## Espaçamento, forma e medidas

Todos em `src/theme/index.ts`:

| Token | Valores | Uso |
| --- | --- | --- |
| `Spacing` | 2, 4, 8, 16, 24, 32, 64 | Base 4. Margem lateral das abas: 16; de formulários e leitura: 24 |
| `Radius` | `small` 6, `medium` 12, `large` 20, `pill` | Cartão, campo e busca em `medium`; botão pequeno e selo em `pill` |
| `IconSize` | `small` 16, `medium` 20, `large` 24, `xlarge` 28 | Botão pequeno 16; campos, linhas e avisos 20; voltar e seta 24; estado vazio 28 |
| `AvatarSize` | `small` 32, `medium` 40, `large` 64 | Cartão de postagem; lista de pessoas e autor na leitura; perfil |
| `ControlHeight` | `small` 36, `medium` 44/48, `field` 48, `large` 56 | Botão pequeno (com `hitSlop` chega a 44); botão médio e busca; campo; botão de largura total |
| `RowHeight` | 52 | Linha de lista agrupada (aba Conta) |
| `BorderWidth` | `hairline`, `thin` 1, `strong` 2 | Divisores; cartões e linha do campo em repouso; foco e erro |
| `Tracking` | `wide` 2, `tight` -1 | "PORTAL" em caixa alta; marca grande "FIAP" |

- Cartão: fundo `surface`, borda `thin` em `border`, raio `medium`, sem sombra.
- Área de toque mínima: `MinTouchSize` (44 no iOS, 48 no Android).
- Conteúdo limitado a `MaxContentWidth` (720) em tablet.

## Navegação

- **Abas** (`(app)/(tabs)/_layout.tsx`): Posts, Gerenciar, Pessoas e Conta. Gerenciar e Pessoas ficam ocultas para estudante. Ícones SF Symbols no iOS e Ionicons no Android: `newspaper`, `list.bullet.rectangle` (Ionicons `list`), `person.2` e `person.crop.circle`. O lápis fica reservado para a ação "Editar".
- O ícone da aba selecionada usa `tint`, e o rótulo, `text`.
- Telas de aba não têm cabeçalho de navegação: o título é o `ScreenHeader` (título `display` com a ação primária à direita e, só onde explica algo, uma frase de apoio). Título e busca ficam fixos e compactos, fora da lista.
- Telas internas usam o cabeçalho do `Stack`. Criação (nova postagem, novo professor, novo estudante) abre em modal; edição e leitura, empilhadas.
- Ações de cabeçalho usam `HeaderButton`: texto em `tintText`, peso regular (como o voltar). Modal de formulário: "Cancelar" à esquerda no iOS (`ModalCancel`); no Android, o voltar. Leitura de postagem: "Editar" à direita, só para quem pode editar.
- Formulário não tem "Cancelar" no rodapé: sair é pelo cabeçalho (ou gesto), e com alteração não salva `useDiscardGuard` pergunta "Descartar alterações?" ([Continuar editando] / [Descartar]). No modal, o arrasto para fechar fica desligado enquanto houver alteração.
- Busca e filtros ficam fora da `FlatList`, para o campo não perder o foco quando a lista recarrega. Busca de lista usa `TextField variant="search"` (Posts, Gerenciar e Pessoas).
- Excluir fica no fim da tela de edição (`DangerZone`), para postagem e pessoa; na leitura não há botão destrutivo. Em Gerenciar, cada cartão também tem Excluir (`dangerGhost`).

## Componentes

| Componente | Quando usar |
| --- | --- |
| `Button` | `primary` (uma por tela), `secondary` (contorno neutro), `ghost` (só texto, neutro), `danger` (destrutiva com contorno, na zona de exclusão), `dangerGhost` (destrutiva só com texto e ícone, nas listas). As destrutivas sempre pedem `Alert.alert` antes. Tamanhos `small` (cabeçalho, cartão), `medium`, `large` (largura total na base de formulário). O `primary` desabilitado fica neutro (`backgroundElement` + `textTertiary`), não vermelho desbotado; as outras variantes desabilitadas usam opacidade 0,55 |
| `TextField` | `form` (padrão): rótulo acima e linha na base (1 px `borderInput` em repouso, 2 px `tint` em foco, 2 px `danger` com erro, 1 px `border` desabilitado), ícone opcional, `error` e `hint` abaixo; `secureTextEntry` já traz o mostrar/ocultar. `search`: sem rótulo visível (o rótulo continua acessível), fundo `backgroundElement`, raio `medium`, altura `MinTouchSize`, borda de 2 px `tint` em foco |
| `Banner` | Aviso que não bloqueia: `error`, `success` e `info` (`infoSoft`/`info`, ex.: sessão expirada). `onDismiss` mostra o botão de fechar (área de 44); `action` mostra uma ação em texto sublinhado ("Tentar novamente") |
| `StateMessage` / `LoadingState` | Vazio, erro e carregando de uma tela ou lista |
| `FilterButton`, `FilterSheet`, `FilterTag` | Filtro de lista: ícone ao lado da busca (ponto vermelho quando há filtro), folha nativa `formSheet` com uma escolha por grupo e **Limpar** / **Aplicar**, e a etiqueta do filtro ativo abaixo da busca. A escolha vive no parâmetro da rota da aba |
| `SegmentedControl` | Escolher entre poucas opções num formulário (perfil no cadastro de pessoa) ou alternar poucas visões de uma lista. A opção escolhida usa `segmentSelected` e peso 600; as outras, peso 500 |
| `Avatar` | Foto de perfil (`uri`) ou, sem foto ou se ela não carregar, iniciais (ou ícone, sem nome). `tonal` (padrão: `tintSoft` + `tintText`) nas listas; `solid` (vermelho cheio) só no cartão de perfil da Conta |
| `Badge`, `RoleBadge`, `SelfBadge` | Selo em pílula com tom `brand`, `info`, `success` ou `neutral`. `RoleBadge` mostra o perfil; `SelfBadge` ("Você") marca o que é do usuário conectado |
| `PostMeta` | Cabeçalho comum dos cartões de postagem: avatar `small`, autor (`label`, `textSecondary`), selo "Você" e data em `meta` à direita (com prefixo opcional, como "Editada"). Com fonte acima de 1,3×, a data desce para a linha de baixo |
| `PostCard`, `PostAdminCard`, `PersonCard` | Itens das listas (memorizados com `memo`). Título `headline` e resumo de 2 linhas. No `PostCard` e no `PostAdminCard`, a área de conteúdo abre a leitura e a linha de baixo (curtir e comentários no feed; Editar `secondary` e Excluir `dangerGhost` em Gerenciar) fica separada, para o leitor de tela alcançar os botões |
| `LikeButton`, `CommentButton` | Curtidas e comentários, no rodapé do `PostCard` e abaixo do conteúdo na leitura, como no Instagram: o coração (24) curte, o número ao lado abre a folha de quem curtiu (com zero, não é tocável) e o balão abre a folha de comentários. Curtido: coração cheio em `tint` e número em `tintText`; não curtido: coração vazado e número em `textSecondary` (o formato também marca o estado). Número em `meta`. No feed, os rótulos incluem o título ("Curtir {título}", "Ver quem curtiu {título}", "Comentários de {título}") |
| `SheetScaffold`, `SheetHeader` | Folhas de lista (comentários, curtidas): rotas `formSheet` com um detent só (`lib/sheets.ts`) e puxador nativo. O `SheetScaffold` põe a lista na folha inteira e o título (`SheetHeader`: `headline` centralizado e divisor) e o rodapé fixos por cima, com fundo opaco; a lista recebe os recuos medidos. Não empilhe título, lista e rodapé numa folha: no iOS o react-native-screens estica a lista para a folha inteira e ela cobre o título |
| `CommentItem`, `CommentComposer` | Comentário com o mesmo cabeçalho do `PostMeta` e o texto (`body`) alinhado ao nome; Excluir `dangerGhost` só para o autor do comentário e o administrador. O campo fica fixo no pé da folha: pílula `backgroundElement` (raio `large`, borda de 2 px `tint` em foco) que começa com uma linha e cresce até cinco, com o botão de enviar circular dentro (`tint` com texto; `backgroundSelected` sem) |
| `ScreenHeader` | Título das abas. A ação (`{ label, accessibilityLabel, icon, onPress }`) é um botão pequeno e, com fonte acima de 1,3×, um círculo `tint` de 44 só com o ícone (o nome continua acessível). O texto é um verbo curto, porque o título da aba já diz o assunto: **Criar** em Posts e Gerenciar, **Adicionar** em Pessoas. O nome completo ("Nova postagem", "Nova pessoa") vai no `accessibilityLabel` e no título da tela que abre |
| `FormScreen` | Rolagem de formulário que sobe com o teclado |
| `HeaderButton`, `ModalCancel` | Botão de texto do cabeçalho do Stack; `ModalCancel` configura o "Cancelar" e o arrasto de um modal de formulário |
| `DangerZone` | Zona de exclusão no fim da edição: divisor, título, a consequência em uma frase e o botão `danger` do tamanho do texto, alinhado à esquerda. Sem botão, só explica (ex.: "Você não pode excluir sua própria conta.") |
| `ListFooter` | Rodapé de lista paginada: indicador ao carregar a próxima página ou o erro com "Tentar novamente" |
| `AuthHero`, `AccentRule` | Topo vermelho e traço sob o título das telas de entrada |

## Feedback

- Erro de campo: abaixo do campo, em `danger`, e a linha de base engrossa.
- Erro de envio (API, rede): `Banner` acima dos botões; o formulário continua preenchido.
- Sucesso: `Banner` de sucesso na tela para onde o app volta (`setFlashNotice` / `takeFlashNotice`). Some sozinho depois de 4 s (`useNotice`, com `LayoutAnimation`) e, no iOS, é anunciado ao VoiceOver.
- Erro com conteúdo na tela: `Banner` de erro com botão de fechar, ou com "Tentar novamente" quando a falha foi ao atualizar a lista. Falha ao carregar a próxima página: no rodapé da lista (`ListFooter`), não no topo.
- Informação (ex.: sessão expirada, no login): `Banner` `info`.
- Salvar fica desabilitado enquanto o formulário de edição não tem alteração.
- Exclusão: sempre `Alert.alert` com o botão destrutivo.

## Tela de entrada

Abertura (`welcome.tsx`) e login (`login.tsx`) são as únicas com vermelho como fundo, só no topo (`AuthHero`): anéis translúcidos e um arco na cor do fundo, desenhados com Views, então acompanham o tema sem imagem. A barra de status fica clara.

- Abertura (`brand="large"`): marca "PORTAL" (`meta`, `Tracking.wide`) sobre "FIAP" em 56/800 (40 em topos baixos), ancorada no pé do vermelho, com os anéis em ~45% da altura. Título "Boas-vindas ao Portal FIAP", com espaço inquebrável entre "Portal" e "FIAP", e "Continuar" leva ao login.
- Login (`brand="small"`): "PORTAL FIAP" pequeno no alto, abaixo do voltar, e o botão primário "Entrar" de largura total.
- As duas usam o `AccentRule` sob o título.

## Ícone do app

`assets/icon.png`, `android-icon-*.png` e `favicon.png` são gerados por `scripts/generate-icons.swift` (só AppKit, sem pacote): fundo `#E4002B`, os anéis do `AuthHero` e "FIAP" branco. No `app.json`, `android.adaptiveIcon.backgroundColor` é `#E4002B`.

**Pendência:** a tela de abertura nativa (splash) ainda é a padrão. No SDK 58 ela é configurada pelo plugin `expo-splash-screen`, que não está instalado (a chave `splash` do `app.json` vale só para a web). `assets/splash-icon.png` continua o do template até isso ser feito.

## Acessibilidade

- Todo controle tem rótulo acessível; quando o texto é ambíguo numa lista, o rótulo inclui o item ("Editar Título X", "Excluir email@…").
- Cartões tocáveis levam o essencial no rótulo e a ação na dica, porque dicas podem estar desligadas: postagem "{título}. {autor}, {data}" + "Abre a postagem"; pessoa "{nome}, {e-mail}" + "Abre a edição".
- Ícones são decorativos (`Icon`); o significado vem do texto ou do rótulo.
- Campos de login definem `textContentType` e `autoComplete`; a senha de outra pessoa (cadastro) não é sugerida nem salva; a da própria conta ("Meus dados") pode ser.

## Textos

- Um termo para o conteúdo: "postagem" (a aba se chama Posts). Sem "turmas": o app não tem esse conceito.
- Perfis no masculino genérico, sem "(a)": "Professor", "Estudante", "Administrador", como em "Novo professor".
- Estado vazio: título curto que diz o que falta e uma frase que diz o que fazer ("Nenhuma postagem ainda" / "Quando houver avisos, eles aparecem aqui.").
