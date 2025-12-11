#!/usr/bin/env node

/**
 * Script para crear las tablas de análisis faltantes
 */

const { supabaseClient } = require('./src/database/supabaseClient');

async function createAnalysisTables() {
  console.log('🔧 Creando tablas de análisis faltantes...\n');

  try {
    if (!supabaseClient.isInitialized()) {
      throw new Error('Supabase no está inicializado');
    }

    const supabase = supabaseClient.getClient();

    // 1. Crear tabla document_analyses
    console.log('📋 Creando tabla document_analyses...');
    const { error: analysesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.document_analyses (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
          user_int_id BIGINT NOT NULL,
          analysis_type TEXT NOT NULL DEFAULT 'basic',
          ai_model_used TEXT,
          ai_strategy TEXT,
          analysis_config JSONB DEFAULT '{}',
          processing_time_ms INTEGER DEFAULT 0,
          confidence_score DECIMAL(5,2) DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own analyses" ON public.document_analyses
            FOR SELECT USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

        CREATE POLICY "Users can create own analyses" ON public.document_analyses
            FOR INSERT WITH CHECK (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

        CREATE POLICY "Users can update own analyses" ON public.document_analyses
            FOR UPDATE USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);
      `
    });

    if (analysesError) {
      console.error('❌ Error creando document_analyses:', analysesError);
    } else {
      console.log('✅ Tabla document_analyses creada');
    }

    // 2. Crear tabla analysis_results_basic
    console.log('📋 Creando tabla analysis_results_basic...');
    const { error: basicError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analysis_results_basic (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
          page_count INTEGER DEFAULT 0,
          word_count INTEGER DEFAULT 0,
          character_count INTEGER DEFAULT 0,
          language_detected TEXT DEFAULT 'unknown',
          readability_score DECIMAL(5,2) DEFAULT 0,
          document_info JSONB DEFAULT '{}',
          statistics JSONB DEFAULT '{}',
          content JSONB DEFAULT '{}',
          structure JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        ALTER TABLE public.analysis_results_basic ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own basic results" ON public.analysis_results_basic
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );

        CREATE POLICY "Users can create own basic results" ON public.analysis_results_basic
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );
      `
    });

    if (basicError) {
      console.error('❌ Error creando analysis_results_basic:', basicError);
    } else {
      console.log('✅ Tabla analysis_results_basic creada');
    }

    // 3. Crear tabla analysis_results_advanced
    console.log('📋 Creando tabla analysis_results_advanced...');
    const { error: advancedError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analysis_results_advanced (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
          keywords JSONB DEFAULT '[]',
          phrases JSONB DEFAULT '[]',
          entities JSONB DEFAULT '[]',
          sentiment_analysis JSONB DEFAULT '{}',
          classification JSONB DEFAULT '{}',
          advanced_metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        ALTER TABLE public.analysis_results_advanced ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own advanced results" ON public.analysis_results_advanced
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );

        CREATE POLICY "Users can create own advanced results" ON public.analysis_results_advanced
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );
      `
    });

    if (advancedError) {
      console.error('❌ Error creando analysis_results_advanced:', advancedError);
    } else {
      console.log('✅ Tabla analysis_results_advanced creada');
    }

    // 4. Crear tabla analysis_results_ai
    console.log('📋 Creando tabla analysis_results_ai...');
    const { error: aiError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analysis_results_ai (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
          ai_model TEXT NOT NULL,
          ai_provider TEXT DEFAULT 'unknown',
          prompt_used TEXT,
          response_generated TEXT,
          tokens_used INTEGER DEFAULT 0,
          cost_usd DECIMAL(10,6) DEFAULT 0,
          processing_time_ms INTEGER DEFAULT 0,
          quality_metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        ALTER TABLE public.analysis_results_ai ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own AI results" ON public.analysis_results_ai
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );

        CREATE POLICY "Users can create own AI results" ON public.analysis_results_ai
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );
      `
    });

    if (aiError) {
      console.error('❌ Error creando analysis_results_ai:', aiError);
    } else {
      console.log('✅ Tabla analysis_results_ai creada');
    }

    // 5. Crear tabla analysis_metrics
    console.log('📋 Creando tabla analysis_metrics...');
    const { error: metricsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analysis_metrics (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
          processing_time_seconds DECIMAL(10,3) DEFAULT 0,
          processing_duration_ms INTEGER DEFAULT 0,
          api_calls_count INTEGER DEFAULT 0,
          tokens_used INTEGER DEFAULT 0,
          cache_hits INTEGER DEFAULT 0,
          total_cost DECIMAL(10,6) DEFAULT 0,
          memory_usage_mb INTEGER DEFAULT 0,
          cpu_usage_percent DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        ALTER TABLE public.analysis_metrics ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own metrics" ON public.analysis_metrics
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );

        CREATE POLICY "Users can create own metrics" ON public.analysis_metrics
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.document_analyses da 
                WHERE da.id = analysis_id 
                AND current_setting('app.current_user_id', true)::BIGINT = da.user_int_id
              )
            );
      `
    });

    if (metricsError) {
      console.error('❌ Error creando analysis_metrics:', metricsError);
    } else {
      console.log('✅ Tabla analysis_metrics creada');
    }

    console.log('\n🎉 ¡Todas las tablas de análisis creadas exitosamente!');
    console.log('✅ Los análisis ahora se podrán guardar completamente en la base de datos');

  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  }
}

// Ejecutar creación de tablas
createAnalysisTables();