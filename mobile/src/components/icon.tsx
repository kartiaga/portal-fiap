import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { IconSize } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
};

/** Ícone decorativo: o significado sempre vem escrito ao lado ou no rótulo acessível do controle. */
export function Icon({ name, size = IconSize.medium, color }: IconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
