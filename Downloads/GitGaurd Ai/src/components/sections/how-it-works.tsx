"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    GitBranch,
    Brain,
    MessageSquareCode,
    Rocket,
    ArrowRight
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: GitBranch,
        title: "Connect Your Repository",
        description: "Install GitGuard AI GitHub App and connect your repositories in one click. Supports GitHub Cloud and GitHub Enterprise.",
    },
    {
        number: "02",
        icon: Brain,
        title: "AI Analyzes Your PR",
        description: "When a PR is opened, our AI instantly analyzes the code diff for bugs, security issues, style violations, and optimizations.",
    },
    {
        number: "03",
        icon: MessageSquareCode,
        title: "Get Smart Reviews",
        description: "Receive detailed PR comments with inline suggestions, severity ratings, and one-click fix recommendations.",
    },
    {
        number: "04",
        icon: Rocket,
        title: "Ship Faster & Safer",
        description: "Merge with confidence knowing your code has been thoroughly reviewed by AI that learns your codebase patterns.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-muted/30">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-amber-400/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
                        <span className="gradient-text">How It Works</span>
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get started in minutes and let AI handle your code reviews automatically.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="relative bg-card rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border/50 h-full">
                                    {/* Step Number */}
                                    <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className="mt-4 mb-3 sm:mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <step.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{step.title}</h3>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Arrow (for desktop) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                                            <ArrowRight className="h-8 w-8 text-primary/50" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}