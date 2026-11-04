import { useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius } from '@/theme';

export type TextFieldHandle = ComponentRef<typeof TextInput>;

type TextFieldProps = TextInputProps & { label: string; ref?: Ref<TextFieldHandle> };

export function TextField({ label, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.ink300}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
        {...inputProps}
      />
    </View>
  );
}

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
});
