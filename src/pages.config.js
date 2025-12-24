import AgentUI from './pages/AgentUI';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ArticleGenerator from './pages/ArticleGenerator';
import ArticleView from './pages/ArticleView';
import Assets from './pages/Assets';
import Consultation from './pages/Consultation';
import ContentManagement from './pages/ContentManagement';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import Discover from './pages/Discover';
import DocumentAssessment from './pages/DocumentAssessment';
import DocumentChatPage from './pages/DocumentChatPage';
import History from './pages/History';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import InterviewPrep from './pages/InterviewPrep';
import KnowledgeAdmin from './pages/KnowledgeAdmin';
import KnowledgeArticle from './pages/KnowledgeArticle';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeHub from './pages/KnowledgeHub';
import MLAdmin from './pages/MLAdmin';
import MetaphorsGenerator from './pages/MetaphorsGenerator';
import PersonaManagement from './pages/PersonaManagement';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RoleManagement from './pages/RoleManagement';
import SSOTReports from './pages/SSOTReports';
import SecurityAdmin from './pages/SecurityAdmin';
import StrategicIntelligenceBlog from './pages/StrategicIntelligenceBlog';
import SystemHealth from './pages/SystemHealth';
import TermsOfService from './pages/TermsOfService';
import Welcome from './pages/Welcome';
import PublicHome from './pages/PublicHome';
import TenantAdmin from './pages/TenantAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentUI": AgentUI,
    "AnalyticsDashboard": AnalyticsDashboard,
    "ArticleGenerator": ArticleGenerator,
    "ArticleView": ArticleView,
    "Assets": Assets,
    "Consultation": Consultation,
    "ContentManagement": ContentManagement,
    "Dashboard": Dashboard,
    "DataVisualization": DataVisualization,
    "Discover": Discover,
    "DocumentAssessment": DocumentAssessment,
    "DocumentChatPage": DocumentChatPage,
    "History": History,
    "Home": Home,
    "Homepage": Homepage,
    "InterviewPrep": InterviewPrep,
    "KnowledgeAdmin": KnowledgeAdmin,
    "KnowledgeArticle": KnowledgeArticle,
    "KnowledgeBase": KnowledgeBase,
    "KnowledgeHub": KnowledgeHub,
    "MLAdmin": MLAdmin,
    "MetaphorsGenerator": MetaphorsGenerator,
    "PersonaManagement": PersonaManagement,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "RoleManagement": RoleManagement,
    "SSOTReports": SSOTReports,
    "SecurityAdmin": SecurityAdmin,
    "StrategicIntelligenceBlog": StrategicIntelligenceBlog,
    "SystemHealth": SystemHealth,
    "TermsOfService": TermsOfService,
    "Welcome": Welcome,
    "PublicHome": PublicHome,
    "TenantAdmin": TenantAdmin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};