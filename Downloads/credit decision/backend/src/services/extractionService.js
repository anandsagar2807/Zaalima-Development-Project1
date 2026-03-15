const logger = require('../utils/logger');

/**
 * Document Extraction Service
 * Handles OCR and data extraction from uploaded documents
 * Simulates parsing of PDF/Excel documents
 */
class ExtractionService {
    /**
     * Extract financial data from bank statements and GST documents
     */
    async extractFinancials(document, documentType) {
        try {
            // Simulate extraction based on document type
            switch (documentType) {
                case 'BANK_STATEMENT':
                    return this.extractBankStatementData(document);
                case 'GST_RETURN':
                    return this.extractGSTData(document);
                case 'INCOME_TAX_RETURN':
                    return this.extractITRData(document);
                case 'BALANCE_SHEET':
                    return this.extractBalanceSheetData(document);
                default:
                    return this.extractGenericData(document);
            }
        } catch (error) {
            logger.error('Error extracting data:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    /**
     * Extract bank statement data
     */
    extractBankStatementData(document) {
        return {
            success: true,
            documentType: 'BANK_STATEMENT',
            data: {
                accountNumber: this.generateMaskedAccountNumber(),
                bankName: 'Sample Bank',
                statementPeriod: {
                    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    to: new Date().toISOString().split('T')[0]
                },
                transactions: this.generateSampleTransactions(50),
                summary: {
                    openingBalance: Math.random() * 1000000,
                    closingBalance: Math.random() * 1000000 + 500000,
                    totalCredit: Math.random() * 5000000,
                    totalDebit: Math.random() * 4500000,
                    averageDailyBalance: Math.random() * 800000
                },
                bounces: Math.floor(Math.random() * 3),
                cashFlowMetrics: this.calculateCashFlowMetrics(),
                healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
                riskFlags: this.identifyBankingRiskFlags()
            }
        };
    }

    /**
     * Extract GST data
     */
    extractGSTData(document) {
        return {
            success: true,
            documentType: 'GST_RETURN',
            data: {
                gstin: this.generateGSTIN(),
                returnPeriod: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                businessTurnover: {
                    b2b: Math.random() * 10000000,
                    b2c: Math.random() * 2000000,
                    exports: Math.random() * 1000000,
                    total: Math.random() * 13000000
                },
                taxInformation: {
                    igstLiability: Math.random() * 500000,
                    sgstLiability: Math.random() * 500000,
                    cgstLiability: Math.random() * 500000,
                    totalTaxPayable: Math.random() * 1500000
                },
                suppliers: this.generateSupplierList(),
                compliance: {
                    filedOnTime: Math.random() > 0.1,
                    returnsWithErrors: Math.floor(Math.random() * 2),
                    penaltiesImposed: Math.random() > 0.7 ? Math.random() * 50000 : 0
                },
                gstScore: Math.floor(Math.random() * 30) + 70, // 70-100
                riskFlags: this.identifyGSTRiskFlags()
            }
        };
    }

    /**
     * Extract ITR data
     */
    extractITRData(document) {
        return {
            success: true,
            documentType: 'INCOME_TAX_RETURN',
            data: {
                assessmentYear: new Date().getFullYear(),
                financialYear: `FY ${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
                pan: this.generatePAN(),
                grossTotalIncome: Math.random() * 10000000,
                taxableIncome: Math.random() * 8000000,
                taxPaid: Math.random() * 1000000,
                filingStatus: Math.random() > 0.1 ? 'FILED' : 'NOT_FILED',
                businessIncome: Math.random() * 7000000,
                otherIncome: Math.random() * 1000000,
                deductions: Math.random() * 500000,
                profitMargin: Math.random() * 30,
                itrScore: Math.floor(Math.random() * 35) + 65, // 65-100
                riskFlags: this.identifyITRRiskFlags()
            }
        };
    }

    /**
     * Extract balance sheet data
     */
    extractBalanceSheetData(document) {
        const totalAssets = Math.random() * 20000000;
        const totalLiabilities = totalAssets * (0.5 + Math.random() * 0.3); // 50-80% leverage
        const equity = totalAssets - totalLiabilities;

        return {
            success: true,
            documentType: 'BALANCE_SHEET',
            data: {
                asOf: new Date().toISOString().split('T')[0],
                assets: {
                    current: totalAssets * 0.4,
                    fixed: totalAssets * 0.5,
                    intangible: totalAssets * 0.1,
                    total: totalAssets
                },
                liabilities: {
                    current: totalLiabilities * 0.6,
                    longTerm: totalLiabilities * 0.4,
                    total: totalLiabilities
                },
                equity: equity,
                ratios: {
                    debtToEquity: totalLiabilities / Math.max(equity, 1),
                    currentRatio: (totalAssets * 0.4) / (totalLiabilities * 0.6),
                    quickRatio: (totalAssets * 0.3) / (totalLiabilities * 0.6),
                    ROE: Math.random() * 40
                },
                balanceSheetScore: Math.floor(Math.random() * 25) + 75, // 75-100
                riskFlags: this.identifyBalanceSheetRiskFlags(totalLiabilities, equity)
            }
        };
    }

    /**
     * Generic data extraction
     */
    extractGenericData(document) {
        return {
            success: true,
            documentType: 'GENERIC',
            data: {
                extractedText: 'Document processed. Specific extraction not available for this document type.',
                pages: Math.floor(Math.random() * 20) + 1,
                confidence: Math.floor(Math.random() * 30) + 70,
                processingTime: Math.random() * 2000,
                warnings: Math.random() > 0.8 ? ['Poor image quality', 'Some text unclear'] : []
            }
        };
    }

    // Helper methods
    generateMaskedAccountNumber() {
        return 'XXXX-XX-' + Math.floor(Math.random() * 9000000000 + 1000000000).toString().substr(-4);
    }

    generateGSTIN() {
        return `33${Math.floor(Math.random() * 1000000000000)}`;
    }

    generatePAN() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let pan = '';
        for (let i = 0; i < 5; i++) pan += letters[Math.floor(Math.random() * 26)];
        pan += Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        pan += letters[Math.floor(Math.random() * 26)];
        pan += Math.floor(Math.random() * 10).toString();
        return pan;
    }

    generateSampleTransactions(count) {
        const transactions = [];
        for (let i = 0; i < count; i++) {
            transactions.push({
                date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                type: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
                amount: Math.random() * 1000000,
                description: `Transaction ${i + 1}`,
                balance: Math.random() * 2000000
            });
        }
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    generateSupplierList() {
        const suppliers = [];
        for (let i = 0; i < Math.floor(Math.random() * 20) + 10; i++) {
            suppliers.push({
                name: `Supplier ${i + 1}`,
                gstin: this.generateGSTIN(),
                totalInvoices: Math.floor(Math.random() * 100) + 10,
                totalAmount: Math.random() * 5000000
            });
        }
        return suppliers;
    }

    calculateCashFlowMetrics() {
        return {
            operatingCashFlow: Math.random() * 3000000,
            investingCashFlow: -Math.random() * 1000000,
            financingCashFlow: Math.random() * 1000000,
            netCashFlowChange: Math.random() * 2000000,
            cashConversionCycle: Math.floor(Math.random() * 60),
            workingCapitalTrend: Math.random() > 0.5 ? 'IMPROVING' : 'DECLINING'
        };
    }

    identifyBankingRiskFlags() {
        const flags = [];
        if (Math.random() > 0.8) flags.push({ flag: 'FREQUENT_NSF', severity: 'HIGH' });
        if (Math.random() > 0.7) flags.push({ flag: 'IRREGULAR_PATTERN', severity: 'MEDIUM' });
        if (Math.random() > 0.6) flags.push({ flag: 'HIGH_VOLATILITY', severity: 'MEDIUM' });
        return flags;
    }

    identifyGSTRiskFlags() {
        const flags = [];
        if (Math.random() > 0.85) flags.push({ flag: 'LATE_FILING', severity: 'MEDIUM' });
        if (Math.random() > 0.9) flags.push({ flag: 'HIGH_REVERSAL', severity: 'HIGH' });
        return flags;
    }

    identifyITRRiskFlags() {
        const flags = [];
        if (Math.random() > 0.85) flags.push({ flag: 'INCOME_INCONSISTENCY', severity: 'MEDIUM' });
        return flags;
    }

    identifyBalanceSheetRiskFlags(liabilities, equity) {
        const flags = [];
        if (liabilities / (liabilities + equity) > 0.7) {
            flags.push({ flag: 'HIGH_LEVERAGE', severity: 'HIGH' });
        }
        return flags;
    }
}

module.exports = new ExtractionService();
