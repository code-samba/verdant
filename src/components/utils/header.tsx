"use client"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center">
            <Leaf className="text-primary-foreground h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">Samba Verdant</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          
          <Button variant="ghost" className="text-sm" disabled>Dashboard</Button>
          <Button variant="ghost" className="text-sm" disabled>Analytics</Button>
          <Button variant="ghost" className="text-sm" disabled>Reports</Button>
          <Button variant="outline" className="ml-2" disabled>Share</Button>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-16 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 w-48">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start">Dashboard</Button>
              <Button variant="ghost" className="justify-start">Analytics</Button>
              <Button variant="ghost" className="justify-start">Reports</Button>
              <Button variant="outline" className="mt-2">Share</Button>
            </div>
          </div>
        )
      }
    </>
  )
}