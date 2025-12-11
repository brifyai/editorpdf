/**
 * Configuración Centralizada de Modelos de IA para Document Analyzer
 * Basada en las recomendaciones óptimas para OCR y análisis de documentos
 */

const AI_MODELS_CONFIG = {
    // Modelos Groq - Principales para análisis
    groq: {
        'llama-3.3-70b-versatile': {
            id: 'llama-3.3-70b-versatile',
            name: 'Llama 3.3 70B Versatile',
            provider: 'groq',
            category: 'primary',
            recommended: true,
            performance: {
                accuracy: 0.92,
                speed: 0.80,
                consistency: 0.90,
                reasoning: 0.88
            },
            capabilities: {
                context: '131k',
                cost: {
                    usd_per_token: 0.0001,
                    usd_per_request: 0.01,
                    clp_per_token: 0.095,
                    clp_per_request: 9.5,
                    category: 'medium'
                },
                speed: 'fast'
            },
            specialties: [
                'comprehensive_analysis',
                'complex_classification',
                'detailed_summaries',
                'ocr_post_processing',
                'business_documents',
                'academic_papers'
            ],
            use_cases: {
                primary: [
                    'business_documents',
                    'academic_papers',
                    'general_analysis',
                    'ocr_enhancement'
                ],
                secondary: [
                    'financial_reports',
                    'technical_documents',
                    'legal_documents'
                ]
            },
            parameters: {
                default: {
                    temperature: 0.2,
                    max_tokens: 1500,
                    top_p: 0.9,
                    frequency_penalty: 0.1
                },
                ocr_enhancement: {
                    temperature: 0.1,
                    max_tokens: 1000,
                    top_p: 0.8,
                    frequency_penalty: 0.2
                },
                creative: {
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.95,
                    frequency_penalty: 0.1
                }
            }
        },
        'mixtral-8x7b-32768': {
            id: 'mixtral-8x7b-32768',
            name: 'Mixtral 8x7B',
            provider: 'groq',
            category: 'premium',
            recommended: false,
            performance: {
                accuracy: 0.94,
                speed: 0.65,
                consistency: 0.92,
                reasoning: 0.93
            },
            capabilities: {
                context: '32k',
                cost: {
                    usd_per_token: 0.0002,
                    usd_per_request: 0.02,
                    clp_per_token: 0.19,
                    clp_per_request: 19.0,
                    category: 'high'
                },
                speed: 'medium'
            },
            specialties: [
                'deep_analysis',
                'complex_reasoning',
                'technical_documents',
                'legal_analysis',
                'medical_analysis',
                'critical_documents'
            ],
            use_cases: {
                primary: [
                    'legal_documents',
                    'medical_documents',
                    'technical_documents',
                    'critical_analysis'
                ],
                secondary: [
                    'research_papers',
                    'compliance_documents',
                    'quality_assessment'
                ]
            },
            parameters: {
                default: {
                    temperature: 0.1,
                    max_tokens: 2000,
                    top_p: 0.8,
                    frequency_penalty: 0.1
                },
                critical: {
                    temperature: 0.05,
                    max_tokens: 2500,
                    top_p: 0.7,
                    frequency_penalty: 0.0
                }
            }
        },
        'llama-3.1-8b-instant': {
            id: 'llama-3.1-8b-instant',
            name: 'Llama 3.1 8B Instant',
            provider: 'groq',
            category: 'fast',
            recommended: false,
            performance: {
                accuracy: 0.82,
                speed: 0.95,
                consistency: 0.78,
                reasoning: 0.75
            },
            capabilities: {
                context: '131k',
                cost: {
                    usd_per_token: 0.00005,
                    usd_per_request: 0.005,
                    clp_per_token: 0.0475,
                    clp_per_request: 4.75,
                    category: 'very_low'
                },
                speed: 'very_fast'
            },
            specialties: [
                'quick_analysis',
                'basic_classification',
                'simple_summaries',
                'data_extraction',
                'batch_processing'
            ],
            use_cases: {
                primary: [
                    'batch_processing',
                    'quick_classification',
                    'data_extraction',
                    'simple_summaries'
                ],
                secondary: [
                    'preliminary_analysis',
                    'high_volume_processing',
                    'real_time_analysis'
                ]
            },
            parameters: {
                default: {
                    temperature: 0.2,
                    max_tokens: 500,
                    top_p: 0.9,
                    frequency_penalty: 0.1
                },
                fast: {
                    temperature: 0.1,
                    max_tokens: 300,
                    top_p: 0.8,
                    frequency_penalty: 0.0
                }
            }
        }
    },

    // Modelos Chutes - Especializados en OCR
    chutes: {
        'specialized-ocr': {
            id: 'specialized-ocr',
            name: 'Chutes Specialized OCR',
            provider: 'chutes',
            category: 'ocr_specialist',
            recommended: true,
            performance: {
                accuracy: 0.96,
                speed: 0.85,
                consistency: 0.94,
                reasoning: 0.80
            },
            capabilities: {
                context: 'variable',
                cost: {
                    usd_per_token: 0.00015,
                    usd_per_request: 0.015,
                    clp_per_token: 0.1425,
                    clp_per_request: 14.25,
                    category: 'medium'
                },
                speed: 'fast'
            },
            specialties: [
                'ocr_enhancement',
                'text_correction',
                'document_structure',
                'error_detection',
                'quality_improvement'
            ],
            use_cases: {
                primary: [
                    'ocr_post_processing',
                    'text_correction',
                    'quality_enhancement'
                ],
                secondary: [
                    'document_validation',
                    'error_correction',
                    'structure_analysis'
                ]
            },
            parameters: {
                default: {
                    temperature: 0.1,
                    max_tokens: 1000,
                    focus: 'accuracy'
                }
            }
        },
        'document-analyzer': {
            id: 'document-analyzer',
            name: 'Chutes Document Analyzer',
            provider: 'chutes',
            category: 'analysis_specialist',
            recommended: false,
            performance: {
                accuracy: 0.93,
                speed: 0.75,
                consistency: 0.91,
                reasoning: 0.87
            },
            capabilities: {
                context: 'variable',
                cost: {
                    usd_per_token: 0.00012,
                    usd_per_request: 0.012,
                    clp_per_token: 0.114,
                    clp_per_request: 11.4,
                    category: 'medium'
                },
                speed: 'medium'
            },
            specialties: [
                'document_classification',
                'content_extraction',
                'metadata_analysis',
                'domain_specific'
            ],
            use_cases: {
                primary: [
                    'document_classification',
                    'content_extraction',
                    'metadata_analysis'
                ],
                secondary: [
                    'domain_analysis',
                    'industry_specific',
                    'compliance_checking'
                ]
            }
        }
    }
};

