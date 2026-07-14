import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Layout } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";

// Pages — code-split per route so first load only ships what it needs
import Home from "@/pages/home";
const Apply = lazy(() => import("@/pages/apply"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Community = lazy(() => import("@/pages/community"));
const Press = lazy(() => import("@/pages/press"));
const ArticleDetail = lazy(() => import("@/pages/article-detail"));
const Profile = lazy(() => import("@/pages/profile"));
const Events = lazy(() => import("@/pages/events"));
const Support = lazy(() => import("@/pages/support"));
const Admin = lazy(() => import("@/pages/admin"));
const Polls = lazy(() => import("@/pages/polls"));
const PollDetail = lazy(() => import("@/pages/poll-detail"));
const About = lazy(() => import("@/pages/about"));
const Rules = lazy(() => import("@/pages/rules"));
const Privacy = lazy(() => import("@/pages/privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Linktree = lazy(() => import("@/pages/linktree"));

const queryClient = new QueryClient();

// Reset scroll on route change (wouter keeps the previous scroll position)
function ScrollRestoration() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

// Branded lazy-chunk fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gold/20 border-t-gold" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Standalone routes without the global layout shell */}
        <Route path="/admin" component={Admin} />
        <Route path="/linktree" component={Linktree} />

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
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange={false}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <ScrollRestoration />
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
