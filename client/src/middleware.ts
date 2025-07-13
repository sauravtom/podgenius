import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth.protect();
    
    if (userId) {
      try {
        const response = await fetch(new URL('/api/user/onboarding-status', req.url), {
          headers: {
            'Authorization': `Bearer ${userId}`,
          },
        });
        const data = await response.json();
        
        if (!data.completed && isDashboardRoute(req)) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        
        if (data.completed && isOnboardingRoute(req)) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } catch (error) {
        console.error('Error checking onboarding status in middleware:', error);
        if (isDashboardRoute(req)) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}; 