import { AppRouter } from "./routes";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "./hooks/searchContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <AppRouter />
      </SearchProvider>
    </QueryClientProvider>
  );
}

export default App;
