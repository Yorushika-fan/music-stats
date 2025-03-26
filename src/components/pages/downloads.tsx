import { ArrowDownTrayIcon, BuildingLibraryIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import useI18n from "../../hooks/use-i18n";

function Downloads() {
  const { t } = useI18n();

  const features = [
    {
      name: "高质量音频下载",
      description: "支持多种音频格式，无损质量",
      icon: ArrowDownTrayIcon,
    },
    {
      name: "离线播放",
      description: "下载后无需联网即可欣赏您喜爱的音乐",
      icon: DevicePhoneMobileIcon,
    },
    {
      name: "播放列表导出",
      description: "导出完整播放列表用于其他音乐应用",
      icon: BuildingLibraryIcon,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-screen-xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {t("downloads.title")}
        </h1>
        <p className="mb-8 text-xl font-bold text-indigo-600 dark:text-indigo-400">
          {t("downloads.comingSoon")}
        </p>
        <p className="mb-12 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t("downloads.description")}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {features.map(feature => (
            <div
              key={feature.name}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-indigo-100 rounded-full p-3 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {feature.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button
            type="button"
            className="px-6 py-3 text-white bg-gray-400 rounded-lg cursor-not-allowed"
            disabled
          >
            敬请期待
          </button>
        </div>
      </div>
    </div>
  );
}

export default Downloads;
