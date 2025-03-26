import type { RequestOptions, ResponseData } from "./axios";

import http, { HttpClient } from "./axios";

// 导出 HTTP 相关工具
export { http, HttpClient, type RequestOptions, type ResponseData };

// 默认导出所有工具
export default {
  http,
};
