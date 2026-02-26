import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { useRegistryStore } from "@/stores/registry-store";
import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { ProjectPage } from "@/pages/ProjectPage";

function App() {
  const initialize = useRegistryStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <TooltipProvider>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/project/:type/:id" component={ProjectPage} />
        </Switch>
      </Layout>
    </TooltipProvider>
  );
}

export default App;
