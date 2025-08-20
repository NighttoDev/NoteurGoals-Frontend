import { AppRouter } from "./routes";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "./hooks/searchContext";
import { ToastProvider } from "./hooks/toastContext";
import ToastContainer from "./components/Common/ToastContainer";
import { ConfirmProvider } from "./hooks/confirmContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <SearchProvider>
            <AppRouter />
            <ToastContainer />
          </SearchProvider>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
