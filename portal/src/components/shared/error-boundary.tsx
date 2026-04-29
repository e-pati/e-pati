'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="p-4 rounded-2xl bg-destructive/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Bir şeyler ters gitti</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Bu sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <Button onClick={() => this.setState({ hasError: false, message: '' })}>
            Tekrar Dene
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