// Estrategias de selección de modelos
const SELECTION_STRATEGIES = {
    auto: {
        name: 'Automática (Recomendada)',
        description: 'Selecciona automáticamente el mejor modelo según el documento',
        priority: ['accuracy', 'speed', 'cost'],
        rules: [
            {
                condition: 'ocr_confidence < 70',
                recommendation: 'mixtral-8x7b-32768',
                reason: 'OCR de baja calidad - máxima precisión requerida'
            },
            {
                condition: 'ocr_confidence < 85',
                recommendation: 'llama-3.3-70b-versatile',
                reason: 'OCR de calidad media - modelo balanceado ideal'
            },
            {
                condition: 'document_type in [legal, medical]',
                recommendation: 'mixtral-8x7b-32768',
                reason: 'Documento crítico - máxima precisión necesaria'
            },
            {
                condition: 'priority == speed',
                recommendation: 'llama-3.1-8b-instant',
                reason: 'Prioridad de velocidad - modelo más rápido'
            },
            {
                condition: 'default',
                recommendation: 'llama-3.3-70b-versatile',
                reason: 'Mejor balance general para la mayoría de casos'
            }
        ]
    },
    ocr_optimized: {
        name: 'Optimizada para OCR',
        description: 'Estrategia especializada para mejorar resultados OCR',
        priority: ['accuracy', 'consistency'],
        rules: [
            {
                condition: 'ocr_confidence < 60',
                recommendation: 'mixtral-8x7b-32768 + chutes-specialized-ocr',
                reason: 'OCR muy bajo - combinación de máxima precisión'
            },
            {
                condition: 'ocr_confidence < 80',
                recommendation: 'llama-3.3-70b-versatile + chutes-specialized-ocr',
                reason: 'OCR bajo - mejora con especialista OCR'
            },
            {
                condition: 'default',
                recommendation: 'llama-3.3-70b-versatile',
                reason: 'OCR aceptable - modelo principal suficiente'
            }
        ]
    },
    speed: {
        name: 'Máxima Velocidad',
        description: 'Prioriza velocidad sobre precisión',
        priority: ['speed', 'cost'],
        rules: [
            {
                condition: 'document_length > 3000',
                recommendation: 'llama-3.1-8b-instant',
                reason: 'Documento largo pero velocidad prioritaria'
            },
            {
                condition: 'default',
                recommendation: 'llama-3.1-8b-instant',
                reason: 'Máxima velocidad para todos los casos'
            }
        ]
    },
    accuracy: {
        name: 'Máxima Precisión',
        description: 'Prioriza precisión sobre velocidad',
        priority: ['accuracy', 'reasoning'],
        rules: [
            {
                condition: 'document_type in [legal, medical, technical]',
                recommendation: 'mixtral-8x7b-32768',
                reason: 'Documento crítico requiere máxima precisión'
            },
            {
                condition: 'ocr_confidence < 85',
                recommendation: 'mixtral-8x7b-32768',
                reason: 'OCR bajo necesita máxima precisión'
            },
            {
                condition: 'default',
                recommendation: 'mixtral-8x7b-32768',
                reason: 'Máxima precisión para todos los casos'
            }
        ]
    }
};

