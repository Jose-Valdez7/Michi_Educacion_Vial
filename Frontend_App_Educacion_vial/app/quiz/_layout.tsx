import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="learning" />
      <Stack.Screen name="play" />
    </Stack>
  );
}
