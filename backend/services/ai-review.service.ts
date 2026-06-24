import { env } from '../config/env';
import { logger } from '../utils/logger';

interface AIReview {
  id: string;
  type: 'security' | 'bug' | 'performance' | 'style';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion: string;
  autoFixAvailable: boolean;
  status: 'pending';
  timestamp: string;
}

interface AIAnalysisResult {
  reviews: AIReview[];
  summary: string;
}

export async function analyzeCodeWithAI(
  diff: string,
  prTitle: string
): Promise<AIAnalysisResult> {
  try {
    if (!env.llmApiKey) {
      logger.warn('LLM API key not configured, returning mock analysis');
      return getMockAnalysis();
    }

    const prompt = `You are a code review assistant. Analyze the following pull request and provide a detailed review.

PR Title: ${prTitle}

Code Diff:
${diff.substring(0, env.llmMaxDiffSize)}

Please analyze this code for:
1. Security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
2. Potential bugs and logic errors
3. Performance issues
4. Code style and best practices

Respond in JSON format with the following structure:
{
  "reviews": [
    {
      "type": "security|bug|performance|style",
      "severity": "critical|high|medium|low",
      "title": "Brief title",
      "description": "Detailed description",
      "suggestion": "How to fix it",
      "file": "filename if identifiable",
      "line": line_number_if_identifiable
    }
  ],
  "summary": "Overall assessment of the PR"
}`;

    const response = await fetch(env.llmBaseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.llmApiKey}`,
      },
      body: JSON.stringify({
        model: env.llmModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer. Provide constructive, actionable feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: env.llmMaxTokens,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(env.llmTimeoutMs),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    const parsed = JSON.parse(content);

    const reviews: AIReview[] = (parsed.reviews || []).map((review: any, index: number) => ({
      id: `ai-review-${Date.now()}-${index}`,
      type: review.type || 'bug',
      severity: review.severity || 'medium',
      title: review.title || 'Code issue detected',
      description: review.description || '',
      file: review.file,
      line: review.line,
      suggestion: review.suggestion || '',
      autoFixAvailable: false,
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
    }));

    return {
      reviews,
      summary: parsed.summary || 'AI analysis completed',
    };
  } catch (error) {
    logger.error('AI analysis failed', { error });
    return getMockAnalysis();
  }
}

function getMockAnalysis(): AIAnalysisResult {
  return {
    reviews: [
      {
        id: `mock-review-${Date.now()}`,
        type: 'bug',
        severity: 'medium',
        title: 'AI analysis unavailable',
        description: 'LLM API is not configured. Configure LLM_API_KEY in .env.backend to enable AI reviews.',
        suggestion: 'Add your OpenRouter API key to enable AI-powered code reviews',
        autoFixAvailable: false,
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
    ],
    summary: 'AI analysis is not available. Please configure LLM_API_KEY.',
  };
}
