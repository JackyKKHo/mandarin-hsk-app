import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <div className="error-boundary-icon" aria-hidden="true">⚠️</div>
          <h1>Something went wrong</h1>
          <p>The app ran into an unexpected error. Your saved progress is safe.</p>
          {this.state.error?.message && (
            <pre className="error-boundary-msg">{this.state.error.message}</pre>
          )}
          <div className="error-boundary-actions">
            <button className="btn-primary" onClick={this.handleReset}>Try again</button>
            <button className="btn-secondary" onClick={this.handleHome}>Go home</button>
          </div>
        </div>
      </div>
    )
  }
}
