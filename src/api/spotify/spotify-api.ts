import type { RequestOptions } from "../../utils/axios";
import type {
  SpotifyPagingResponse,
  SpotifyPlayHistoryItem,
  SpotifyPlaylist,
  SpotifyRecommendationsResponse,
  SpotifyTokenResponse,
  SpotifyTrack,
  SpotifyUserProfile,
} from "./types";

import http from "../../utils/axios";

// Spotify API 配置
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Spotify API 访问权限
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "playlist-modify-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-follow-read",
  "user-read-recently-played",
];

// Spotify OAuth 重定向 URI
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`;

// Spotify API 客户端 ID
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

type SpotifyArtist = {
  id: string;
  name: string;
  type: string;
  uri: string;
  // ... 其他艺术家相关字段
};

type SpotifyFollowedArtistsResponse = {
  artists: {
    items: SpotifyArtist[];
    cursors: {
      after: string;
    };
    total: number;
    limit: number;
  };
};

/**
 * Spotify API 服务类
 */
class SpotifyService {
  /**
   * 获取授权 URL
   * @returns 授权 URL 字符串
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(" "),
      state: this.generateState(),
    });

    return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  /**
   * 生成随机状态值
   * @returns 随机字符串
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * 存储令牌到本地存储
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   * @param expiresIn 过期时间（秒）
   * @returns 存储是否成功
   */
  storeTokens(accessToken: string, refreshToken: string, expiresIn: number): boolean {
    try {
      if (!accessToken || !refreshToken) {
        console.error("令牌无效，无法存储", { accessToken: !!accessToken, refreshToken: !!refreshToken });
        return false;
      }

      // 先尝试清除旧令牌
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_token_expiration");

      // 存储新令牌
      localStorage.setItem("spotify_access_token", accessToken);
      localStorage.setItem("spotify_refresh_token", refreshToken);

      // 计算过期时间
      const expirationTime = Date.now() + expiresIn * 1000;
      localStorage.setItem("spotify_token_expiration", expirationTime.toString());
      return true;
    }
    catch (error) {
      console.error("存储令牌时发生错误:", error);
      return false;
    }
  }

  /**
   * 从授权码获取令牌
   * @param code 授权码
   * @returns 令牌获取结果
   */
  async getTokensFromCode(code: string): Promise<{ success: boolean; accessToken?: string; error?: any }> {
    try {
      const response = await http.post<SpotifyTokenResponse>(
        TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          },
        },
      );

      const { access_token, refresh_token, expires_in } = response;

      if (!access_token || !refresh_token || !expires_in) {
        console.error("Spotify API 返回的令牌数据不完整:", {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          hasExpiresIn: !!expires_in,
        });
        return { success: false, error: "Incomplete token data" };
      }

      const storeResult = this.storeTokens(access_token, refresh_token, expires_in);

      if (!storeResult) {
        console.error("令牌存储失败");
        return { success: false, error: "Failed to store tokens" };
      }

      return { accessToken: access_token, success: true };
    }
    catch (error) {
      console.error("获取令牌时出错:", error);
      return { success: false, error };
    }
  }

  /**
   * 获取有效的访问令牌，如果已过期则刷新
   * @returns 有效的访问令牌或 null
   */
  async getValidToken(): Promise<string | null> {
    const accessToken = localStorage.getItem("spotify_access_token");
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const expiration = localStorage.getItem("spotify_token_expiration");

    // 如果没有存储令牌，则未认证
    if (!accessToken || !refreshToken || !expiration) {
      return null;
    }

    // 检查令牌是否过期
    const isExpired = Date.now() > Number(expiration);

    // 如果未过期，返回当前令牌
    if (!isExpired) {
      return accessToken;
    }

    // 如果过期，刷新令牌
    try {
      const response = await http.post<SpotifyTokenResponse>(
        TOKEN_ENDPOINT,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token, expires_in } = response;
      // 保存新令牌和过期时间（刷新令牌通常保持不变）
      const newRefreshToken = response.refresh_token || refreshToken;

      this.storeTokens(access_token, newRefreshToken, expires_in);

      return access_token;
    }
    catch (error) {
      console.error("刷新令牌时出错:", error);
      // 清除无效令牌
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_token_expiration");

      return null;
    }
  }

  /**
   * 获取授权头部
   * @returns 授权头部或空对象
   */
  private async getAuthHeader(): Promise<Record<string, string> | Record<string, never>> {
    const token = await this.getValidToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * 创建 API 请求配置
   * @param options 请求选项
   * @returns 包含授权头的请求配置
   */
  private async createRequestConfig(options: RequestOptions = {}): Promise<RequestOptions> {
    const headers = await this.getAuthHeader();

    return {
      ...options,
      headers: {
        ...options.headers,
        ...headers,
      },
    };
  }

  /**
   * 检查认证状态
   * @throws 如果未认证则抛出错误
   */
  private async checkAuth(): Promise<void> {
    const token = await this.getValidToken();

    if (!token) {
      throw new Error("Not authenticated");
    }
  }

  /**
   * 获取用户资料
   * @returns 用户资料
   */
  async getUserProfile(): Promise<SpotifyUserProfile> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyUserProfile>(`${SPOTIFY_API_URL}/me`, undefined, config);
  }

  /**
   * 获取用户热门曲目
   * @param timeRange 时间范围：short_term（4周）、medium_term（6个月）、long_term（数年）
   * @param limit 结果数量限制
   * @returns 用户热门曲目
   */
  async getTopTracks(timeRange = "medium_term", limit = 20): Promise<SpotifyPagingResponse<SpotifyTrack>> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyPagingResponse<SpotifyTrack>>(
      `${SPOTIFY_API_URL}/me/top/tracks`,
      { time_range: timeRange, limit },
      config,
    );
  }

  /**
   * 获取用户热门艺术家
   * @param timeRange 时间范围：short_term（4周）、medium_term（6个月）、long_term（数年）
   * @param limit 结果数量限制
   * @returns 用户热门艺术家
   */
  async getTopArtists(timeRange = "medium_term", limit = 20): Promise<SpotifyPagingResponse<SpotifyTrack>> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyPagingResponse<SpotifyTrack>>(
      `${SPOTIFY_API_URL}/me/top/artists`,
      { time_range: timeRange, limit },
      config,
    );
  }

  /**
   * 创建新播放列表
   * @param name 播放列表名称
   * @param description 播放列表描述
   * @param isPublic 是否公开
   * @returns 创建的播放列表
   */
  async createPlaylist(name: string, description: string, isPublic = false): Promise<SpotifyPlaylist> {
    await this.checkAuth();
    const user = await this.getUserProfile();
    const config = await this.createRequestConfig();

    return http.post<SpotifyPlaylist>(
      `${SPOTIFY_API_URL}/users/${user.id}/playlists`,
      {
        name,
        description,
        public: isPublic,
      },
      config,
    );
  }

  /**
   * 添加曲目到播放列表
   * @param playlistId 播放列表 ID
   * @param trackUris 曲目 URI 数组
   * @returns 添加曲目的结果
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<any> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.post(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      {
        uris: trackUris,
      },
      config,
    );
  }

  /**
   * 获取基于种子曲目的推荐
   * @param seedTracks 种子曲目 ID 数组
   * @param limit 结果数量限制
   * @returns 推荐曲目
   */
  async getRecommendations(seedTracks: string[], limit = 20): Promise<SpotifyRecommendationsResponse> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyRecommendationsResponse>(
      `${SPOTIFY_API_URL}/recommendations`,
      { seed_tracks: seedTracks.join(","), limit },
      config,
    );
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    const accessToken = localStorage.getItem("spotify_access_token");
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const expiration = localStorage.getItem("spotify_token_expiration");

    return !!accessToken && !!refreshToken && !!expiration;
  }

  /**
   * 用户登录
   * @returns 登录结果
   */
  async login(): Promise<void> {
    window.location.href = this.getAuthUrl();
  }

  /**
   * 处理回调，从 URL 解析授权码并获取令牌
   * @returns 处理结果
   */
  async handleCallback(): Promise<{ success: boolean; error?: any }> {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const result = await this.getTokensFromCode(code);
      return { success: result.success, error: result.error };
    }

    return { success: false, error: "No authorization code found" };
  }

  /**
   * 用户登出
   */
  logout(): void {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiration");
  }

  /**
   * 搜索曲目
   * @param query 搜索查询
   * @param limit 结果数量限制
   * @returns 搜索结果
   */
  async searchTracks(query: string, limit = 10): Promise<SpotifyPagingResponse<SpotifyTrack>> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyPagingResponse<SpotifyTrack>>(
      `${SPOTIFY_API_URL}/search`,
      { q: query, type: "track", limit },
      config,
    );
  }

  /**
   * 获取最近播放的曲目
   * @param limit 结果数量限制
   * @returns 最近播放的曲目
   */
  async getMyRecentlyPlayedTracks(limit = 20): Promise<SpotifyPagingResponse<SpotifyPlayHistoryItem>> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyPagingResponse<SpotifyPlayHistoryItem>>(
      `${SPOTIFY_API_URL}/me/player/recently-played`,
      { limit },
      config,
    );
  }

  /**
   * 获取已保存的曲目
   * @param limit 结果数量限制
   * @returns 已保存的曲目
   */
  async getMySavedTracks(limit = 20, offset = 1): Promise<SpotifyPagingResponse<{ track: SpotifyTrack }>> {
    await this.checkAuth();
    const config = await this.createRequestConfig();
    return http.get<SpotifyPagingResponse<{ track: SpotifyTrack }>>(
      `${SPOTIFY_API_URL}/me/tracks`,
      { limit, offset },
      config,
    );
  }

  /**
   * 获取关注的艺术家
   * @param limit 结果数量限制
   * @returns 关注的艺术家
   */
  async getFollowedArtists(limit = 20): Promise<SpotifyFollowedArtistsResponse> {
    await this.checkAuth();
    const config = await this.createRequestConfig();

    return http.get<SpotifyFollowedArtistsResponse>(
      `${SPOTIFY_API_URL}/me/following`,
      { type: "artist", limit },
      config,
    );
  }
}

// 创建并导出 Spotify 服务实例
const spotifyService = new SpotifyService();
export default spotifyService;
