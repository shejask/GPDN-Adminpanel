import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, MessageSquare, FileText, BookOpen, 
  UserPlus, ArrowUpRight, Activity, BarChart3, PieChart
} from "lucide-react"
import Link from "next/link"

type User = {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  imageURL?: string
  countryOfPractice?: string
  registrationStatus: string
  createdAt: string
  updatedAt: string
}

type Resource = {
  _id: string
  title: string
  description: string
  authorId: string
  approvalStatus: boolean
  createdAt: string
  updatedAt: string
}

async function fetchDashboardMetrics() {
  try {
    const [totalUsersRes, totalThreadsRes, totalResourcesRes, totalBlogsRes] = await Promise.all([
      fetch('https://api.thegpdn.org/api/admin/fetchTotalUsers', { cache: 'no-store' }),
      fetch('https://api.thegpdn.org/api/admin/fetchTotalThreads', { cache: 'no-store' }),
      fetch('https://api.thegpdn.org/api/admin/fetchTotalResources', { cache: 'no-store' }),
      fetch('https://api.thegpdn.org/api/admin/fetchTotalNewsAndBlogs', { cache: 'no-store' })
    ])

    const totalUsers = await totalUsersRes.json()
    const totalThreads = await totalThreadsRes.json()
    const totalResources = await totalResourcesRes.json()
    const totalBlogs = await totalBlogsRes.json()

    return {
      totalUsers: totalUsers.success ? totalUsers.data : 0,
      totalThreads: totalThreads.success ? totalThreads.data : 0,
      totalResources: totalResources.success ? totalResources.data : 0,
      totalBlogs: totalBlogs.success ? totalBlogs.data : 0
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      totalUsers: 0,
      totalThreads: 0,
      totalResources: 0,
      totalBlogs: 0
    }
  }
}

async function fetchRecentActivity() {
  try {
    const [recentUsersRes, recentResourcesRes, monthlyUsersRes] = await Promise.all([
      fetch('https://api.thegpdn.org/api/admin/fetchLastDayUserRegistration', { cache: 'no-store' }),
      fetch('https://api.thegpdn.org/api/admin/fetchLastDayResource', { cache: 'no-store' }),
      fetch('https://api.thegpdn.org/api/admin/fetchLastMonthUserRegistration', { cache: 'no-store' })
    ])

    const recentUsers = await recentUsersRes.json()
    const recentResources = await recentResourcesRes.json()
    const monthlyUsers = await monthlyUsersRes.json()

    return {
      recentUsers: recentUsers.success ? recentUsers.data : [],
      recentResources: recentResources.success ? recentResources.data : [],
      monthlyUsers: monthlyUsers.success ? monthlyUsers.data : []
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return {
      recentUsers: [],
      recentResources: [],
      monthlyUsers: []
    }
  }
}

const DashboardPage = async () => {
  const metrics = await fetchDashboardMetrics()
  const activity = await fetchRecentActivity()

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform activity and statistics</p>
      </div>
      
      {/* Main stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Healthcare professionals</p>
          </CardContent>
          <CardFooter className="pt-0 pb-2">
            <Link href="/admin/members" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
              View all members <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Threads
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalThreads}</div>
            <p className="text-xs text-muted-foreground mt-1">Forum discussions</p>
          </CardContent>
          <CardFooter className="pt-0 pb-2">
            <Link href="/admin/forums" className="text-xs text-green-500 flex items-center gap-1 hover:underline">
              View all threads <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResources}</div>
            <p className="text-xs text-muted-foreground mt-1">Educational materials</p>
          </CardContent>
          <CardFooter className="pt-0 pb-2">
            <Link href="/admin/resources" className="text-xs text-purple-500 flex items-center gap-1 hover:underline">
              View all resources <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Blogs
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBlogs ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">News and articles</p>
          </CardContent>
          <CardFooter className="pt-0 pb-2">
            <Link href="/admin/blogs" className="text-xs text-amber-500 flex items-center gap-1 hover:underline">
              View all blogs <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Activity tabs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent users */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Members</CardTitle>
                <CardDescription>New registrations in the last 24 hours</CardDescription>
              </div>
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.recentUsers.length > 0 ? (
                activity.recentUsers.map((user: User) => (
                  <div key={user._id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.imageURL} alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.registrationStatus === 'approved' ? 'default' : 'outline'} className="text-xs">
                            {user.registrationStatus.charAt(0).toUpperCase() + user.registrationStatus.slice(1)}
                          </Badge>
                          {user.countryOfPractice && (
                            <span className="text-xs text-muted-foreground">{user.countryOfPractice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No recent registrations</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/members">
                View all members
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Resources</CardTitle>
                <CardDescription>Added in the last 24 hours</CardDescription>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.recentResources.length > 0 ? (
                activity.recentResources.map((resource: Resource) => (
                  <div key={resource._id} className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate max-w-[200px]">{resource.title}</h3>
                      <Badge variant={resource.approvalStatus ? 'default' : 'outline'} className="text-xs">
                        {resource.approvalStatus ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(resource.createdAt)}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No recent resources</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/resources">
                View all resources
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Platform activity overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Monthly registration trends and engagement metrics</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Monthly User Registrations</h3>
              <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/5">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Registration data visualization</p>
                  <p className="text-xs text-muted-foreground mt-1">Total this month: {activity.monthlyUsers.length}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Content Distribution</h3>
              <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/5">
                <div className="text-center">
                  <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Content type distribution</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs">Resources: {metrics.totalResources}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Threads: {metrics.totalThreads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage