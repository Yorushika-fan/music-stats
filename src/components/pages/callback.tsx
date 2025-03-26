import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { spotifyService } from "../../api";
import useI18n from "../../hooks/use-i18n";
import Loading from "../common/loading";

function Callback() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const testKey = "spotify_test_localStorage";
        localStorage.setItem(testKey, "test");
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return testValue === "test";
      }
      catch (e) {
        console.error("localStorage不可用:", e);
        return false;
      }
    };

    const handleCallback = async () => {
      try {
        // 首先检查localStorage是否可用
        if (!checkLocalStorage()) {
          setError("Authentication failed: localStorage is not available in your browser");
          setIsProcessing(false);
          return;
        }

        // Extract authorization code from URL
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          console.error("Authentication error:", error);
          setError(`Authentication failed: ${error}`);
          setIsProcessing(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (!code) {
          console.error("No code found in URL");
          setError("Authentication failed: No code returned from Spotify");
          setIsProcessing(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Exchange code for tokens
        const result = await spotifyService.getTokensFromCode(code);

        if (!result.success) {
          console.error("Failed to get tokens:", result.error);
          setError("Authentication failed: Could not retrieve access tokens");
          setIsProcessing(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // 检查token是否已正确存储
        const isTokenStored = spotifyService.isLoggedIn();

        if (!isTokenStored) {
          console.error("令牌没有正确存储到localStorage");
          setError("Authentication failed: Tokens not properly stored");
          setIsProcessing(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // 添加延迟确保令牌已正确存
        setTimeout(() => {
          setIsProcessing(false);
          navigate("/stats");
        }, 1000);
      }
      catch (err) {
        console.error("Error in callback:", err);
        setError("Authentication failed: Unexpected error");
        setIsProcessing(false);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mx-auto h-16 w-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{t("common.error")}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">{t("callback.redirecting")}</p>
        </div>
      </div>
    );
  }

  return isProcessing ? <Loading /> : null;
}

export default Callback;
