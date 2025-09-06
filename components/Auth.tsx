import React, { useState } from 'react';
import { SchedulifyLogoIcon, LoaderIcon, GoogleIcon, MailIcon } from './icons';
import { 
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword
} from '../services/firebaseService';

type AuthMethod = 'options' | 'email';

const AuthButton = ({ onClick, icon, children, disabled = false, title = '' }: { onClick: () => void, icon: React.ReactNode, children: React.ReactNode, disabled?: boolean, title?: string }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
    >
        {icon}
        {children}
    </button>
);

const EmailAuthForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmailPassword(email, password);
            } else {
                await signInWithEmailPassword(email, password);
            }
            // onAuthStateChanged in App.tsx will handle success
        } catch (err: any) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('This email address is already in use. Try signing in.');
                    break;
                case 'auth/user-not-found':
                    setError('No account found with this email. Try signing up.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again.');
                    break;
                case 'auth/weak-password':
                    setError('Password should be at least 6 characters.');
                    break;
                default:
                    setError(err.message || 'An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}</h2>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
            </div>
            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                    {isLoading ? <LoaderIcon className="animate-spin h-5 w-5 text-white" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
            </div>
            <div className="text-center">
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>
            <div className="text-center">
                <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                    &larr; Other sign-in options
                </button>
            </div>
        </form>
    );
};

export const Auth: React.FC = () => {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('options');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithGoogle();
            // onAuthStateChanged will handle the redirect result via App.tsx
        } catch (err: any) {
            if (err.code === 'auth/operation-not-supported-in-this-environment') {
                setError("Google Sign-In is not supported in this browser or environment. Please try another method.");
            } else {
                setError(err.message || 'Failed to sign in with Google.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center"><LoaderIcon className="animate-spin h-8 w-8 text-indigo-600" /></div>;
        }

        switch (authMethod) {
            case 'email':
                return <EmailAuthForm onBack={() => setAuthMethod('options')} />;
            case 'options':
            default:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">Sign In or Sign Up</h2>
                        <div className="space-y-3">
                            <AuthButton 
                                onClick={handleGoogleSignIn} 
                                icon={<GoogleIcon className="w-5 h-5" />}
                            >
                                Continue with Google
                            </AuthButton>
                             <AuthButton onClick={() => setAuthMethod('email')} icon={<MailIcon className="w-5 h-5" />}>
                                Continue with Email
                            </AuthButton>
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <SchedulifyLogoIcon className="mx-auto h-16 w-16" />
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mt-4">Welcome to Schedulify AI</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Sign in to continue to your personal study planner.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};