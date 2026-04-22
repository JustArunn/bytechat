import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RiAlertLine } from "@remixicon/react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[400px] border border-zinc-800 bg-zinc-950 text-white p-6 rounded-2xl shadow-2xl gap-6">
        <DialogHeader className="gap-3">
          <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'destructive' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <RiAlertLine className="size-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 font-bold text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              // Usually onClose is called by the parent after success, 
              // but we can close it here if the parent doesn't handle it
            }}
            disabled={isLoading}
            className={`flex-1 h-10 font-bold ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLoading ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
