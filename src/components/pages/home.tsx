import { ArrowDownTrayIcon, ChartBarIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import useI18n from "../../hooks/use-i18n";

function Home() {
  const { t } = useI18n();

  const features = [
    {
      name: t("home.features.stats"),
      description: t("home.features.stats_desc"),
      icon: ChartBarIcon,
      href: "/stats",
    },
    {
      name: t("home.features.top"),
      description: t("home.features.top_desc"),
      icon: MusicalNoteIcon,
      href: "/stats",
    },
    {
      name: t("home.features.playlists"),
      description: t("home.features.playlists_desc"),
      icon: MusicalNoteIcon,
      href: "/playlists",
    },
    {
      name: t("home.features.downloads"),
      description: t("home.features.downloads_desc"),
      icon: ArrowDownTrayIcon,
      href: "/downloads",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero section */}
      <div className="px-4 py-16 mx-auto max-w-screen-xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          Music Stats
        </h1>
        <p className="mb-8 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          {t("home.subtitle")}
        </p>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t("home.description")}
        </p>
        <div className="mb-16">
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            {t("home.cta")}
          </Link>
        </div>

        {/* Features section */}
        <div className="pb-16">
          <div className="mb-8">
            <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2">
              {t("home.features.heading")}
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("home.features.title")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {features.map(feature => (
              <Link
                key={feature.name}
                to={feature.href}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-500 rounded-lg p-2 mr-3 text-white dark:bg-indigo-600">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
