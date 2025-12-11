import React, { useState } from 'react';
import AccessibleButton from '../../AccessibleButton';
import AccessibleInput from '../../AccessibleInput';

const OCRSettings = () => {
  const [settings, setSettings] = useState({
    language: 'spa',
    confidence: 80,
    preserveFormatting: true,
    autoRotate: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="ocr-settings">
      <div className="page-header">
        <h1 className="page-title">Configuración OCR</h1>
        <p className="page-description">
          Ajusta los parámetros del procesamiento OCR
        </p>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h3>Configuración General</h3>
          <div className="setting-group">
            <label>Idioma</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="settings-select"
            >
              <option value="spa">Español</option>
              <option value="eng">English</option>
              <option value="fra">Français</option>
            </select>
          </div>
          <div className="setting-group">
            <label>Confianza mínima: {settings.confidence}%</label>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.confidence}
              onChange={(e) => handleSettingChange('confidence', parseInt(e.target.value))}
              className="settings-range"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Opciones Avanzadas</h3>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.preserveFormatting}
                onChange={(e) => handleSettingChange('preserveFormatting', e.target.checked)}
              />
              Preservar formato
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoRotate}
                onChange={(e) => handleSettingChange('autoRotate', e.target.checked)}
              />
              Rotación automática
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <AccessibleButton variant="primary">
          Guardar Configuración
        </AccessibleButton>
      </div>
    </div>
  );
};

export default OCRSettings;
