import Home from './pages/Home';
import Consultation from './pages/Consultation';
import Dashboard from './pages/Dashboard';
import MetaphorsGenerator from './pages/MetaphorsGenerator';
import InterviewPrep from './pages/InterviewPrep';
import ArticleGenerator from './pages/ArticleGenerator';
import DocumentAssessment from './pages/DocumentAssessment';
import History from './pages/History';
import DocumentChatPage from './pages/DocumentChatPage';
import Assets from './pages/Assets';
import AgentUI from './pages/AgentUI';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SecurityAdmin from './pages/SecurityAdmin';
import PersonaManagement from './pages/PersonaManagement';
import KnowledgeHub from './pages/KnowledgeHub';
import LandingPage from './pages/LandingPage';
import ArticleView from './pages/ArticleView';
import RoleManagement from './pages/RoleManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Consultation": Consultation,
    "Dashboard": Dashboard,
    "MetaphorsGenerator": MetaphorsGenerator,
    "InterviewPrep": InterviewPrep,
    "ArticleGenerator": ArticleGenerator,
    "DocumentAssessment": DocumentAssessment,
    "History": History,
    "DocumentChatPage": DocumentChatPage,
    "Assets": Assets,
    "AgentUI": AgentUI,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "SecurityAdmin": SecurityAdmin,
    "PersonaManagement": PersonaManagement,
    "KnowledgeHub": KnowledgeHub,
    "LandingPage": LandingPage,
    "ArticleView": ArticleView,
    "RoleManagement": RoleManagement,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};