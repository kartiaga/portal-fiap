import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, MaxContentWidth, Radius, Spacing, Typography } from '@/theme';

/**
 * Barra de abas própria: superfície clara com cantos superiores arredondados, ícone cheio e rótulo
 * na cor de destaque na aba ativa, ícone de contorno e rótulo cinza nas demais. O ícone vem de
 * `tabBarIcon` e o rótulo de `title`, definidos em cada `Tabs.Screen`. Abas escondidas
 * (`href: null`) não aparecem.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const routes = state.routes.filter((route) => !descriptors[route.key]?.options.hidden);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          paddingBottom: Math.max(insets.bottom, Spacing.two),
        },
      ]}>
      <View role="tablist" style={styles.items}>
        {routes.map((route) => {
          const { options } = descriptors[route.key];
          const focused = state.routes[state.index]?.key === route.key;
          const color = focused ? theme.tint : theme.textSecondary;
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name);

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              role="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}>
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text numberOfLines={1} style={[Typography.label, styles.label, { color }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    borderTopWidth: BorderWidth.thin,
    borderLeftWidth: BorderWidth.thin,
    borderRightWidth: BorderWidth.thin,
    paddingTop: Spacing.two,
  },
  items: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.one,
  },
  label: {
    fontWeight: '500',
  },
});
