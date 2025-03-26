import useI18n from "../../hooks/use-i18n";

function Loading() {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center h-full min-h-48 w-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent text-indigo-600 dark:text-indigo-400 align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">{t("common.loading")}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    </div>
  );
}

export default Loading;
