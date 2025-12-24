import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within DashboardProvider');
    }
    return context;
};

export const DashboardProvider = ({ children }) => {
    const [globalFilters, setGlobalFilters] = useState({});
    const [activeWidget, setActiveWidget] = useState(null);

    const applyFilter = (widgetId, filterKey, filterValue) => {
        setGlobalFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        setActiveWidget(widgetId);
    };

    const clearFilters = () => {
        setGlobalFilters({});
        setActiveWidget(null);
    };

    const clearFilter = (filterKey) => {
        setGlobalFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[filterKey];
            return newFilters;
        });
    };

    return (
        <DashboardContext.Provider value={{
            globalFilters,
            activeWidget,
            applyFilter,
            clearFilters,
            clearFilter
        }}>
            {children}
        </DashboardContext.Provider>
    );
};