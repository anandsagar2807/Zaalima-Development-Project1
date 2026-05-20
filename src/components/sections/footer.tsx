"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
    product: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Documentation", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "Changelog", href: "#" },
    ],
    company: [
        { name: "About Us", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
    ],
    resources: [
        { name: "Community", href: "#" },
        { name: "Help Center", href: "#" },
        { name: "Partners", href: "#" },
        { name: "Status", href: "#" },
    ],
    legal: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "GDPR", href: "#" },
    ],
};

const socialLinks = [
    { name: "GitHub", href: "#", icon: Github },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Email", href: "#", icon: Mail },
];

export function Footer() {
    return (
        <footer className="border-t bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg ring-1 ring-border/60">
                                <Image
                                    src="/owl-logo.png"
                                    alt="GitGuard owl logo"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-cover"
                                />
                            </div>
                            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">GitGuard AI</span>
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-xs">
                            AI-powered code review sentinel that keeps your pull requests clean, secure, and production-ready.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <social.icon className="h-5 w-5" />
                                    <span className="sr-only">{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-3">Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Resources</h3>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 GitGuard AI. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Made with ❤️ for developers</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}