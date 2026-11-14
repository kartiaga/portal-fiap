import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { SelfBadge } from '@/components/badge';
import { useTheme } from '@/hooks/use-theme';
import { AvatarSize, Spacing, Typography } from '@/theme';

/** Acima desta escala de fonte a data não cabe ao lado do autor e desce para a linha de baixo. */
const STACK_FONT_SCALE = 1.3;

type PostMetaProps = {
  authorName: string | null | undefined;
  /** Data já formatada ("Hoje", "13/09/2026"). Vazia, não aparece. */
  date: string;
  /** Palavra antes da data, como "Editada". Fica na fonte do sistema; o mono é só do número. */
  datePrefix?: string;
  /** Marca a postagem como do usuário conectado com o selo "Você". */
  isSelf?: boolean;
};

/** Cabeçalho dos cartões de postagem: avatar, autor, selo "Você" e data. Igual no Feed e em Gerenciar. */
export function PostMeta({ authorName, date, datePrefix, isSelf = false }: PostMetaProps) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale > STACK_FONT_SCALE;
  const author = authorName || 'Autor não informado';

  const dateText = date ? (
    <Text style={[Typography.meta, { color: theme.textSecondary }]}>
      {datePrefix ? <Text style={styles.prefix}>{`${datePrefix} `}</Text> : null}
      {date}
    </Text>
  ) : null;

  return (
    <View style={styles.row}>
      <Avatar name={authorName} size={AvatarSize.small} />
      <View style={[styles.main, stacked && styles.mainStacked]}>
        <View style={styles.authorRow}>
          <Text
            numberOfLines={1}
            style={[Typography.label, styles.author, { color: theme.textSecondary }]}>
            {author}
          </Text>
          {isSelf ? <SelfBadge /> : null}
        </View>
        {dateText}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mainStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  authorRow: {
    flexShrink: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  author: {
    flexShrink: 1,
  },
  prefix: {
    // Mesmo tamanho do `meta`, mas sem a fonte monoespaçada: ela é só para o número.
    // `undefined` não sobrescreve a fonte herdada do texto pai, por isso o nome explícito.
    fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
  },
});
