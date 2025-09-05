import React, { useState, useEffect } from 'react';
import { SchedulifyLogoIcon, LoaderIcon, GoogleIcon, MailIcon } from './icons';
import { 
  setupRecaptchaVerifier, 
  signInWithPhoneNumber,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword
} from '../services/firebaseService';
import { config } from './config';

// Fix: Declare grecaptcha to inform TypeScript about the global reCAPTCHA object.
declare const grecaptcha: any;

type AuthMethod = 'options' | 'phone' | 'email';

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

const PhoneAuthForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
            }
        }
    }, []);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const fullPhoneNumber = `+91${phoneNumber}`;

        try {
            if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
                throw new Error("Please enter a valid 10-digit Indian mobile number.");
            }
            
            const appVerifier = setupRecaptchaVerifier();
            (window as any).recaptchaVerifier = appVerifier;

            const result = await signInWithPhoneNumber(fullPhoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('otp');

        } catch (err: any) {
            console.error("SMS send failed:", err);
            
            let friendlyError: string;

            if (err.message && err.message.includes("valid 10-digit")) {
                friendlyError = err.message;
            } else if (err.code === 'auth/internal-error' || (err.message && err.message.includes('auth/internal-error'))) {
                friendlyError = `An internal authentication error occurred. This is usually a configuration issue.\n\nPlease check the following in your Firebase project:\n1. The 'Phone' sign-in provider is enabled in the Firebase Authentication console.\n2. Your project's \`authDomain\` (${config.firebase.authDomain}) is listed in the 'Authorized domains' for authentication.\n3. Your API key restrictions are correctly configured to allow this app's domain and the reCAPTCHA API from Google.`;
            } else {
                friendlyError = err.message || "Failed to send OTP. Please try again.";
            }
            
            setError(friendlyError);

            if ((window as any).recaptchaVerifier && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                try {
                    const verifier = (window as any).recaptchaVerifier;
                    if (verifier.widgetId !== undefined) {
                        grecaptcha.reset(verifier.widgetId);
                    }
                } catch(resetError) {
                    console.error("Failed to reset reCAPTCHA", resetError);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await confirmationResult.confirm(otp);
        } catch (err: any) {
            console.error("OTP verification failed:", err);
            setError("Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Verify OTP</h2>
                 <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">One-Time Password</label>
                    <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter the 6-digit code" maxLength={6} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                </div>
                 {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                        {isLoading ? <LoaderIcon className="animate-spin h-5 w-5 text-white" /> : 'Verify & Sign In'}
                    </button>
                </div>
                 <div className="text-center">
                    <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                        &larr; Other sign-in options
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Sign In with Phone</h2>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400">+91</span>
                    <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" maxLength={10} className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                </div>
            </div>
            {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                    {isLoading ? <LoaderIcon className="animate-spin h-5 w-5 text-white" /> : 'Send OTP'}
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
            case 'phone':
                return <PhoneAuthForm onBack={() => setAuthMethod('options')} />;
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
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">OR</span>
                            </div>
                        </div>
                         <button
                            onClick={() => setAuthMethod('phone')}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700"
                         >
                            Sign In with Phone Number
                        </button>
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