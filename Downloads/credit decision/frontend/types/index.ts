export type DocumentType =
  | 'GST_RETURN_1'
  | 'GST_RETURN_3B'
  | 'GST_2A'
  | 'ITR'
  | 'BANK_STATEMENT'
  | 'BALANCE_SHEET'
  | 'PNL_STATEMENT'
  | 'ANNUAL_REPORT'
  | 'BOARD_RESOLUTION'
  | 'CIBIL_REPORT'
  | 'MOA_AOA'
  | 'RATING_REPORT'
  | 'SHAREHOLDING_PATTERN'
  | 'SITE_VISIT_REPORT'
  | 'MANAGEMENT_INTERVIEW'
  | 'UNKNOWN'

export interface Company {
  id: string
  name: string
  cin?: string
  pan?: string
  gstin?: string
  incorporationDate?: string
  businessType?: string
  sector?: string
  scale?: 'SME' | 'MID_CORPORATE' | 'LARGE_CORPORATE'
  status?: 'ACTIVE' | 'DEFAULTER' | 'NCLT' | 'WINDING_UP'
  address?: string
  city?: string
  state?: string
  pincode?: string
  email?: string
  phone?: string
  createdAt: string
}

export interface Application {
  id: string
  applicationNumber: string
  companyId: string
  company?: Company
  loanAmount: number
  tenorMonths: number
  purpose?: string
  status: string
  stage: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  finalScore?: number
  riskGrade?: string
  assignedTo?: string | null
  createdAt: string
  updatedAt?: string
}

export interface ApplicationSummary {
  id?: string
  applicationNumber: string
  company?: Pick<Company, 'name'>
  loanAmount?: number
  stage?: string
  assignedTo?: string | null
  finalScore?: number
  updatedAt?: string
}

export interface DocumentRecord {
  id?: string
  applicationId?: string
  companyId?: string
  name: string
  type: DocumentType | string
  stage?: string
  status?: 'pending' | 'verified' | 'rejected' | string
  filename?: string
  mimeType?: string
  size?: number
  s3Key?: string
  uploadedBy?: string
  uploadedAt?: string
  processedAt?: string
  extraction?: {
    confidenceScore?: number
    riskFlags?: { type: string; severity: string; description?: string }[]
  } | null
}

export interface CreditScore {
  id: string
  applicationId: string
  characterScore: number
  capacityScore: number
  capitalScore: number
  collateralScore: number
  conditionsScore: number
  totalScore: number
  riskGrade: string
  calculatedAt: string
}

export interface DashboardOverview {
  summary: {
    totalApplications: number
    pendingApplications: number
    approvedApplications: number
    rejectedApplications: number
    totalExposure: number
    averageScore: number
    approvalRate: string
  }
  recentApplications: Application[]
  trends: { month: string; applications: number; approved: number; exposure: number }[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface UserRecord {
  id?: string
  name: string
  email: string
  role: string
  status?: 'active' | 'suspended' | 'invited' | string
  phone?: string
  department?: string
  designation?: string
  isActive?: boolean
  createdAt?: string
  lastLoginAt?: string
}
