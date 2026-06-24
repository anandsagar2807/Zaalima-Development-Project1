"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    Webhook,
    Code2,
    Wand2,
    MessageSquare,
    Shield,
    Zap,
    Lock,
    BarChart3
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        icon: Webhook,
        title: "Webhook Integration",
        description: "Seamlessly connects to your professional GitHub webhooks. Listens to PR events in real-time and triggers instant code analysis.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Code2,
        title: "Diff Analysis",
        description: "Advanced AI-powered diff parsing that understands code context, patterns, and potential issues across 50+ languages.",
        gradient: "from-blue-600 to-indigo-500",
    },
    {
        icon: Wand2,
        title: "Auto Fix",
        description: "Intelligent auto-fix suggestions that not only identify issues but provide ready-to-apply code corrections.",
        gradient: "from-orange-500 to-red-500",
    },
    {
        icon: MessageSquare,
        title: "Comment Bot",
        description: "Automated PR comments with detailed reviews, inline suggestions, and contextual feedback for faster iterations.",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        icon: Shield,
        title: "Security Scanner",
        description: "Detects vulnerabilities, secrets, and security anti-patterns before they reach production.",
        gradient: "from-red-500 to-rose-500",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Sub-second analysis with intelligent caching. No more waiting for CI to complete.",
        gradient: "from-yellow-500 to-orange-500",
    },
    {
        icon: Lock,
        title: "Enterprise Security",
        description: "SOC 2 compliant with end-to-end encryption. Your code never leaves your infrastructure.",
        gradient: "from-slate-700 to-blue-600",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Comprehensive insights into code quality trends, team performance, and review metrics.",
        gradient: "from-teal-500 to-cyan-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export function Features() {
    return (
        <section id="features" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
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
                        <span className="gradient-text">Powerful Features</span>
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to automate your code review process and maintain code quality at scale.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={itemVariants}>
                            <Card className="h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-transparent hover:border-primary/20 group">
                                <CardHeader className="pb-3">
                                    <div className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}