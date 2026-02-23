import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { FONT_BODY, FONT_HEADING, FONT_SIZE_BODY, FONT_SIZE_TITLE, FONT_SIZE_SECTION, LINE_HEIGHT_BODY } from '@/constants/typography';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: FONT_BODY,
    fontSize: FONT_SIZE_BODY,
    lineHeight: LINE_HEIGHT_BODY,
  },
  defaultSemiBold: {
    fontFamily: FONT_BODY,
    fontSize: FONT_SIZE_BODY,
    lineHeight: LINE_HEIGHT_BODY,
    fontWeight: '600',
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_TITLE,
    lineHeight: FONT_SIZE_TITLE + 4,
  },
  subtitle: {
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_SECTION,
  },
  link: {
    fontFamily: FONT_BODY,
    fontSize: FONT_SIZE_BODY,
    lineHeight: 24,
    color: '#0a7ea4',
  },
});
