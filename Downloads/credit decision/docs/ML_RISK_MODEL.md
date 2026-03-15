# ML Risk Model Formula & Architecture

## Overview
Hybrid ML model combining traditional financial ratio analysis with ML-based pattern recognition and NLP.

## 1. Five Cs Framework Scoring

### Character Score (25% Weight)
**Promoter Assessment:**
```
CHAR_score = (
    litig_penalty * 0.30 +           # Litigation history
    cibil_commercial * 0.25 +        # CIBIL score (normalized to shared 0-100)
    director_clean * 0.20 +          # No DIN disqualifications
    management_quality * 0.15 +      # From primary input
    repayment_history * 0.10         # Past repayment track record
)

litig_penalty = max(0, 100 - (active_litigation_count * 15 * severity_multiplier))
severity_multiplier = {HIGH: 3, MEDIUM: 2, LOW: 1}

director_clean = 100 if clean else 0
management_quality = (experience_years * 2 + quality_rating * 8 + credibility_rating * 5) 
```

### Capacity Score (30% Weight) - Financial Capacity
```
CAP_score = (
    profitability_ratio * 0.25 +
    debt_service_ratio * 0.25 +
    cash_flow_strength * 0.20 +
    liquidity_ratio * 0.15 +
    working_capital * 0.15
)

profitability_ratio = normalize(PAT / Total Assets) to 0-100 scale
debt_service_ratio = min(100, (Net Profit / Total Debt) * 100)
cash_flow_strength = normalize(Operating CF / Total Debt) to 0-100
current_ratio_score = {
    >2.0: 100,
    1.5-2.0: 85 + (ratio-1.5)*30,
    1.0-1.5: 60 + (ratio-1.0)*50,
    <1.0: max(0, 60 - (1.0-ratio)*100)
}
working_capital_score = normalize(WC / Revenue) to 0-100
```

### Capital Score (20% Weight)
```
CAPITAL_score = (
    net_worth_adequacy * 0.35 +
    leverage_ratio * 0.30 +
    capital_growth * 0.20 +
    return_on_equity * 0.15
)

net_worth_adequacy = min(100, (Net Worth / Loan Amount) * 10)
leverage_ratio_score = {
    <1.0: 100,
    1.0-2.0: 90 - (ratio-1.0)*20,
    2.0-3.0: 70 - (ratio-2.0)*15,
    >3.0: max(0, 55 - (ratio-3.0)*10)
}
capital_growth = min(100, ((NW_current - NW_prev) / NW_prev) * 1000)
roe_score = normalize(Net Profit / Net Worth) to 0-100
```

### Collateral Score (15% Weight)
```
COLLATERAL_score = (
    security_coverage * 0.50 +
    asset_quality * 0.25 +
    realizable_value * 0.25
)

security_coverage = min(100, (Collateral Value / Loan Amount) * 100)
asset_quality = {
    "prime": 100,
    "standard": 75,
    "substandard": 40,
    "doubtful": 10
}
realizable_value = min(100, (Forced Sale Value / Market Value) * 100)
```

### Conditions Score (10% Weight)
```
CONDITIONS_score = (
    sector_outlook * 0.40 +
    regulatory_environment * 0.30 +
    economic_indicators * 0.30
)

sector_outlook = {
    "emerging_high_growth": 100,
    "stable_growth": 85,
    "mature_stable": 70,
    "declining": 40,
    "distressed": 10
}

regulatory_environment = weighted_avg(
    policy_stability * 0.6,
    compliance_ease * 0.4
)

economic_indicators = normalize(
    gdp_growth * 0.4 +
    inflation_control * 0.3 +
    export_import_ratio * 0.3
)
```

## 2. Final Score Calculation

### Weighted Score Formula
```
FINAL_SCORE = (
    CHAR_score * 0.25 +
    CAP_score * 0.30 +
    CAPITAL_score * 0.20 +
    COLLATERAL_score * 0.15 +
    CONDITIONS_score * 0.10
)
```

### Risk Grade Classification
```
EXCELLENT: FINAL_SCORE >= 85
GOOD: 75 <= FINAL_SCORE < 85
ACCEPTABLE: 65 <= FINAL_SCORE < 75
MARGINAL: 55 <= FINAL_SCORE < 65
WATCHLIST: 45 <= FINAL_SCORE < 55
REJECT: FINAL_SCORE < 45
```

## 3. Loan Limit Calculation

### Base Formula
```
LOAN_LIMIT = min(
    EBITDA * tenor_years * coverage_ratio,
    Net_Worth * leverage_limit,
    Projected_Cash_Flow * debt_service_ratio,
    Collateral_Value * loan_to-value_ratio
)

coverage_ratio = 1.5 (standard), 2.0 (high risk)
leverage_limit = 3.0 (standard), 2.0 (high risk), 4.0 (excellent)
debt_service_ratio = 1.25 (minimum acceptable)
loan_to-value = 0.75 (standard), 0.50 (volatile assets)
```

## 4. Risk Premium Calculation

