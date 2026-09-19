import React from 'react';
import { Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DeleteButton({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={['#821417', '#db7097']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            {
              minHeight: 46,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed || disabled ? 0.7 : 1,
            },
          ]}
        >
          <Text style={textStyle}>{children}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}