// Configuraciones por tipo de documento
const DOCUMENT_TYPE_CONFIGS = {
    general: {
        name: 'General',
        estimated_length: 1500,
        priority_factors: ['accuracy', 'speed'],
        recommended_model: 'llama-3.3-70b-versatile',
        parameters: {
            temperature: 0.2,
            max_tokens: 1500
        }
    },
    business: {
        name: 'Empresarial',
        estimated_length: 2000,
        priority_factors: ['accuracy', 'speed'],
        recommended_model: 'llama-3.3-70b-versatile',
        parameters: {
            temperature: 0.2,
            max_tokens: 1500
        }
    },
    legal: {
        name: 'Legal',
        estimated_length: 3500,
        priority_factors: ['accuracy', 'reasoning'],
        recommended_model: 'mixtral-8x7b-32768',
        parameters: {
            temperature: 0.1,
            max_tokens: 2000
        }
    },
    medical: {
        name: 'Médico',
        estimated_length: 2800,
        priority_factors: ['accuracy', 'reasoning'],
        recommended_model: 'mixtral-8x7b-32768',
        parameters: {
            temperature: 0.1,
            max_tokens: 2000
        }
    },
    financial: {
        name: 'Financiero',
        estimated_length: 1200,
        priority_factors: ['accuracy', 'consistency'],
        recommended_model: 'llama-3.3-70b-versatile',
        parameters: {
            temperature: 0.1,
            max_tokens: 1000
        }
    },
    academic: {
        name: 'Académico',
        estimated_length: 5000,
        priority_factors: ['reasoning', 'accuracy'],
        recommended_model: 'llama-3.3-70b-versatile',
        parameters: {
            temperature: 0.3,
            max_tokens: 2000
        }
    },
    technical: {
        name: 'Técnico',
        estimated_length: 3000,
        priority_factors: ['accuracy', 'reasoning'],
        recommended_model: 'mixtral-8x7b-32768',
        parameters: {
            temperature: 0.1,
            max_tokens: 2000
        }
    }
};

// Niveles de confianza OCR y estrategias
const OCR_CONFIDENCE_LEVELS = {
    very_high: {
        min: 90,
        max: 100,
        label: 'Muy Alta',
        color: 'success',
        strategy: 'speed',
        recommendation: 'OCR excelente - usar modelo rápido'
    },
    high: {
        min: 75,
        max: 89,
        label: 'Alta',
        color: 'info',
        strategy: 'auto',
        recommendation: 'OCR bueno - modelo balanceado ideal'
    },
    medium: {
        min: 60,
        max: 74,
        label: 'Media',
        color: 'warning',
        strategy: 'ocr_optimized',
        recommendation: 'OCR regular - necesita mejora con especialista'
    },
    low: {
        min: 30,
        max: 59,
        label: 'Baja',
        color: 'danger',
        strategy: 'accuracy',
        recommendation: 'OCR pobre - máxima precisión requerida'
    },
    very_low: {
        min: 0,
        max: 29,
        label: 'Muy Baja',
        color: 'danger',
        strategy: 'accuracy',
        recommendation: 'OCR muy pobre - combinación de modelos necesaria'
    }
};

// Funciones de utilidad
function getModelConfig(modelId) {
    for (const provider of Object.keys(AI_MODELS_CONFIG)) {
        if (AI_MODELS_CONFIG[provider][modelId]) {
            return AI_MODELS_CONFIG[provider][modelId];
        }
    }
    return null;
}

function getStrategyConfig(strategyName) {
    return SELECTION_STRATEGIES[strategyName] || SELECTION_STRATEGIES.auto;
}

function getDocumentTypeConfig(docType) {
    return DOCUMENT_TYPE_CONFIGS[docType] || DOCUMENT_TYPE_CONFIGS.general;
}

