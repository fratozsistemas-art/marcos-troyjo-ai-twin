/**
 * Sprint 2: Performance Frontend - Code Splitting
 * Lazy load heavy components
 */

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback = ({ message = 'Loading...' }) => (
    <div className="flex items-center justify-center p-8">
        <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    </div>
);

export const lazyLoadComponent = (importFunc, fallbackMessage) => {
    const LazyComponent = lazy(importFunc);
    
    return (props) => (
        <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
            <LazyComponent {...props} />
        </Suspense>
    );
};

// Pre-configured lazy components for heavy sections
export const LazyDashboard = lazyLoadComponent(
    () => import('@/components/dashboard/CustomizableDashboard'),
    'Loading dashboard...'
);

export const LazyMLDashboard = lazyLoadComponent(
    () => import('@/components/ml/AdvancedMLDashboard'),
    'Loading ML insights...'
);

export const LazyDocumentManager = lazyLoadComponent(
    () => import('@/components/documents/EnhancedDocumentManager'),
    'Loading documents...'
);

export const LazyAnalytics = lazyLoadComponent(
    () => import('@/components/analytics/EngagementDashboard'),
    'Loading analytics...'
);