"use client";

import { useEffect, useState } from "react";
import { Github, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import AuthorizeGithubButton from "@/components/AuthorizeGithubButton";

export function GithubAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { authenticated, githubConnected, connectGithub } = useAuthStore();

  useEffect(() => {
    // Show modal after 1 second if user is not authenticated
    if (!authenticated && !githubConnected) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [authenticated, githubConnected]);

  const handleAuthorize = () => {
    setIsOpen(false);
    // On the home page, open connect-github in a new tab so the landing page stays open
    if (typeof window !== "undefined") {
      window.open("/connect-github", "_blank", "noopener,noreferrer");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="bg-card border rounded-lg shadow-2xl p-6 mx-4">
          {/* Close Button */}
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Github className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-2">
            Connect Professional GitHub Account
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-6">
            GitGuard AI needs access to your professional GitHub account to analyze pull requests,
            detect issues, and provide AI-powered code reviews.
          </p>

          {/* Permissions List */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold mb-2">This app will be able to:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>&bull; Read your public profile information</li>
              <li>&bull; Access your repositories</li>
              <li>&bull; Read pull requests and code diffs</li>
              <li>&bull; Post review comments (optional)</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <AuthorizeGithubButton
              size="md"
              className="flex-1"
            />
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            You can revoke access anytime from your professional GitHub settings
          </p>
        </div>
      </div>
    </>
  );
}
