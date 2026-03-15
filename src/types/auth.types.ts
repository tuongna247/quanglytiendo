export interface User {
  id: string
  username: string
  displayName: string
  passwordHash: string
  avatarColor?: string
  createdAt: string
}

export interface Session {
  userId: string
  username: string
  displayName: string
  avatarColor?: string
  expiresAt: string
}
