// Spotify API 数据类型定义

// Spotify 图片类型
export type SpotifyImage = {
  url: string;
  height?: number;
  width?: number;
};

// Spotify 艺术家类型
export type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
};

// Spotify 专辑类型
export type SpotifyAlbum = {
  id: string;
  name: string;
  images: SpotifyImage[];
};

// Spotify 曲目类型
export type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  uri: string;
};

// Spotify 用户资料类型
export type SpotifyUserProfile = {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  country: string;
  product: string;
  followers: {
    total: number;
  };
};

// Spotify 播放列表类型
export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
};

// Spotify 分页响应类型
export type SpotifyPagingResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
};

// Spotify 播放历史记录项类型
export type SpotifyPlayHistoryItem = {
  track: SpotifyTrack;
  played_at: string;
  context: {
    uri: string;
    type: string;
  } | null;
};

// Spotify 认证令牌响应类型
export type SpotifyTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

// Spotify 推荐曲目响应类型
export type SpotifyRecommendationsResponse = {
  tracks: SpotifyTrack[];
  seeds: Array<{
    id: string;
    type: string;
  }>;
};
