import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import Coach from "./pages/Coach";
import Meditations from "./pages/Meditations";
import Journal from "./pages/Journal";
import Toolkit from "./pages/Toolkit";
import Progress from "./pages/Progress";
import Habits from "./pages/Habits";
import Community from "./pages/Community";
import Learn from "./pages/Learn";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/checkin" component={CheckIn} />
      <Route path="/coach" component={Coach} />
      <Route path="/meditations" component={Meditations} />
      <Route path="/journal" component={Journal} />
      <Route path="/toolkit" component={Toolkit} />
      <Route path="/progress" component={Progress} />
      <Route path="/habits" component={Habits} />
      <Route path="/community" component={Community} />
      <Route path="/learn" component={Learn} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
