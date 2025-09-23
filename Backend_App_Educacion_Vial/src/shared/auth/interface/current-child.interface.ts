export interface CurrentChild {
  id: string; // ID del usuario
  password: string; // cedula del usuario
  roles: string[]; // Roles del usuario ['admin', 'user']
  iat?: number; // Fecha de creación del token
  exp?: number; // Fecha de expiración del token
}
