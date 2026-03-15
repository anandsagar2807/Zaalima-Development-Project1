import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  Building
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardHomepage = () => {
  // Mock data - replace with actual API calls
  const dashboardStats = {
    totalApplications: 154,
    pendingApplications: 23,
    approvedThisMonth: 42,
    rejectedThisMonth: 8,
    totalExposure: 1250000000,
    averageProcessingTime: 4.2,
    approvalRate: 78.5
  };

  const recentApplications = [
    {
      id: 'APP-2024-001234',
      company: 'Tech Solutions Pvt Ltd',
      amount: 5000000,
      score: 72,
      status: 'In Review',
      risk: 'Acceptable',
      officer: 'Rahul Sharma',
      submitted: '2024-01-15'
    },
    {
      id: 'APP-2024-001235',
      company: 'Manufacturing Corp',
      amount: 15000000,
      score: 85,
      status: 'Approved',
      risk: 'Good',
      officer: 'Priya Singh',
      submitted: '2024-01-14'
    },
    {
      id: 'APP-2024-001236',
      company: 'Retail Ventures',
      amount: 3000000,
      score: 58,
      status: 'Pending',
      risk: 'Marginal',
      officer: 'Amit Patel',
      submitted: '2024-01-13'
    }
  ];

  const scoreDistribution = [
    { range: '0-45', count: 8, label: 'Reject' },
    { range: '45-55', count: 12, label: 'Watchlist' },
    { range: '55-65', count: 23, label: 'Marginal' },
    { range: '65-75', count: 45, label: 'Acceptable' },
    { range: '75-85', count: 38, label: 'Good' },
    { range: '85-100', count: 28, label: 'Excellent' }
  ];

  const monthlyTrends = [
    { month: 'Aug', applications: 45, approved: 32, exposure: 45000000 },
    { month: 'Sep', applications: 52, approved: 38, exposure: 62000000 },
    { month: 'Oct', applications: 48, approved: 35, exposure: 58000000 },
    { month: 'Nov', applications: 61, approved: 45, exposure: 78000000 },
    { month: 'Dec', applications: 54, approved: 42, exposure: 72000000 },
    { month: 'Jan', applications: 67, approved: 52, exposure: 95000000 }
  ];

  const sectorBreakdown = [
    { name: 'Manufacturing', value: 35, exposure: 450000000 },
    { name: 'IT Services', value: 25, exposure: 280000000 },
    { name: 'Retail', value: 20, exposure: 180000000 },
    { name: 'Healthcare', value: 12, exposure: 150000000 },
    { name: 'Others', value: 8, exposure: 190000000 }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'In Review': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800',
      'On Hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'Excellent': 'text-green-600',
      'Good': 'text-green-500',
      'Acceptable': 'text-blue-600',
      'Marginal': 'text-yellow-600',
      'Watchlist': 'text-orange-600',
      'Reject': 'text-red-600'
    };
    return colors[risk as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Decisioning Dashboard</h1>
          <p className="text-gray-600 mt-2">AI-powered corporate lending analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{dashboardStats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.averageProcessingTime} days avg processing
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.approvedThisMonth} approved this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Exposure</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats.totalExposure.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> YoY growth
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Distribution Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Distribution Analysis</CardTitle>
              <CardDescription>Risk scoring trends and credit quality</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} applications`, '']}
                    labelFormatter={(label) => `Score Range: ${label}`}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sector Exposure */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Exposure</CardTitle>
              <CardDescription>Portfolio diversification</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sectorBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sectorBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {sectorBreakdown.map((sector, index) => (
                  <div key={sector.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{sector.name}</span>
                    </div>
                    <span className="font-medium">
                      ₹{(sector.exposure / 10000000).toFixed(1)}Cr
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Application and approval trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'exposure') return [`₹${(value/10000000).toFixed(1)}Cr`, 'Exposure'];
                    return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Applications"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Approved"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="exposure" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Exposure"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest credit applications under processing</CardDescription>
            </div>
            <Button variant="outline" className="ml-4">
              View All Applications
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Application ID</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Company</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Risk Score</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Officer</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{app.id}</div>
                        <div className="text-xs text-gray-500">{app.submitted}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{app.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        ₹{(app.amount / 100000).toFixed(1)}L
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div 
                            className={`text-lg font-bold ${getRiskColor(app.risk)}`}
                          >
                            {app.score}
                          </div>
                          <div className="ml-2 text-xs text-gray-500">
                            {app.risk}
                          </div>
                        </div>
                        <div className="w-24 mt-1">
                          <Progress value={app.score} className="h-1" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {app.officer}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHomepage;