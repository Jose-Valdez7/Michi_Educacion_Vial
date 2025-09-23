import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  // Declarativo: evita navegar antes de que el RootLayout monte
  return <Redirect href="/(auth)/login" />;
}
