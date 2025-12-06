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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};