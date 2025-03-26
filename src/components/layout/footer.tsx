import { HeartIcon } from "@heroicons/react/24/solid";

import useI18n from "../../hooks/use-i18n";

function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Ad space container */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="w-full text-center text-gray-500 dark:text-gray-400 text-xs">
            {/* Ad space placeholder */}
            <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
              <span>Ad Space</span>
            </div>
          </div>
        </div>

        {/* Footer content */}
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
            ©
            {" "}
            {currentYear}
            {" "}
            Music Stats.
            {" "}
            {t("common.rights")}
            <HeartIcon className="h-4 w-4 text-red-500 mx-1" />
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Music Stats is not affiliated with Spotify. Spotify is a trademark of Spotify AB.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
