import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius } from '@/theme';

export type TextFieldHandle = ComponentRef<typeof TextInput>;

type TextFieldProps = TextInputProps & { label: string; ref?: Ref<TextFieldHandle> };

export function TextField({ label, secureTextEntry = false, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.ink300}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            focused && styles.inputFocused,
            secureTextEntry && styles.inputWithToggle,
          ]}
          secureTextEntry={secureTextEntry && !revealed}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${revealed ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
            onPress={() => setRevealed((current) => !current)}
            style={styles.toggle}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.ink500}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const TOGGLE_SIZE = 48;

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.ink900,
    backgroundColor: colors.paper000,
    borderWidth: 1,
    borderColor: colors.ink100,
    borderRadius: radius.s,
  },
  inputFocused: { borderColor: colors.red600 },
  inputWithToggle: { paddingRight: TOGGLE_SIZE },
  toggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
