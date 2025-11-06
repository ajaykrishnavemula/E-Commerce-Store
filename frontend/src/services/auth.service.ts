import apiService from './api';
import type { AuthResponse, LoginFormData, RegisterFormData, User } from '../types';

class AuthService {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/auth/me');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return await apiService.put<User>('/auth/profile', userData);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/auth/password', { oldPassword, newPassword });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password });
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
export default authService;
