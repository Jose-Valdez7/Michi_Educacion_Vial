console.log('🧪 [ImagesApi.create] Headers que se enviarán:', {
  ...AuthService.headersWithAuth(accessToken),
  'Content-Type': 'application/json'
});

console.log('🧪 [ImagesApi.create] Request completo:', {
  method: 'POST',
  headers: {
    ...AuthService.headersWithAuth(accessToken),
    'Content-Type': 'application/json',
  },
  body: requestBody,
});