```
RISK_PREMIUM_BASE = 2.00% (RBI repo rate + spread)

RISK_ADJUSTMENT = (
    score_adjustment +           # Based on FINAL_SCORE
    sector_adjustment +          # Sector risk premium
    security_adjustment +        # Collateral quality
    tenor_adjustment +           # Loan tenor premium
    concentration_adjustment     # Single borrower exposure
)

score_adjustment =
    EXCELLENT: -1.50%
    GOOD: -1.00%
    ACCEPTABLE: -0.50%
    MARGINAL: +0.50%
    WATCHLIST: +1.50%
    REJECT: N/A

FINAL_RATE = RISK_PREMIUM_BASE + RISK_ADJUSTMENT
FINAL_RATE = max(8.5%, min(18.0%, FINAL_RATE))  # Bounded (8.5% - 18%)
```

## 5. ML-Based Risk Detectors

### Circular Trading Detection
```python
def detect_circular_trading(supply_chain_graph, transactions):
    suspicious_pairs = []
    
    for supplier in supply_chain_graph.nodes:
        for customer in supply_chain_graph.nodes:
            if supplier != customer:
                # Check reciprocal trading
                supplier_to_customer = get_transaction_value(supplier, customer)
                customer_to_supplier = get_transaction_value(customer, supplier)
                
                reciprocity_ratio = min(supplier_to_customer, customer_to_supplier) / max(supplier_to_customer, customer_to_supplier)
                
                if reciprocity_ratio > 0.85:  # 85% reciprocity indicates circular trading
                    suspicious_pairs.append({
                        'pair': (supplier, customer),
                        'ratio': reciprocity_ratio,
                        'total_value': supplier_to_customer + customer_to_supplier
                    })
    
    return suspicious_pairs

circular_trading_penalty = min(100, suspicious_transaction_value / total_turnover * 100)
```

### Revenue Inflation Detection
```python
def detect_revenue_inflation(gstr_data, bank_data, declared_data):
    flags = []
    
    # GSTR-1 vs Bank Credits
    gstr_vs_bank = abs(gstr_data.turnover - bank_data.total_credits) / gstr_data.turnover
    if gstr_vs_bank > 0.25:  # 25% variance
        flags.append(f"GST-Bank mismatch: {gstr_vs_bank:.1%}")
    
    # High transactions in non-business hours
    odd_hour_txns = count_transactions(bank_data, hours=[23,0,1,2,3,4])
    if odd_hour_txns / len(bank_data) > 0.15:
        flags.append(f"Excessive non-business hour transactions: {odd_hour_txns}")
    
    # Round number transactions
    round_numbers = count_round_number_transactions(bank_data)
    if round_numbers / len(bank_data) > 0.30:
        flags.append(f"High proportion of round-figure transactions: {round_numbers}")
    
    return flags, len(flags) * 10  # Penalty per flag
```

## 6. Explainability Features

### Feature Importance Ranking
```
FEATURE_IMPORTANCE = {
    "debt_service_ratio": 0.18,
    "current_ratio": 0.15,
    "net_profit_margin": 0.12,
    "litigation_count": 0.10,
    "cibil_score": 0.10,
    "management_quality": 0.08,
    "sector_outlook": 0.07,
    "collateral_coverage": 0.06,
    "working_capital": 0.06,
    "roe": 0.05,
    "gst_bank_reconciliation": 0.03
}
```

### Sensitivity Analysis Formula
```
SENSITIVITY = {
    variable: {
        "current_value": value,
        "impact_per_10pct_change": (
            (score_with_10pct_increase - current_score) +
            (score_with_10pct_decrease - current_score)
        ) / 2,
        "recommendation": generate_recommendation(variable)
    }
    for variable in key_variables
}
```

## 7. Model Validation & Monitoring

### Performance Metrics
```python
# Track model performance on approved applications
def calculate_model_performance(historical_data):
    return {
        "accuracy": correctly_predicted / total_loan * 100,
        "precision": true_positives / (true_positives + false_positives),
        "recall": true_positives / (true_positives + false_negatives),
        "f1_score": 2 * precision * recall / (precision + recall),
        "auc_roc": calculate_auc_roc(),
        "gini_coefficient": calculate_gini()
    }

# Backtesting criteria
target_accuracy = 85%
target_precision = 80%
target_recall = 75%
target_auc_roc = 0.75
```

### Drift Detection
```python
def detect_model_drift(current_period, historical_period):
    # Population Stability Index
    PSI = sum((current_distribution - historical_distribution) * 
              np.log(current_distribution / historical_distribution))
    
    return {
        "psi": PSI,
        "drift_detected": PSI > 0.25,
        "segments_affected": identify_drifting_segments()
    }
```

## 8. Model Update Strategy

### Quarterly Updates
- Recalibrate weights based on recent defaults
- Update sector risk scores
- Refresh benchmark values
- Validate against new RBI guidelines

### Version Control
```
Model v1.0: Initial deployment
Model v1.1: GST reconciliation enhancement
Model v1.2: ML-based flag detection
Model v2.0: Deep learning integration
```

This hybrid approach ensures regulatory compliance while leveraging AI for complex pattern detection that traditional models miss.