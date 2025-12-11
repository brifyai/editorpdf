import React, { useState, useCallback } from 'react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [settings, setSettings] = useState({
    profile: {
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      company: 'Mi Empresa S.A.',
      role: 'Administrador',
      phone: '+56 9 1234 5678',
      timezone: 'America/Santiago',
      language: 'es'
    },
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        desktop: false,
        analysisComplete: true,
        batchComplete: true,
        systemUpdates: false
      },
      defaultAnalysis: 'comprehensive',
      autoSave: true,
      compactView: false,
      showTooltips: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
      apiAccess: true
    },
    storage: {
      autoCleanup: true,
      retentionDays: 30,
      maxFileSize: 10,
      compressionEnabled: true,
      backupEnabled: true
    }
  });

  const tabs = [
    {
      id: 'profile',
      name: 'Perfil',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'preferences',
      name: 'Preferencias',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    },
    {
      id: 'security',
      name: 'Seguridad',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    {
      id: 'storage',
      name: 'Almacenamiento',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      )
    },
    {
      id: 'api',
      name: 'API',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )
    }
  ];

  const simulateSave = useCallback(() => {
    setIsSaving(true);
    setSaveProgress(0);

    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSaving(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setSaveProgress(100);
      setIsSaving(false);
    }, 2000);
  }, []);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleNestedSettingChange = (section, parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [key]: value
        }
      }
    }));
  };

  const renderProfileSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Información Personal</h3>
        <p>Actualiza tu información de perfil y datos de contacto</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            value={settings.profile.name}
            onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={settings.profile.email}
            onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="company">Empresa</label>
          <input
            id="company"
            type="text"
            value={settings.profile.company}
            onChange={(e) => handleSettingChange('profile', 'company', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Cargo</label>
          <input
            id="role"
            type="text"
            value={settings.profile.role}
            onChange={(e) => handleSettingChange('profile', 'role', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Zona horaria</label>
          <select
            id="timezone"
            value={settings.profile.timezone}
            onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
            className="form-select"
          >
            <option value="America/Santiago">Santiago (UTC-3)</option>
            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            <option value="America/Bogota">Bogotá (UTC-5)</option>
            <option value="America/Lima">Lima (UTC-5)</option>
            <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Idioma</label>
          <select
            id="language"
            value={settings.profile.language}
            onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
            className="form-select"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Preferencias de la Aplicación</h3>
        <p>Personaliza tu experiencia de usuario</p>
      </div>

      <div className="settings-group">
        <h4>Apariencia</h4>
        <div className="setting-item">
          <label htmlFor="theme">Tema</label>
          <select
            id="theme"
            value={settings.preferences.theme}
            onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
            className="form-select"
          >
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
            <option value="auto">Automático</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.compactView}
              onChange={(e) => handleSettingChange('preferences', 'compactView', e.target.checked)}
            />
            <span>Vista compacta</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.showTooltips}
              onChange={(e) => handleSettingChange('preferences', 'showTooltips', e.target.checked)}
            />
            <span>Mostrar tooltips</span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h4>Notificaciones</h4>
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.notifications.email}
              onChange={(e) => handleNestedSettingChange('preferences', 'notifications', 'email', e.target.checked)}
            />
            <span>Notificaciones por email</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.notifications.push}
              onChange={(e) => handleNestedSettingChange('preferences', 'notifications', 'push', e.target.checked)}
            />
            <span>Notificaciones push</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.notifications.desktop}
              onChange={(e) => handleNestedSettingChange('preferences', 'notifications', 'desktop', e.target.checked)}
            />
            <span>Notificaciones de escritorio</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.notifications.analysisComplete}
              onChange={(e) => handleNestedSettingChange('preferences', 'notifications', 'analysisComplete', e.target.checked)}
            />
            <span>Análisis completado</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.notifications.batchComplete}
              onChange={(e) => handleNestedSettingChange('preferences', 'notifications', 'batchComplete', e.target.checked)}
            />
            <span>Lotes completados</span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h4>Comportamiento</h4>
        <div className="setting-item">
          <label htmlFor="defaultAnalysis">Análisis por defecto</label>
          <select
            id="defaultAnalysis"
            value={settings.preferences.defaultAnalysis}
            onChange={(e) => handleSettingChange('preferences', 'defaultAnalysis', e.target.value)}
            className="form-select"
          >
            <option value="comprehensive">Completo</option>
            <option value="text">Solo texto</option>
            <option value="tables">Tablas</option>
            <option value="metadata">Metadatos</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.preferences.autoSave}
              onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
            />
            <span>Guardado automático</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Configuración de Seguridad</h3>
        <p>Gestiona la seguridad de tu cuenta</p>
      </div>

      <div className="settings-group">
        <h4>Autenticación</h4>
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.security.twoFactor}
              onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
            />
            <span>Autenticación de dos factores</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.security.loginNotifications}
              onChange={(e) => handleSettingChange('security', 'loginNotifications', e.target.checked)}
            />
            <span>Notificaciones de inicio de sesión</span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h4>Sesiones</h4>
        <div className="setting-item">
          <label htmlFor="sessionTimeout">Tiempo de espera de sesión (minutos)</label>
          <input
            id="sessionTimeout"
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="form-input"
          />
        </div>

        <div className="setting-item">
          <label htmlFor="passwordExpiry">Expiración de contraseña (días)</label>
          <input
            id="passwordExpiry"
            type="number"
            min="30"
            max="365"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      <div className="settings-group">
        <h4>Acceso a API</h4>
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.security.apiAccess}
              onChange={(e) => handleSettingChange('security', 'apiAccess', e.target.checked)}
            />
            <span>Habilitar acceso a API</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Configuración de Almacenamiento</h3>
        <p>Gestiona el almacenamiento y retención de datos</p>
      </div>

      <div className="settings-group">
        <h4>Limpieza Automática</h4>
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.storage.autoCleanup}
              onChange={(e) => handleSettingChange('storage', 'autoCleanup', e.target.checked)}
            />
            <span>Habilitar limpieza automática</span>
          </label>
        </div>

        <div className="setting-item">
          <label htmlFor="retentionDays">Días de retención</label>
          <input
            id="retentionDays"
            type="number"
            min="1"
            max="365"
            value={settings.storage.retentionDays}
            onChange={(e) => handleSettingChange('storage', 'retentionDays', parseInt(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      <div className="settings-group">
        <h4>Límites</h4>
        <div className="setting-item">
          <label htmlFor="maxFileSize">Tamaño máximo de archivo (MB)</label>
          <input
            id="maxFileSize"
            type="number"
            min="1"
            max="100"
            value={settings.storage.maxFileSize}
            onChange={(e) => handleSettingChange('storage', 'maxFileSize', parseInt(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      <div className="settings-group">
        <h4>Compresión y Respaldo</h4>
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.storage.compressionEnabled}
              onChange={(e) => handleSettingChange('storage', 'compressionEnabled', e.target.checked)}
            />
            <span>Compresión de archivos</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.storage.backupEnabled}
              onChange={(e) => handleSettingChange('storage', 'backupEnabled', e.target.checked)}
            />
            <span>Respaldo automático</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>Configuración de API</h3>
        <p>Gestiona las claves y configuración de API</p>
      </div>

      <div className="api-info">
        <div className="info-card">
          <h4>Estado de la API</h4>
          <div className="status-indicator active">
            <div className="status-dot"></div>
            <span>Activa</span>
          </div>
        </div>

        <div className="info-card">
          <h4>Uso este mes</h4>
          <div className="usage-stats">
            <span className="usage-number">1,247</span>
            <span className="usage-label">solicitudes</span>
          </div>
        </div>

        <div className="info-card">
          <h4>Límite mensual</h4>
          <div className="usage-stats">
            <span className="usage-number">10,000</span>
            <span className="usage-label">solicitudes</span>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Claves de API</h4>
        <div className="api-keys">
          <div className="api-key-item">
            <div className="key-info">
              <h5>Clave Principal</h5>
              <code className="api-key">sk-***************************xyz123</code>
            </div>
            <div className="key-actions">
              <button className="key-button">Mostrar</button>
              <button className="key-button">Regenerar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Documentación</h4>
        <p>Consulta la documentación completa de la API para integraciones avanzadas.</p>
        <button className="doc-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          </svg>
          Ver Documentación
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'preferences':
        return renderPreferencesSettings();
      case 'security':
        return renderSecuritySettings();
      case 'storage':
        return renderStorageSettings();
      case 'api':
        return renderApiSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Configuración</h1>
            <p>Personaliza tu cuenta y preferencias de la aplicación</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="nav-icon">{tab.icon}</div>
                <span className="nav-label">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-main">
          <div className="settings-body">
            {renderTabContent()}
          </div>

          <div className="settings-footer">
            <button className="cancel-button">
              Cancelar
            </button>
            <button className="save-button" onClick={simulateSave} disabled={isSaving}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="save-overlay">
          <div className="save-content">
            <div className="progress-circle">
              <svg width="80" height="80" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - saveProgress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                  className="progress-circle-animated"
                />
              </svg>
              <span className="progress-text">{Math.round(saveProgress)}%</span>
            </div>
            <p className="progress-message">Guardando configuración...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
