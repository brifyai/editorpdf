#!/usr/bin/env node

/**
 * Script para verificar el estado de la migración
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    try {
        console.log('🔍 Verificando estado post-migración...\n');

        // Verificar tabla users
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, email, username')
                .limit(1);
            
            if (usersError) {
                console.log('❌ Error accediendo a tabla users:', usersError.message);
            } else {
                console.log('✅ Tabla users accesible');
                console.log(`   - Estructura: ${Object.keys(usersData[0] || {}).join(', ')}`);
            }
        } catch (e) {
            console.log('❌ Error verificando users:', e.message);
        }

        // Verificar tabla profiles
        try {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email')
                .limit(1);
            
            if (profilesError) {
                if (profilesError.message.includes('does not exist')) {
                    console.log('✅ Tabla profiles eliminada correctamente');
                } else {
                    console.log('❌ Error accediendo a tabla profiles:', profilesError.message);
                }
            } else {
                console.log('⚠️  Tabla profiles todavía existe');
                console.log(`   - Estructura: ${Object.keys(profilesData[0] || {}).join(', ')}`);
            }
        } catch (e) {
            console.log('❌ Error verificando profiles:', e.message);
        }

        // Verificar tabla documents
        try {
            const { data: docsData, error: docsError } = await supabase
                .from('documents')
                .select('id, user_int_id')
                .limit(1);
            
            if (docsError) {
                console.log('❌ Error accediendo a tabla documents:', docsError.message);
            } else {
                console.log('✅ Tabla documents accesible');
                console.log(`   - Campos: ${Object.keys(docsData[0] || {}).join(', ')}`);
                
                // Verificar si tiene user_int_id
                if (docsData[0] && 'user_int_id' in docsData[0]) {
                    console.log('   ✅ Campo user_int_id presente');
                } else {
                    console.log('   ❌ Campo user_int_id ausente');
                }
                
                // Verificar si todavía tiene user_id
                if (docsData[0] && 'user_id' in docsData[0]) {
                    console.log('   ⚠️  Campo user_id todavía presente');
                } else {
                    console.log('   ✅ Campo user_id eliminado');
                }
            }
        } catch (e) {
            console.log('❌ Error verificando documents:', e.message);
        }

        // Verificar tabla document_analyses
        try {
            const { data: analysesData, error: analysesError } = await supabase
                .from('document_analyses')
                .select('id, user_int_id')
                .limit(1);
            
            if (analysesError) {
                console.log('❌ Error accediendo a tabla document_analyses:', analysesError.message);
            } else {
                console.log('✅ Tabla document_analyses accesible');
                console.log(`   - Campos: ${Object.keys(analysesData[0] || {}).join(', ')}`);
                
                // Verificar si tiene user_int_id
                if (analysesData[0] && 'user_int_id' in analysesData[0]) {
                    console.log('   ✅ Campo user_int_id presente');
                } else {
                    console.log('   ❌ Campo user_int_id ausente');
                }
                
                // Verificar si todavía tiene user_id
                if (analysesData[0] && 'user_id' in analysesData[0]) {
                    console.log('   ⚠️  Campo user_id todavía presente');
                } else {
                    console.log('   ✅ Campo user_id eliminado');
                }
            }
        } catch (e) {
            console.log('❌ Error verificando document_analyses:', e.message);
        }

        // Verificar vista user_document_summary
        try {
            const { data: viewData, error: viewError } = await supabase
                .from('user_document_summary')
                .select('user_int_id, email')
                .limit(1);
            
            if (viewError) {
                console.log('❌ Error accediendo a vista user_document_summary:', viewError.message);
            } else {
                console.log('✅ Vista user_document_summary accesible');
                console.log(`   - Campos: ${Object.keys(viewData[0] || {}).join(', ')}`);
            }
        } catch (e) {
            console.log('❌ Error verificando vista user_document_summary:', e.message);
        }

        console.log('\n🎯 Verificación completada');

    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

verifyMigration();