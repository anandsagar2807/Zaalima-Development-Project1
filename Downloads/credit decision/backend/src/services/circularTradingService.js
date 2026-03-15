const logger = require('../utils/logger');

/**
 * Circular Trading Detection Service
 * Analyzes supplier-customer relationships to identify circular trading patterns
 */
class CircularTradingService {
    /**
     * Detect circular trading patterns from GST/supplier data
     * Looks for patterns where entities supply each other creating circular flows
     */
    async detectCircularTrading(applicationId, gstExtractions, supplierData) {
        try {
            logger.info(`Analyzing circular trading for application: ${applicationId}`);

            if (!gstExtractions || gstExtractions.length === 0) {
                return {
                    detected: false,
                    riskLevel: 'LOW',
                    suspiciousSuppliers: [],
                    circularPercentage: 0,
                    score: 85,
                    message: 'Insufficient data for circular trading analysis'
                };
            }

            // Build supplier network from extractions
            const network = this.buildSupplierNetwork(gstExtractions);

            // Detect circular patterns
            const circularPatterns = this.findCircularPatterns(network);

            // Analyze circular percentage
            const totalTurnover = this.calculateTotalTurnover(gstExtractions);
            const circularTurnover = this.calculateCircularTurnover(circularPatterns, gstExtractions);
            const circularPercentage = totalTurnover > 0 ? (circularTurnover / totalTurnover) * 100 : 0;

            // Calculate risk level
            const riskLevel = this.calculateRiskLevel(circularPercentage, circularPatterns.length);
            const riskScore = this.calculateRiskScore(circularPercentage, riskLevel);

            // Get suspicious suppliers
            const suspiciousSuppliers = this.identifySuspiciousSuppliers(circularPatterns, gstExtractions);

            logger.info(`Circular trading analysis complete: ${circularPatterns.length} patterns detected, ${circularPercentage.toFixed(2)}% circular`);

            return {
                detected: circularPatterns.length > 0,
                riskLevel,
                score: riskScore,
                circularPercentage: parseFloat(circularPercentage.toFixed(2)),
                suspiciousSuppliers,
                tradeNetworkSummary: {
                    totalSuppliers: network.nodes.length,
                    totalTransactions: network.edges.length,
                    circularPatterns: circularPatterns.length
                },
                recommendation: this.getRecommendation(riskLevel, circularPercentage),
                detectedAt: new Date()
            };
        } catch (error) {
            logger.error('Error in circular trading detection:', error);
            return {
                detected: false,
                riskLevel: 'UNKNOWN',
                score: 50,
                circularPercentage: 0,
                suspiciousSuppliers: [],
                tradeNetworkSummary: { totalSuppliers: 0, totalTransactions: 0, circularPatterns: 0 },
                message: 'Error during analysis'
            };
        }
    }

    /**
     * Build supplier network from GST extractions
     */
    buildSupplierNetwork(gstExtractions) {
        const nodes = new Set();
        const edges = [];

        gstExtractions.forEach(extraction => {
            if (extraction.suppliers && Array.isArray(extraction.suppliers)) {
                extraction.suppliers.forEach(supplier => {
                    // Add nodes
                    if (extraction.gstin) nodes.add(extraction.gstin);
                    if (supplier.gstin) nodes.add(supplier.gstin);

                    // Add edges
                    edges.push({
                        from: extraction.gstin,
                        to: supplier.gstin,
                        amount: supplier.amount || 0,
                        invoices: supplier.invoices || 0
                    });
                });
            }
        });

        return {
            nodes: Array.from(nodes),
            edges
        };
    }

    /**
     * Find circular patterns in the network
     * Example: A -> B -> C -> A
     */
    findCircularPatterns(network) {
        const patterns = [];
        const visited = new Set();

        for (const node of network.nodes) {
            const cycles = this.findCycles(node, network.edges, [], new Set());
            patterns.push(...cycles);
        }

        // Remove duplicate patterns
        const uniquePatterns = Array.from(new Set(patterns.map(p => JSON.stringify(p)))).map(p => JSON.parse(p));
        return uniquePatterns;
    }

    /**
     * DFS to find cycles in the graph
     */
    findCycles(start, edges, path, visited) {
        const cycles = [];
        path.push(start);
        visited.add(start);

        for (const edge of edges) {
            if (edge.from === start) {
                if (path.includes(edge.to) && edge.to === path[0] && path.length >= 3) {
                    // Found a cycle
                    cycles.push([...path, edge.to]);
                } else if (!visited.has(edge.to)) {
                    // Continue DFS
                    cycles.push(...this.findCycles(edge.to, edges, path, visited));
                }
            }
        }

        path.pop();
        return cycles;
    }

    /**
     * Calculate total turnover from extractions
     */
    calculateTotalTurnover(gstExtractions) {
        return gstExtractions.reduce((sum, extraction) => {
            const supplierTotal = (extraction.suppliers || []).reduce((s, supplier) => s + (supplier.amount || 0), 0);
            return sum + supplierTotal;
        }, 0);
    }

    /**
     * Calculate turnover involved in circular patterns
     */
    calculateCircularTurnover(patterns, gstExtractions) {
        let circularAmount = 0;

        patterns.forEach(pattern => {
            for (let i = 0; i < pattern.length - 1; i++) {
                const extraction = gstExtractions.find(e => e.gstin === pattern[i]);
                if (extraction && extraction.suppliers) {
                    const supplier = extraction.suppliers.find(s => s.gstin === pattern[i + 1]);
                    if (supplier) {
                        circularAmount += supplier.amount || 0;
                    }
                }
            }
        });

        return circularAmount;
    }

    /**
     * Calculate risk level based on circular percentage
     */
    calculateRiskLevel(percentage, patternCount) {
        if (percentage >= 30 && patternCount >= 2) {
            return 'CRITICAL';
        }
        if (percentage >= 15 && patternCount >= 1) {
            return 'HIGH';
        }
        if (percentage >= 5) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * Calculate numerical risk score (0-100)
     */
    calculateRiskScore(percentage, riskLevel) {
        const baseScore = 100 - (percentage * 2);
        const adjustment = {
            CRITICAL: -30,
            HIGH: -20,
            MEDIUM: -10,
            LOW: 0
        };
        return Math.max(0, baseScore + (adjustment[riskLevel] || 0));
    }

    /**
     * Identify suppliers involved in circular patterns
     */
    identifySuspiciousSuppliers(patterns, gstExtractions) {
        const suspicious = new Set();

        patterns.forEach(pattern => {
            pattern.forEach(gstin => {
                const extraction = gstExtractions.find(e => e.gstin === gstin);
                if (extraction) {
                    suspicious.add({
                        gstin: extraction.gstin,
                        name: extraction.name || 'Unknown',
                        reason: 'Involved in circular pattern'
                    });
                }
            });
        });

        return Array.from(suspicious);
    }

    /**
     * Get recommendation based on risk level and percentage
     */
    getRecommendation(riskLevel, percentage) {
        const recommendations = {
            CRITICAL: `CRITICAL: High circular turnover (${percentage.toFixed(1)}%) detected. Immediate investigation and verification required.`,
            HIGH: `HIGH: Significant circular pattern detected (${percentage.toFixed(1)}%). Enhanced supplier verification recommended.`,
            MEDIUM: `MEDIUM: Moderate circular pattern detected (${percentage.toFixed(1)}%). Request additional documentation from suppliers.`,
            LOW: `LOW: No significant circular trading patterns detected. Standard verification sufficient.`
        };
        return recommendations[riskLevel] || 'Risk level unknown';
    }
}

module.exports = new CircularTradingService();
