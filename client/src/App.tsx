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
import Exercise from "./pages/Exercise";
import Supplements from "./pages/Supplements";
import Sleep from "./pages/Sleep";
import Biohacking from "./pages/Biohacking";
import Nutrition from "./pages/Nutrition";
import BodyMetrics from "./pages/BodyMetrics";
import AIResearch from "./pages/AIResearch";
import FIT from "./pages/FIT";

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
      <Route path="/exercise" component={Exercise} />
      <Route path="/supplements" component={Supplements} />
      <Route path="/sleep" component={Sleep} />
      <Route path="/biohacking" component={Biohacking} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/body-metrics" component={BodyMetrics} />
      <Route path="/ai-research" component={AIResearch} />
      <Route path="/fit" component={FIT} />
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
