import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Apply from "@/pages/apply";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import Press from "@/pages/press";
import ArticleDetail from "@/pages/article-detail";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import Support from "@/pages/support";
import Admin from "@/pages/admin";
import Polls from "@/pages/polls";
import PollDetail from "@/pages/poll-detail";
import About from "@/pages/about";
import Rules from "@/pages/rules";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin routes without the global layout shell */}
      <Route path="/admin" component={Admin} />
      
      {/* Standard routes with the global layout (Navbar/Footer) */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/apply" component={Apply} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/community" component={Community} />
            <Route path="/profile" component={Profile} />
            <Route path="/press" component={Press} />
            <Route path="/press/:id" component={ArticleDetail} />
            <Route path="/events" component={Events} />
            <Route path="/support" component={Support} />
            <Route path="/polls" component={Polls} />
            <Route path="/polls/:id" component={PollDetail} />
            <Route path="/about" component={About} />
            <Route path="/rules" component={Rules} />
            <Route path="/privacy" component={Privacy} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
