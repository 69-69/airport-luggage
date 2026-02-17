'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react'
import {useRouter} from "next/navigation";
import {AuthUser} from "@/types/models";
import storageService from "@/actions/services/storageService";

const _KEY = "signed_in_user";

type AuthContextType = {
    user: AuthUser | null;
    login: (user: AuthUser, remember?: boolean, redirectPath?: string) => void;
    logout: (redirectPath?: string) => void;
    loading: boolean;
};


export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Restore session on first load
    useEffect(() => {
        // const storedUser = localStorage.getItem(_KEY) || sessionStorage.getItem(_KEY);
        const storedUser = storageService.get<AuthUser>(_KEY, {} as AuthUser);

        if (storedUser) {
            setUser(storedUser);
        }

        setLoading(false);
    }, []);


    const _redirectPage = (redirectPath: string | undefined) => {
        if (redirectPath) {
            // Redirect after Auth Context update
            setTimeout(() => {
                router.push(redirectPath);
            }, 0);
        }
    }

    // Login
    const login = (user: AuthUser, remember = false, redirectPath?: string) => {
        setUser(user);

        // const storage = remember ? localStorage : sessionStorage;
        // storage.setItem(_KEY, JSON.stringify(user));
        storageService.set<AuthUser>(_KEY, user, remember);

        _redirectPage(redirectPath);
    };

    const logout = (redirectPath?: string) => {
        setUser(null);
        storageService.remove(_KEY);

        _redirectPage(redirectPath);
    }

    return (
        <AuthContext.Provider value={{user, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
