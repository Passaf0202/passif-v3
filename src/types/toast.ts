import { ToastProps } from "@/components/ui/toast"
import { ToastActionElement } from "@/components/ui/toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

export type Toast = Omit<ToasterToast, "id">