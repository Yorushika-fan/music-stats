import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type {
  SpotifyArtist,
  SpotifyTrack,
} from "../../api/spotify/types";

import spotifyService from "../../api/spotify/spotify-api";
import { Skeleton } from "../../components/ui/skeleton";
import useI18n from "../../hooks/use-i18n";

function Stats() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"short" | "medium" | "long">("medium");
  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "artists">("overview");
  const [overviewTab, setOverviewTab] = useState<"genre" | "popular">(() => {
    const saved = localStorage.getItem("statsOverviewTab");
    return (saved === "genre" || saved === "popular") ? saved : "genre";
  });

  // 检查用户是否已登录
  useEffect(() => {
    const loggedIn = spotifyService.isLoggedIn();
    if (!loggedIn) {
      navigate("/auth/login");
    }
  }, [navigate]);

  // 数据和加载状态
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [genreDistribution, setGenreDistribution] = useState<{ [key: string]: number }>({});
  const [stats, setStats] = useState({
    listeningTime: 0,
    totalTracks: 0,
    totalArtists: 0,
  });
  const [loading, setLoading] = useState(true);

  // 将时间范围转换为Spotify API参数
  const getTimeRangeParam = () => {
    switch (timeRange) {
      case "short": return "short_term"; // 4周
      case "medium": return "medium_term"; // 6个月
      case "long": return "long_term"; // 所有时间
    }
  };

  // 获取Spotify数据
  useEffect(() => {
    // 如果未登录，不执行数据获取
    if (!spotifyService.isLoggedIn())
      return;

    const fetchSpotifyData = async () => {
      setLoading(true);

      try {
        // 获取用户热门曲目
        const tracksResponse = await spotifyService.getTopTracks(getTimeRangeParam(), 50);

        if (tracksResponse) {
          setTopTracks(tracksResponse.items.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artist: track.artists.map((artist: SpotifyArtist) => artist.name).join(", "),
            album: track.album.name,
            image: track.album.images[0]?.url,
          })));
        }

        // 获取用户热门艺术家
        const artistsResponse = await spotifyService.getTopArtists(getTimeRangeParam(), 50);

        if (artistsResponse) {
          setTopArtists(artistsResponse.items.map((artist: SpotifyArtist) => ({
            id: artist.id,
            name: artist.name,
            genre: artist.genres?.[0] || t("stats.genreUnknown"),
            image: artist.images?.[0]?.url,
          })));

          // 计算流派分布
          const genreCounts: Record<string, number> = {};
          artistsResponse.items.forEach((artist: SpotifyArtist) => {
            artist.genres?.forEach((genre: string) => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          });
          setGenreDistribution(genreCounts);
        }

        // 获取用户统计数据
        const [recentlyPlayed, savedTracks, followedArtists] = await Promise.all([
          spotifyService.getMyRecentlyPlayedTracks(50),
          spotifyService.getMySavedTracks(1),
          spotifyService.getFollowedArtists(1),
        ]);

        console.log("savedTracks", savedTracks);
        // 计算统计数据
        if (recentlyPlayed && savedTracks && followedArtists) {
          // 假设每首歌3分钟
          const estimatedHours = Math.round((recentlyPlayed.items.length * 3) / 60);

          setStats({
            listeningTime: estimatedHours,
            totalTracks: savedTracks.total,
            totalArtists: followedArtists.artists.total,
          });
        }
      }
      catch (error) {
        console.error("Error fetching Spotify data:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
  }, [timeRange, t, navigate]);

  // 当 tab 改变时保存到 localStorage
  useEffect(() => {
    localStorage.setItem("statsOverviewTab", overviewTab);
  }, [overviewTab]);

  // 时间范围选择器组件
  const TimeRangeSelector = () => (
    <div className="flex items-center space-x-4 mb-6">
      <button
        onClick={() => setTimeRange("short")}
        className={`px-4 py-2 rounded-lg ${
          timeRange === "short"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {t("stats.timeRange.short")}
      </button>
      <button
        onClick={() => setTimeRange("medium")}
        className={`px-4 py-2 rounded-lg ${
          timeRange === "medium"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {t("stats.timeRange.medium")}
      </button>
      <button
        onClick={() => setTimeRange("long")}
        className={`px-4 py-2 rounded-lg ${
          timeRange === "long"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {t("stats.timeRange.long")}
      </button>
    </div>
  );

  // 骨架屏组件
  const StatsCardSkeleton = () => (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-10 w-20 mt-2" />
    </div>
  );

  const TrackSkeleton = () => (
    <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center">
      <Skeleton className="h-12 w-12 rounded mr-3" />
      <div className="w-full">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );

  const ArtistSkeleton = () => (
    <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center">
      <Skeleton className="h-12 w-12 rounded-full mr-3" />
      <div className="w-full">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );

  // 添加新的骨架屏组件
  const GenreChartSkeleton = () => (
    <div className="relative h-80 w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );

  const PopularContentSkeleton = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          <TrackSkeleton />
          <TrackSkeleton />
          <TrackSkeleton />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          <ArtistSkeleton />
          <ArtistSkeleton />
          <ArtistSkeleton />
        </div>
      </div>
    </div>
  );

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    const { t } = useTranslation();
    const isDark = document.documentElement.classList.contains("dark");

    if (active && payload && payload.length) {
      return (
        <div
          className={`rounded-lg border p-2 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-500">
            {t("stats.percentage", { value: payload[0].value })}
          </p>
        </div>
      );
    }
    return null;
  };

  // 渲染不同的内容区域
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("stats.overview")}
            </h2>

            <TimeRangeSelector />

            {/* 总体概览仪表盘 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <>
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </>
              ) : (
                <>
                  {/* 收听时间卡片 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t("stats.listeningTime")}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.listeningTime}
                      h
                    </p>
                  </div>

                  {/* 歌曲数量卡片 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t("stats.totalTracks")}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.totalTracks}
                    </p>
                  </div>

                  {/* 艺术家数量卡片 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t("stats.totalArtists")}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.totalArtists}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 将流派分布和热门内容整合到一个容器中 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {overviewTab === "genre" ? t("stats.genreDistribution") : t("stats.popularContent")}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setOverviewTab("genre")}
                    className={`px-4 py-2 rounded-lg ${
                      overviewTab === "genre"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t("stats.genreDistribution")}
                  </button>
                  <button
                    onClick={() => setOverviewTab("popular")}
                    className={`px-4 py-2 rounded-lg ${
                      overviewTab === "popular"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t("stats.popularContent")}
                  </button>
                </div>
              </div>

              {overviewTab === "genre" ? (
                <div className="h-80 rounded-md">
                  {loading ? (
                    <GenreChartSkeleton />
                  ) : (
                    <div className="relative h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(genreDistribution)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 10)
                              .map(([name, value]) => ({
                                name,
                                value,
                              }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {Object.entries(genreDistribution)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 10)
                              .map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                loading ? (
                  <PopularContentSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* 热门曲目预览 */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("stats.topTracks")}
                        </h4>
                        <button
                          onClick={() => setActiveTab("tracks")}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {t("common.viewAll")}
                        </button>
                      </div>
                      <div className="space-y-4">
                        {topTracks.slice(0, 3).map(track => (
                          <div
                            key={track.id}
                            className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center"
                          >
                            {track.image
                              ? (
                                  <img src={track.image} alt={track.name} className="w-12 h-12 rounded mr-3" />
                                )
                              : (
                                  <div className="w-12 h-12 rounded mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-500 dark:text-gray-400">🎵</span>
                                  </div>
                                )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{track.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {track.artist}
                                {" "}
                                •
                                {track.album}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 热门艺术家预览 */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("stats.topArtists")}
                        </h4>
                        <button
                          onClick={() => setActiveTab("artists")}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {t("common.viewAll")}
                        </button>
                      </div>
                      <div className="space-y-4">
                        {topArtists.slice(0, 3).map(artist => (
                          <div
                            key={artist.id}
                            className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center"
                          >
                            {artist.image
                              ? (
                                  <img src={artist.image} alt={artist.name} className="w-12 h-12 rounded-full mr-3" />
                                )
                              : (
                                  <div className="w-12 h-12 rounded-full mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-500 dark:text-gray-400">👤</span>
                                  </div>
                                )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{artist.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{artist.genre}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "tracks":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("stats.topTracks")}
            </h2>

            <TimeRangeSelector />

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-4">
                {loading
                  ? (
                      Array.from({ length: 10 }).fill(0).map((_, index) => (
                        <TrackSkeleton key={index} />
                      ))
                    )
                  : (
                      topTracks.map(track => (
                        <div
                          key={track.id}
                          className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center"
                        >
                          {track.image
                            ? (
                                <img src={track.image} alt={track.name} className="w-12 h-12 rounded mr-3" />
                              )
                            : (
                                <div className="w-12 h-12 rounded mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-400">🎵</span>
                                </div>
                              )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{track.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {track.artist}
                              {" "}
                              •
                              {track.album}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
              </div>
            </div>
          </div>
        );

      case "artists":
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("stats.topArtists")}
            </h2>

            <TimeRangeSelector />

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-4">
                {loading
                  ? (
                      Array.from({ length: 10 }).fill(0).map((_, index) => (
                        <ArtistSkeleton key={index} />
                      ))
                    )
                  : (
                      topArtists.map(artist => (
                        <div
                          key={artist.id}
                          className="p-3 bg-gray-50 rounded-md dark:bg-gray-700 flex items-center"
                        >
                          {artist.image
                            ? (
                                <img src={artist.image} alt={artist.name} className="w-12 h-12 rounded-full mr-3" />
                              )
                            : (
                                <div className="w-12 h-12 rounded-full mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-400">👤</span>
                                </div>
                              )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{artist.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{artist.genre}</div>
                          </div>
                        </div>
                      ))
                    )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          {t("stats.title")}
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧导航 */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "overview"
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100 text-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="ml-3">{t("stats.overview")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("tracks")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "tracks"
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100 text-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="ml-3">{t("stats.topTracks")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("artists")}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "artists"
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100 text-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="ml-3">{t("stats.topArtists")}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
