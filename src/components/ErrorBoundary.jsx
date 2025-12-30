import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.PROD) {
      // TODO: Log to error tracking service
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-200">
            <CardHeader className="border-b bg-red-50">
              <CardTitle className="flex items-center gap-3 text-red-900">
                <AlertCircle className="w-6 h-6" />
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-gray-700 mb-4">
                  Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada
                  e está trabalhando para resolver o problema.
                </p>
                
                {isDev && error && (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2 text-sm">
                        Error Message:
                      </h3>
                      <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-x-auto">
                        {error.toString()}
                      </pre>
                    </div>
                    
                    {errorInfo && errorInfo.componentStack && (
                      <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                          Component Stack Trace
                        </summary>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recarregar Página
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                  <Home className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              </div>

              {!isDev && (
                <p className="text-sm text-gray-500">
                  Se o problema persistir, entre em contato com o suporte em{' '}
                  <a href="mailto:support@troyjo.digital" className="text-blue-600 hover:underline">
                    support@troyjo.digital
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;