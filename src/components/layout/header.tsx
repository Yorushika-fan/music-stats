import { ChevronDownIcon, LanguageIcon, MoonIcon, SunIcon, UserCircleIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type { SpotifyUserProfile } from "../../api/spotify/types";

import spotifyService from "../../api/spotify/spotify-api";
import useI18n from "../../hooks/use-i18n";

// 语言代码到国旗表情的映射
const FLAG_EMOJI: Record<string, string> = {
  "en": "🇺🇸", // 英语 - 美国
  "en-GB": "🇬🇧", // 英语 - 英国
  "en-CA": "🇨🇦", // 英语 - 加拿大
  "en-AU": "🇦🇺", // 英语 - 澳大利亚
  "zh-CN": "🇨🇳", // 简体中文 - 中国
  "zh-TW": "🇹🇼", // 繁体中文 - 台湾
  "zh-HK": "🇭🇰", // 繁体中文 - 香港
  "ja": "🇯🇵", // 日语 - 日本
  "ko": "🇰🇷", // 韩语 - 韩国
  "fr": "🇫🇷", // 法语 - 法国
  "fr-CA": "🇨🇦", // 法语 - 加拿大
  "fr-BE": "🇧🇪", // 法语 - 比利时
  "fr-CH": "🇨🇭", // 法语 - 瑞士
  "de": "🇩🇪", // 德语 - 德国
  "de-AT": "🇦🇹", // 德语 - 奥地利
  "de-CH": "🇨🇭", // 德语 - 瑞士
  "es": "🇪🇸", // 西班牙语 - 西班牙
  "es-MX": "🇲🇽", // 西班牙语 - 墨西哥
  "es-AR": "🇦🇷", // 西班牙语 - 阿根廷
  "pt": "🇵🇹", // 葡萄牙语 - 葡萄牙
  "pt-BR": "🇧🇷", // 葡萄牙语 - 巴西
  "it": "🇮🇹", // 意大利语
  "ru": "🇷🇺", // 俄语
  "nl": "🇳🇱", // 荷兰语
  "pl": "🇵🇱", // 波兰语
  "sv": "🇸🇪", // 瑞典语
  "da": "🇩🇰", // 丹麦语
  "fi": "🇫🇮", // 芬兰语
  "no": "🇳🇴", // 挪威语
  "tr": "🇹🇷", // 土耳其语
  "ar": "🇸🇦", // 阿拉伯语
  "hi": "🇮🇳", // 印地语
  "th": "🇹🇭", // 泰语
  "id": "🇮🇩", // 印尼语
  "vi": "🇻🇳", // 越南语
  "uk": "🇺🇦", // 乌克兰语
  "el": "🇬🇷", // 希腊语
  "cs": "🇨🇿", // 捷克语
  "hu": "🇭🇺", // 匈牙利语
  "he": "🇮🇱", // 希伯来语
  "ro": "🇷🇴", // 罗马尼亚语
  "sk": "🇸🇰", // 斯洛伐克语
  "bg": "🇧🇬", // 保加利亚语
  "hr": "🇭🇷", // 克罗地亚语
  "lt": "🇱🇹", // 立陶宛语
  "lv": "🇱🇻", // 拉脱维亚语
  "et": "🇪🇪", // 爱沙尼亚语
  "sr": "🇷🇸", // 塞尔维亚语
  "sl": "🇸🇮", // 斯洛文尼亚语
};

function Header() {
  const { t, language, setLanguage, availableLanguages } = useI18n();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    return 'light'
  });

  // 获取当前语言的国旗
  const currentFlag = FLAG_EMOJI[language] || "";

  // 获取用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (spotifyService.isLoggedIn()) {
        try {
          const profile = await spotifyService.getUserProfile();
          setUserProfile(profile);
        }
        catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 选择语言并关闭菜单
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    setIsLangMenuOpen(false);
  };

  // 处理退出登录
  const handleLogout = () => {
    spotifyService.logout();
    setUserProfile(null);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  // 添加调试日志
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  };

  return (
    <header className="bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Music Stats
            </Link>
            <nav className="ml-6 space-x-4 hidden sm:flex">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                {t("nav.home")}
              </Link>
              <Link to="/stats" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                {t("nav.stats")}
              </Link>
              <Link to="/playlists" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                {t("nav.playlists")}
              </Link>
              <Link to="/downloads" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                {t("nav.downloads")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* 语言和主题切换按钮 - 在所有屏幕尺寸下都显示 */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                className="flex items-center p-2 rounded-md text-gray-500 hover:text-indigo-600"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <LanguageIcon className="h-5 w-5 mr-1" />
                <span className="flex items-center">
                  <span className="mr-1">{currentFlag}</span>
                  {" "}
                  <span className="hidden sm:inline">{language}</span>
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  {Object.keys(availableLanguages).map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <span className="mr-2 text-lg">{FLAG_EMOJI[lang] || ""}</span>
                      <span className="flex-1">{(availableLanguages as any)[lang].nativeName}</span>
                      {language === lang && (
                        <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 主题切换按钮 */}
            <button
              type="button"
              onClick={handleThemeToggle}
              className="p-2 rounded-md text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
              aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* 桌面端用户菜单 */}
            <div className="hidden sm:block">
              {spotifyService.isLoggedIn() && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {userProfile?.images?.[0]
                      ? (
                          <img
                            src={userProfile.images[0].url}
                            alt={userProfile.display_name}
                            className="h-8 w-8 rounded-full"
                          />
                        )
                      : (
                          <UserCircleIcon className="h-8 w-8 text-gray-500" />
                        )}
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        {userProfile?.display_name}
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t("common.logout")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 移动端汉堡菜单按钮 */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-indigo-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity sm:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 移动端侧边菜单 */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-lg transform transition-all duration-300 ease-out sm:hidden z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo区域 */}
          <div className="p-6 flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              Music Stats
            </Link>
          </div>

          {/* 导航链接 */}
          <nav className="flex-1 px-3">
            <Link
              to="/"
              className="flex items-center px-3 h-12 text-gray-900 dark:text-white text-base font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/stats"
              className="flex items-center px-3 h-12 text-gray-900 dark:text-white text-base font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.stats")}
            </Link>
            <Link
              to="/playlists"
              className="flex items-center px-3 h-12 text-gray-900 dark:text-white text-base font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.playlists")}
            </Link>
            <Link
              to="/downloads"
              className="flex items-center px-3 h-12 text-gray-900 dark:text-white text-base font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.downloads")}
            </Link>
          </nav>

          {/* 用户信息区域 */}
          {spotifyService.isLoggedIn() && userProfile && (
            <div className="px-6 py-4">
              <div className="flex items-center space-x-3 mb-6">
                {userProfile.images?.[0] ? (
                  <img
                    src={userProfile.images[0].url}
                    alt={userProfile.display_name}
                    className="h-10 w-10 rounded-full ring-2 ring-white/20"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {userProfile.display_name}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full h-11 px-4 text-sm font-medium text-gray-900 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
              >
                {t("common.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
