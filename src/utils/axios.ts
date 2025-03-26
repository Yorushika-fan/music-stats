import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import axios from "axios";

// 响应数据接口
export type ResponseData<T = any> = {
  data: T;
  code?: number;
  message?: string;
};

// 请求配置接口扩展
export type RequestOptions = AxiosRequestConfig & {
  // 是否直接返回原始响应（不处理包装的数据结构）
  isReturnNativeResponse?: boolean;
  // 是否显示错误信息
  showErrorMessage?: boolean;
};

// 默认配置
const DEFAULT_OPTIONS: RequestOptions = {
  timeout: 10000,
  showErrorMessage: true,
};

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(config: AxiosRequestConfig = {}) {
    this.axiosInstance = axios.create({
      ...DEFAULT_OPTIONS,
      ...config,
    });

    this.setupInterceptors();
  }

  // 设置拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 可以在这里添加全局请求头，如 token 等
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // 统一处理错误
        if (error.response) {
          const { status } = error.response;

          // 根据不同状态码处理不同错误
          switch (status) {
            case 401:
              // 未授权处理
              console.error("未授权或授权已过期");
              break;
            case 403:
              console.error("拒绝访问");
              break;
            case 404:
              console.error("请求的资源不存在");
              break;
            case 500:
              console.error("服务器错误");
              break;
            default:
              console.error(`请求错误: ${status}`);
          }
        }
        else if (error.request) {
          // 请求发出但未收到响应
          console.error("网络错误，请检查您的网络连接");
        }
        else {
          // 请求设置中出现错误
          console.error("请求配置错误:", error.message);
        }

        return Promise.reject(error);
      },
    );
  }

  // 处理响应数据
  private handleResponse<T>(response: AxiosResponse, options: RequestOptions): T {
    if (options.isReturnNativeResponse) {
      return response as unknown as T;
    }

    return response.data;
  }

  // GET 请求
  public get<T = any>(url: string, params?: any, options: RequestOptions = {}): Promise<T> {
    return this.axiosInstance
      .get(url, { params, ...options })
      .then(response => this.handleResponse<T>(response, options))
      .catch((error) => {
        if (options.showErrorMessage !== false) {
          // 可以集成全局消息提示
        }
        return Promise.reject(error);
      });
  }

  // POST 请求
  public post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.axiosInstance
      .post(url, data, options)
      .then(response => this.handleResponse<T>(response, options))
      .catch((error) => {
        if (options.showErrorMessage !== false) {
          // 可以集成全局消息提示
        }
        return Promise.reject(error);
      });
  }

  // PUT 请求
  public put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.axiosInstance
      .put(url, data, options)
      .then(response => this.handleResponse<T>(response, options))
      .catch((error) => {
        if (options.showErrorMessage !== false) {
          // 可以集成全局消息提示
        }
        return Promise.reject(error);
      });
  }

  // DELETE 请求
  public delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.axiosInstance
      .delete(url, options)
      .then(response => this.handleResponse<T>(response, options))
      .catch((error) => {
        if (options.showErrorMessage !== false) {
          // 可以集成全局消息提示
        }
        return Promise.reject(error);
      });
  }

  // 自定义实例方法
  public setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  // 清除特定请求头
  public removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }
}

// 创建默认实例
const http = new HttpClient();

export { HttpClient };
export default http;
