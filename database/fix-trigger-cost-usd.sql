-- =====================================================
-- CORRECCIÓN CRÍTICA: Trigger update_usage_statistics
-- =====================================================
-- El problema: el trigger intenta acceder a NEW.cost_usd en la tabla document_analyses
-- pero ese campo no existe allí, solo existe en ai_model_metrics

-- Eliminar el trigger incorrecto
DROP TRIGGER IF EXISTS update_stats_on_analysis ON public.document_analyses;

-- Eliminar la función incorrecta
DROP FUNCTION IF EXISTS public.update_usage_statistics();

-- Crear función corregida que no usa cost_usd de document_analyses
CREATE OR REPLACE FUNCTION public.update_usage_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_statistics (
        user_id, 
        date, 
        documents_processed
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        1
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        documents_processed = usage_statistics.documents_processed + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger corregido
CREATE TRIGGER update_stats_on_analysis
    AFTER INSERT ON public.document_analyses
    FOR EACH ROW EXECUTE FUNCTION public.update_usage_statistics();

-- Crear una función separada para actualizar estadísticas de costos desde ai_model_metrics
CREATE OR REPLACE FUNCTION public.update_cost_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_statistics (
        user_id, 
        date, 
        total_cost_usd
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        COALESCE(NEW.cost_usd, 0)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_cost_usd = usage_statistics.total_cost_usd + COALESCE(NEW.cost_usd, 0),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar costos desde ai_model_metrics
CREATE TRIGGER update_cost_stats_on_ai_metric
    AFTER INSERT ON public.ai_model_metrics
    FOR EACH ROW EXECUTE FUNCTION public.update_cost_statistics();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Confirmar que los triggers están creados correctamente
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname IN ('update_stats_on_analysis', 'update_cost_stats_on_ai_metric');

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger corregido exitosamente';
    RAISE NOTICE '   - update_stats_on_analysis ya no intenta acceder a cost_usd en document_analyses';
    RAISE NOTICE '   - update_cost_stats_on_ai_metric maneja los costos desde ai_model_metrics';
    RAISE NOTICE '   - Las estadísticas se actualizarán correctamente desde ambas tablas';
END $$;