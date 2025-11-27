// app/sign-in/[[...sign-in]]/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isSignedIn) {
            router.push('/courses');
        }
    }, [isSignedIn, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        CourseTube
                    </Link>
                    <h1 className="text-3xl font-bold mt-4 text-gray-900">Welcome back</h1>
                    <p className="text-gray-600 mt-2">Sign in to continue your learning journey</p>
                </div>

                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-white shadow-lg rounded-2xl border-0",
                            headerTitle: "text-2xl font-bold text-gray-900",
                            headerSubtitle: "text-gray-600",
                            socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                            footerActionLink: "text-purple-600 hover:text-purple-700",
                        }
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    redirectUrl="/courses"
                    afterSignInUrl="/courses"
                />
            </div>
        </div>
    );
}