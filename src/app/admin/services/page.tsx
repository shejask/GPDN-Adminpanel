import { ServicesPageTabs } from "@/components/admin/services/services-page-tabs"

async function getServices() {
  try {
    const res = await fetch('https://api.thegpdn.org/api/palliative/fetchServices', {
      cache: 'no-store',
      next: { tags: ['services'] }
    })
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Services Management</h2>
        <p className="text-muted-foreground">Manage healthcare services offered through the GPDN platform.</p>
      </div>

      <ServicesPageTabs services={services} />
    </div>
  )
}