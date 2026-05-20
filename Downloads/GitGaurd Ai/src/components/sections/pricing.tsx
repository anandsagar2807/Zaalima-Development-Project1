"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        description: "Perfect for small teams and side projects",
        price: "$0",
        period: "forever",
        features: [
            "Up to 3 repositories",
            "100 PR reviews/month",
            "Basic code analysis",
            "GitHub integration",
            "Community support",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Pro",
        description: "For growing teams that need more power",
        price: "$29",
        period: "/month",
        features: [
            "Unlimited repositories",
            "Unlimited PR reviews",
            "Advanced AI analysis",
            "Security scanning",
            "Auto-fix suggestions",
            "Priority support",
            "Analytics dashboard",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Enterprise",
        description: "For organizations with advanced needs",
        price: "$99",
        period: "/month",
        features: [
            "Everything in Pro",
            "Self-hosted option",
            "SSO/SAML integration",
            "Custom AI models",
            "SLA guarantee",
            "Dedicated support",
            "Custom integrations",
            "On-premise deployment",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-muted/30">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
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
                        <span className="gradient-text">Simple Pricing</span>
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your team. All plans include a 14-day free trial.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card
                                className={cn(
                                    "relative h-full transition-all duration-300 hover:scale-[1.02]",
                                    plan.popular
                                        ? "border-primary shadow-lg shadow-primary/10"
                                        : "border-border/50 hover:border-primary/30"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white text-sm font-medium flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader className="text-center pb-3 sm:pb-4">
                                    <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="mb-4 sm:mb-6">
                                        <span className="text-4xl sm:text-5xl font-bold gradient-text">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 text-left">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant={plan.popular ? "gradient" : "outline"}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-16 text-center"
                >
                    <p className="text-sm text-muted-foreground mb-4">
                        Trusted by engineering teams worldwide
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60">
                        {["GitHub", "Vercel", "Stripe", "Linear", "Notion"].map((company) => (
                            <span key={company} className="text-base sm:text-xl font-semibold text-muted-foreground">
                                {company}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}