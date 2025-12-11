import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log del error para debugging
    console.error('Error Boundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleReset}
            reload={this.handleReload}
          />
        );
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>¡Oops! Algo salió mal</h2>
            <p>
              Ha ocurrido un error inesperado en la aplicación. Por favor, intenta
              recargar la página o contacta al soporte si el problema persiste.
            </p>
            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="btn-moderno btn-outline"
              >
                <i className="fas fa-redo"></i>
                Intentar de nuevo
              </button>
              <button
                onClick={this.handleReload}
                className="btn-moderno"
              >
                <i className="fas fa-refresh"></i>
                Recargar página
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Detalles del error (desarrollo)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  <h4>Stack Trace:</h4>
                  <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;