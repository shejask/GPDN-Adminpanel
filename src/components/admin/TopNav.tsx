// Dark mode toggle commented out
// import { ModeToggle } from "@/components/mode-toggle"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/ui/user-button"

export function TopNav() {
  return (
    <div className="h-16 border-b px-4 flex items-center justify-end gap-4">
      {/* Dark mode toggle removed */}
      {/* <ModeToggle /> */}
      <UserButton />
    </div>
  )
}