function getOCRConfidenceLevel(confidence) {
    for (const [key, level] of Object.entries(OCR_CONFIDENCE_LEVELS)) {
        if (confidence >= level.min && confidence <= level.max) {
            return { ...level, key };
        }
    }
    return OCR_CONFIDENCE_LEVELS.medium;
}

// Funciones de cálculo de costos
function calculateCostUSD(modelId, tokens) {
    const model = getModelConfig(modelId);
    if (!model || !model.capabilities.cost) return 0;
    
    const cost = model.capabilities.cost;
    return (tokens * cost.usd_per_token) + cost.usd_per_request;
}

function calculateCostCLP(modelId, tokens) {
    const model = getModelConfig(modelId);
    if (!model || !model.capabilities.cost) return 0;
    
    const cost = model.capabilities.cost;
    return (tokens * cost.clp_per_token) + cost.clp_per_request;
}

function getCostBreakdown(modelId, tokens) {
    const model = getModelConfig(modelId);
    if (!model || !model.capabilities.cost) return null;
    
    const cost = model.capabilities.cost;
    return {
        model: model.name,
        provider: model.provider,
        tokens: tokens,
        usd_per_token: cost.usd_per_token,
        usd_per_request: cost.usd_per_request,
        clp_per_token: cost.clp_per_token,
        clp_per_request: cost.clp_per_request,
        total_usd: (tokens * cost.usd_per_token) + cost.usd_per_request,
        total_clp: (tokens * cost.clp_per_token) + cost.clp_per_request,
        category: cost.category
    };
}

function getOptimalMaxTokens(documentType, strategy) {
    // Ajustar tokens máximos según el tipo de documento y estrategia
    const docConfig = getDocumentTypeConfig(documentType);
    const baseMaxTokens = docConfig.parameters.max_tokens;
    
    switch (strategy) {
        case 'accuracy':
            return Math.min(baseMaxTokens * 1.5, 8000); // Aumentar para más contexto
        case 'speed':
            return Math.max(baseMaxTokens * 0.7, 500); // Reducir para velocidad
        case 'ocr_optimized':
            return Math.min(baseMaxTokens * 1.2, 6000); // Ligeramente aumentado
        default:
            return baseMaxTokens;
    }
}

// Función principal de recomendación
function getOptimalModelConfig(options = {}) {
    const {
        documentType = 'general',
        ocrConfidence = 75,
        strategy = 'auto',
        priority = 'balanced',
        documentLength = 1500
    } = options;

    const docConfig = getDocumentTypeConfig(documentType);
    const strategyConfig = getStrategyConfig(strategy);
    const ocrLevel = getOCRConfidenceLevel(ocrConfidence);

    // Aplicar reglas de la estrategia
    let recommendation = strategyConfig.rules.find(rule => {
        if (rule.condition.includes('ocr_confidence')) {
            const match = rule.condition.match(/ocr_confidence\s*([<>=]+)\s*(\d+)/);
            if (match) {
                const operator = match[1];
                const value = parseInt(match[2]);
                return operator === '<' ? ocrConfidence < value : ocrConfidence >= value;
            }
        }
        if (rule.condition.includes('document_type')) {
            const match = rule.condition.match(/document_type\s*in\s*\[(.*?)\]/);
            if (match) {
                const types = match[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
                return types.includes(documentType);
            }
        }
        if (rule.condition === 'priority == speed') {
            return priority === 'speed';
        }
        if (rule.condition === 'default') {
            return true;
        }
        return false;
    });

    const modelId = recommendation.recommendation;
    const modelConfig = getModelConfig(modelId);

    // Calcular tokens óptimos
    const optimalMaxTokens = getOptimalMaxTokens(documentType, strategy);
    
    return {
        model: modelConfig,
        strategy: strategyConfig,
        document_type: docConfig,
        ocr_confidence: ocrLevel,
        recommendation: recommendation,
        parameters: {
            ...modelConfig.parameters.default,
            ...docConfig.parameters,
            max_tokens: optimalMaxTokens // Usar tokens optimizados
        },
        reasoning: recommendation.reason,
        cost_estimate: getCostBreakdown(modelId, optimalMaxTokens)
    };
}

module.exports = {
    AI_MODELS_CONFIG,
    SELECTION_STRATEGIES,
    DOCUMENT_TYPE_CONFIGS,
    OCR_CONFIDENCE_LEVELS,
    getModelConfig,
    getStrategyConfig,
    getDocumentTypeConfig,
    getOCRConfidenceLevel,
    getOptimalModelConfig,
    calculateCostUSD,
    calculateCostCLP,
    getCostBreakdown,
    getOptimalMaxTokens
};