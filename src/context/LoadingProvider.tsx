import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/ui/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);

  // Mobile pe 3D nahi hai, isliye loading auto complete kar do
  useEffect(() => {
    const isMobile = window.innerWidth <= 1024;
    if (!isMobile) return;

    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 8) + 3;
      if (percent >= 100) {
        percent = 100;
        setLoading(100);
        clearInterval(interval);
      } else {
        setLoading(percent);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const value: LoadingType = { isLoading, setIsLoading, setLoading };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
