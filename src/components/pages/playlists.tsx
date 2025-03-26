import { useState } from "react";

import useI18n from "../../hooks/use-i18n";

function Playlists() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  // 占位数据
  const songs = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: `Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
  }));

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-screen-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
          {t("playlist.title")}
        </h1>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400 max-w-3xl">
          {t("playlist.description")}
        </p>

        {/* 搜索表单 */}
        <div className="mb-12 max-w-lg">
          <form className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="song-search" className="sr-only">
                {t("playlist.songName")}
              </label>
              <input
                type="text"
                id="song-search"
                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t("playlist.songName")}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none"
            >
              {t("playlist.generate")}
            </button>
          </form>
        </div>

        {/* 歌曲列表 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("stats.topTracks")}
            </h2>
          </div>
          <div className="p-5">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {songs.map(song => (
                <li key={song.id} className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {song.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {song.artist}
                        {" "}
                        •
                        {song.album}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      {t("playlist.addToPlaylist")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playlists;
