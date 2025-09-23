import { Stack } from 'expo-router';

export default function ColoringLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" />
      <Stack.Screen name="draw" />
      <Stack.Screen name="gallery" />
    </Stack>
  );
}
