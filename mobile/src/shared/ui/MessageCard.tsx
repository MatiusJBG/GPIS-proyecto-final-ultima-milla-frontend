import type {ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface MessageCardProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly tone?: 'neutral' | 'error';
}

export function MessageCard({title, children, tone = 'neutral'}: MessageCardProps) {
  return (
    <View style={[styles.card, tone === 'error' ? styles.error : styles.neutral]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {borderRadius: 12, gap: 4, padding: 16},
  neutral: {backgroundColor: '#EAF2FF'},
  error: {backgroundColor: '#FDECEC'},
  title: {color: '#172033', fontSize: 16, fontWeight: '700'},
  body: {color: '#334155', fontSize: 14, lineHeight: 20},
});
