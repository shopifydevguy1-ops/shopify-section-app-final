"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, Users, FileText, Settings, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useUser()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "sections" | "settings">("users")
  const [editingSection, setEditingSection] = useState<any>(null)
  const [sectionForm, setSectionForm] = useState({ name: "", tags: "", content: "" })

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      redirect("/sign-in")
      return
    }

    // Check if user is admin
    fetch("/api/admin/check")
      .then(res => res.json())
      .then(data => {
        if (!data.isAdmin) {
          redirect("/dashboard")
          return
        }
        setIsAdmin(true)
        loadData()
      })
      .catch(() => {
        redirect("/dashboard")
      })
  }, [isSignedIn, isLoaded])

  const loadData = async () => {
    try {
      const [usersRes, sectionsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/sections"),
      ])

      const usersData = await usersRes.json()
      const sectionsData = await sectionsRes.json()

      setUsers(usersData)
      setSections(sectionsData)
      setLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setLoading(false)
    }
  }

  const handleUpdateUserSubscription = async (userId: string, subscriptionType: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscriptionType }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "User subscription updated" })
        loadData()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user subscription",
        variant: "destructive",
      })
    }
  }

  const handleResetGenerationCount = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, resetGenerations: true }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "Generation count reset" })
        loadData()
      } else {
        throw new Error("Failed to reset")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset generation count",
        variant: "destructive",
      })
    }
  }

  const handleSaveSection = async () => {
    try {
      const tags = sectionForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      const res = await fetch("/api/admin/sections", {
        method: editingSection ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSection?.id,
          name: sectionForm.name,
          tags,
          content: sectionForm.content,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: editingSection ? "Section updated" : "Section created",
        })
        setEditingSection(null)
        setSectionForm({ name: "", tags: "", content: "" })
        loadData()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      const res = await fetch("/api/admin/sections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sectionId }),
      })

      if (res.ok) {
        toast({ title: "Success", description: "Section deleted" })
        loadData()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    }
  }

  if (!isLoaded || loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <Sparkles className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "sections" ? "default" : "outline"}
            onClick={() => setActiveTab("sections")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Sections
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user subscriptions and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Plan: {user.subscriptionType} | Generations: {user.generationCount}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={user.subscriptionType}
                          onChange={(e) =>
                            handleUpdateUserSubscription(user.id, e.target.value)
                          }
                          className="px-3 py-1 border rounded"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetGenerationCount(user.id)}
                        >
                          Reset Count
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Sections Library</CardTitle>
                    <CardDescription>Manage section templates</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingSection(null)
                          setSectionForm({ name: "", tags: "", content: "" })
                        }}
                      >
                        Add Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSection ? "Edit Section" : "Add New Section"}
                        </DialogTitle>
                        <DialogDescription>
                          Create a new section template for the generator
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={sectionForm.name}
                            onChange={(e) =>
                              setSectionForm({ ...sectionForm, name: e.target.value })
                            }
                            placeholder="e.g., Hero Banner"
                          />
                        </div>
                        <div>
                          <Label>Tags (comma-separated)</Label>
                          <Input
                            value={sectionForm.tags}
                            onChange={(e) =>
                              setSectionForm({ ...sectionForm, tags: e.target.value })
                            }
                            placeholder="e.g., hero, banner, landing"
                          />
                        </div>
                        <div>
                          <Label>Content (Liquid Template)</Label>
                          <Textarea
                            value={sectionForm.content}
                            onChange={(e) =>
                              setSectionForm({ ...sectionForm, content: e.target.value })
                            }
                            placeholder="Paste your Liquid template code here..."
                            rows={15}
                            className="font-mono text-sm"
                          />
                        </div>
                        <Button onClick={handleSaveSection} className="w-full">
                          {editingSection ? "Update" : "Create"} Section
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 border rounded-lg flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{section.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tags: {section.tags.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {section.content.substring(0, 200)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection(section)
                            setSectionForm({
                              name: section.name,
                              tags: section.tags.join(", "),
                              content: section.content,
                            })
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
                <CardDescription>Configure application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings configuration coming soon. API keys and other settings should be
                  configured via environment variables.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

