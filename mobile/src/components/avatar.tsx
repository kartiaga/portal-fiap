import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { reachableUrl } from '@/lib/api';
import { AvatarSize, Typography } from '@/theme';

type AvatarProps = {
  /** Sem nome, mostra só um ícone genérico. */
  name?: string | null;
  /** Endereço da foto de perfil. Sem ele, ou se não carregar, valem as iniciais. */
  uri?: string | null;
  /** Diâmetro; use `AvatarSize`. */
  size?: number;
  /**
   * `tonal` (padrão): fundo `tintSoft` e iniciais em `tintText`, para listas, onde o vermelho cheio
   * competiria com a ação primária. `solid`: vermelho cheio, só no cartão de identidade da Conta.
   */
  variant?: 'tonal' | 'solid';
};

/** Primeira letra do primeiro e do último nome: "Maria da Silva" vira "MS". */
export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';

  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/** Círculo com a foto de perfil ou, sem ela, as iniciais (ou um ícone, sem nome). Decorativo: o nome vem escrito ao lado. */
export function Avatar({ name, uri, size = AvatarSize.medium, variant = 'tonal' }: AvatarProps) {
  const theme = useTheme();
  // Guarda qual endereço falhou: uma foto nova (outro endereço) ganha outra tentativa.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const large = size >= AvatarSize.large;
  const initials = initialsOf(name);
  const background = variant === 'solid' ? theme.tint : theme.tintSoft;
  const content = variant === 'solid' ? theme.onTint : theme.tintText;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>
      {uri && failedUri !== uri ? (
        <Image
          testID="avatar-photo"
          source={{ uri: reachableUrl(uri) }}
          resizeMode="cover"
          onError={() => setFailedUri(uri)}
          style={{ width: size, height: size }}
        />
      ) : initials === '?' ? (
        <Icon name="person" size={size * 0.5} color={content} />
      ) : (
        <Text
          allowFontScaling={false}
          style={[large ? Typography.title : Typography.label, { color: content }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
