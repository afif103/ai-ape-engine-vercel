import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response caching
    this.client.interceptors.response.use(
      (response) => {
        // Cache GET requests
        if (response.config.method?.toLowerCase() === 'get') {
          const cacheKey = this.getCacheKey(response.config);
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
        return response;
      },
      (error) => Promise.reject(error)
    );

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear it
          this.clearToken();
          // Could redirect to login here
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getCacheKey(config: any): string {
    return `${config.method?.toUpperCase()}_${config.url}`;
  }

  private getCachedResponse(cacheKey: string) {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(cacheKey);
    return null;
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  }

  async register(email: string, password: string, name?: string) {
    const response = await this.client.post('/auth/register', { email, password, name });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Direct API call method for custom endpoints
  async makeRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) {
    const config: any = {};
    if (data && (method === 'post' || method === 'put')) {
      config.data = data;
    }

    switch (method) {
      case 'get':
        return this.client.get(url, config);
      case 'post':
        return this.client.post(url, data, config);
      case 'put':
        return this.client.put(url, data, config);
      case 'delete':
        return this.client.delete(url, config);
    }
  }

  // Chat API
  async createConversation(title?: string) {
    return this.client.post('/chat/conversations', { title });
  }

  async getConversations(limit = 50, offset = 0) {
    const cacheKey = `GET_/chat/conversations?limit=${limit}&offset=${offset}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      return { data: cached };
    }
    return this.client.get(`/chat/conversations?limit=${limit}&offset=${offset}`);
  }

  async getConversation(conversationId: string) {
    return this.client.get(`/chat/conversations/${conversationId}`);
  }

  async sendMessage(conversationId: string, content: string, stream: boolean = false) {
    if (stream) {
      return this.client.post(`/chat/conversations/${conversationId}/messages?stream=true`, { content });
    }
    return this.client.post(`/chat/conversations/${conversationId}/messages`, { content });
  }

  async streamMessage(conversationId: string, content: string) {
    const response = await fetch(`${this.client.defaults.baseURL}/chat/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Streaming failed');
    }

    return response.body?.getReader();
  }

  async deleteConversation(conversationId: string) {
    return this.client.delete(`/chat/conversations/${conversationId}`);
  }

  async uploadFile(formData: FormData) {
    return this.client.post('/research/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Code Assistant API
  async generateCode(description: string, language = 'python', context?: string) {
    return this.client.post('/code/generate', { description, language, context });
  }

  async reviewCode(code: string, language = 'python', focus?: string) {
    return this.client.post('/code/review', { code, language, focus });
  }

  async explainCode(code: string, language = 'python', level: 'beginner' | 'intermediate' | 'advanced' = 'beginner') {
    return this.client.post('/code/explain', { code, language, level });
  }

  async fixCode(code: string, error: string, language = 'python') {
    return this.client.post('/code/fix', { code, error, language });
  }

  // Research API
  async scrapeUrl(url: string) {
    return this.client.post('/research/scrape', { url });
  }

  async researchTopic(query: string, urls?: string[], maxSources = 5) {
    return this.client.post('/research/topic', { query, urls, max_sources: maxSources });
  }

  // Extraction API
  async extractData(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/extraction/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Export API
  async exportData(data: any, format: 'csv' | 'json' | 'excel' | 'xml' | 'html') {
    const response = await this.client.post(`/export/${format}`, data, {
      responseType: 'blob', // Important for file downloads
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Set filename based on format
    const extensions = {
      csv: 'csv',
      json: 'json',
      excel: 'xlsx',
      xml: 'xml',
      html: 'html'
    };

    link.setAttribute('download', `export.${extensions[format]}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;