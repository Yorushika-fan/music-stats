import type { ReactNode } from "react";

import { Suspense } from "react";

import Loading from "../common/loading";
import Footer from "./footer";
import Header from "./header";

type LayoutProps = {
  children: ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 w-full">
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
