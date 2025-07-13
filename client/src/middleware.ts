import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for API routes to prevent interference
  if (isApiRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    const { userId } = await auth.protect();
    
    if (userId) {
      try {
        console.log(`[Middleware] Checking onboarding status for user: ${userId}`);
        
        // Add retry logic for the API call
        let response: Response | undefined;
        let retries = 3;
        
        while (retries > 0) {
          try {
            response = await fetch(new URL('/api/user/onboarding-status', req.url), {
              headers: {
                'Authorization': `Bearer ${userId}`,
              },
              // Add timeout to prevent hanging
              signal: AbortSignal.timeout(5000),
            });
            break;
          } catch (fetchError) {
            retries--;
            if (retries === 0) {
              throw fetchError;
            }
            console.log(`[Middleware] API call failed, retrying... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!response || !response.ok) {
          console.error('[Middleware] Onboarding status API error:', response?.status, response?.statusText);
          // If API fails, allow access to onboarding but redirect dashboard to onboarding
          if (isDashboardRoute(req)) {
            console.log(`[Middleware] API failed, redirecting dashboard to onboarding`);
            return NextResponse.redirect(new URL('/onboarding', req.url));
          }
          return;
        }
        
        const data = await response.json();
        console.log(`[Middleware] Onboarding status:`, data);
        
        // Check if onboarding is completed
        if (data.completed === true) {
          if (isOnboardingRoute(req)) {
            console.log(`[Middleware] Onboarding completed, redirecting to dashboard`);
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
        } else {
          if (isDashboardRoute(req)) {
            console.log(`[Middleware] Onboarding not completed, redirecting to onboarding`);
            return NextResponse.redirect(new URL('/onboarding', req.url));
          }
        }
      } catch (error) {
        console.error('[Middleware] Error checking onboarding status:', error);
        // If there's an error, allow access to onboarding but redirect dashboard to onboarding
        if (isDashboardRoute(req)) {
          console.log(`[Middleware] Error occurred, redirecting dashboard to onboarding`);
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}; 