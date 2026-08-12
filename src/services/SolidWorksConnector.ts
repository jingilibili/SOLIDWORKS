// SOLIDWORKS Connection Manager
import axios, { AxiosInstance } from 'axios';

export interface SolidWorksAPIConfig {
  apiUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface ModelData {
  id: string;
  name: string;
  geometry: object;
  metadata: object;
}

export interface ConnectionStatus {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  timestamp: Date;
}

export class SolidWorksConnector {
  private client: AxiosInstance;
  private config: SolidWorksAPIConfig;
  private connectionStatus: ConnectionStatus;
  private retryCount: number = 0;

  constructor(config: Partial<SolidWorksAPIConfig> = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:3000/api/solidworks',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.connectionStatus = {
      connected: false,
      status: 'disconnected',
      message: 'اتصال برقرار نشده است',
      timestamp: new Date(),
    };
  }

  /**
   * بررسی اتصال به سرور SOLIDWORKS
   */
  async checkConnection(): Promise<ConnectionStatus> {
    try {
      const response = await this.client.get('/health');

      if (response.status === 200) {
        this.connectionStatus = {
          connected: true,
          status: 'connected',
          message: 'اتصال موفق - سرور SOLIDWORKS آنلاین است',
          timestamp: new Date(),
        };
        this.retryCount = 0;
        console.log('✅ SOLIDWORKS Connection Status:', this.connectionStatus.message);
        return this.connectionStatus;
      }
    } catch (error: any) {
      this.handleConnectionError(error);
    }

    return this.connectionStatus;
  }

  /**
   * ارسال درخواست به SOLIDWORKS برای دریافت مدل
   */
  async getModelData(modelId: string): Promise<ModelData | null> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.get(`/models/${modelId}`);

      if (response.status === 200) {
        console.log(`📦 Model "${modelId}" دریافت شد`);
        return response.data;
      }
    } catch (error: any) {
      console.error(`❌ خطا در دریافت مدل: ${error.message}`);
      await this.retryRequest(() => this.getModelData(modelId));
    }

    return null;
  }

  /**
   * ارسال تغییرات کابینت به SOLIDWORKS
   */
  async updateCabinetLayout(layoutData: object): Promise<boolean> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.post('/cabinet/update', {
        layout: layoutData,
        timestamp: new Date().toISOString(),
      });

      if (response.status === 200) {
        console.log('✅ تغییرات کابینت به SOLIDWORKS ارسال شد');
        return true;
      }
    } catch (error: any) {
      console.error(`❌ خطا در ارسال تغییرات: ${error.message}`);
      await this.retryRequest(() => this.updateCabinetLayout(layoutData));
    }

    return false;
  }

  /**
   * درخواست تولید Cut List از SOLIDWORKS
   */
  async generateCutList(cabinetId: string): Promise<object | null> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.post('/cabinet/cut-list', {
        cabinetId,
      });

      if (response.status === 200) {
        console.log(`📋 Cut List برای کابینت "${cabinetId}" تولید شد`);
        return response.data;
      }
    } catch (error: any) {
      console.error(`❌ خطا در تولید Cut List: ${error.message}`);
    }

    return null;
  }

  /**
   * درخواست صادرات 3D Model
   */
  async export3DModel(modelId: string, format: 'step' | 'stl' | 'iges' = 'step'): Promise<Blob | null> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.get(`/export/${modelId}`, {
        params: { format },
        responseType: 'blob',
      });

      if (response.status === 200) {
        console.log(`✅ مدل به فرمت ${format.toUpperCase()} صادر شد`);
        return response.data as Blob;
      }
    } catch (error: any) {
      console.error(`❌ خطا در صادرات: ${error.message}`);
    }

    return null;
  }

  /**
   * دریافت لیست یونیت‌های کابینت موجود
   */
  async getCabinetUnits(): Promise<object[] | null> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.get('/cabinet/units');

      if (response.status === 200) {
        console.log(`📦 ${response.data.length} یونیت کابینت دریافت شد`);
        return response.data;
      }
    } catch (error: any) {
      console.error(`❌ خطا در دریافت یونیت‌ها: ${error.message}`);
    }

    return null;
  }

  /**
   * درخواست شبیه‌سازی (Simulation) برای کابینت
   */
  async runSimulation(cabinetId: string, simulationType: 'stress' | 'thermal' | 'dynamic'): Promise<object | null> {
    try {
      if (!this.connectionStatus.connected) {
        await this.checkConnection();
      }

      const response = await this.client.post('/cabinet/simulate', {
        cabinetId,
        type: simulationType,
      });

      if (response.status === 200) {
        console.log(`✅ شبیه‌سازی "${simulationType}" برای کابینت "${cabinetId}" انجام شد`);
        return response.data;
      }
    } catch (error: any) {
      console.error(`❌ خطا در شبیه‌سازی: ${error.message}`);
    }

    return null;
  }

  /**
   * مدیریت خطاهای اتصال و تکرار درخواست
   */
  private async retryRequest(
    requestFn: () => Promise<any>,
    attempt: number = 1
  ): Promise<any> {
    if (attempt <= this.config.retryAttempts) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`🔄 تلاش مجدد ${attempt} از ${this.config.retryAttempts} بعد از ${delay}ms...`);

      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        return await requestFn();
      } catch (error) {
        return this.retryRequest(requestFn, attempt + 1);
      }
    }

    console.error(`❌ درخواست بعد از ${this.config.retryAttempts} تلاش ناموفق بود`);
    return null;
  }

  /**
   * مدیریت خطاهای اتصال
   */
  private handleConnectionError(error: any): void {
    let errorMessage = 'خطای نامشخص';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'سرور SOLIDWORKS در دسترس نیست - لطفاً سرور را راه‌اندازی کنید';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'آدرس سرور SOLIDWORKS یافت نشد';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'زمان اتصال به سرور تمام شد';
    } else if (error.response?.status === 401) {
      errorMessage = 'خطای احراز هویت - API Key نامعتبر';
    } else if (error.response?.status === 403) {
      errorMessage = 'دسترسی غیرمجاز';
    } else if (error.response?.status === 500) {
      errorMessage = 'خطای داخلی سرور SOLIDWORKS';
    } else {
      errorMessage = error.message || 'خطای نامشخص';
    }

    this.connectionStatus = {
      connected: false,
      status: 'error',
      message: errorMessage,
      timestamp: new Date(),
    };

    console.error('❌ SOLIDWORKS Connection Error:', this.connectionStatus.message);
  }

  /**
   * دریافت وضعیت فعلی اتصال
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * قطع اتصال و پاکسازی منابع
   */
  disconnect(): void {
    this.connectionStatus = {
      connected: false,
      status: 'disconnected',
      message: 'اتصال قطع شد',
      timestamp: new Date(),
    };
    console.log('🔌 SOLIDWORKS Connection Closed');
  }
}

// Export Singleton Instance
export const solidWorksConnector = new SolidWorksConnector({
  apiUrl: process.env.REACT_APP_SOLIDWORKS_API_URL || 'http://localhost:3000/api/solidworks',
});
