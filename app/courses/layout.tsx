import {
    SignedIn,
    SignedOut,
    RedirectToSignIn,
} from '@clerk/nextjs'

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SignedIn>
                {children}
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    )
}