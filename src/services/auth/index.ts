// HiMe OS Authentication and Security Context (Stub)

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: "admin" | "operator" | "guest"
}

export class AuthService {
  private currentUser: UserProfile | null = {
    id: "hime-user-01",
    name: "Ayush",
    email: "ayush@hime.os",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    role: "admin",
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  logout() {
    this.currentUser = null
    console.log("[AuthService] User session invalidated")
  }
}
