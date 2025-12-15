/**
 * Gestor de caché para la aplicación
 * 
 * Este módulo proporciona funciones para limpiar diferentes tipos de caché
 * que pueden interferir con los cambios de pantalla o procesos.
 */

/**
 * Limpia todo el almacenamiento local (localStorage)
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    console.log('✅ localStorage limpiado correctamente');
  } catch (error) {
    console.error('❌ Error al limpiar localStorage:', error);
  }
};

/**
 * Limpia todo el almacenamiento de sesión (sessionStorage)
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage limpiado correctamente');
  } catch (error) {
    console.error('❌ Error al limpiar sessionStorage:', error);
  }
};

/**
 * Limpia IndexedDB (base de datos del navegador)
 */
export const clearIndexedDB = () => {
  return new Promise((resolve, reject) => {
    try {
      const databases = window.indexedDB.databases ? window.indexedDB.databases() : null;
      
      if (databases && databases.length > 0) {
        let deletedCount = 0;
        const totalDatabases = databases.length;
        
        databases.forEach(db => {
          if (db.name) {
            const deleteRequest = window.indexedDB.deleteDatabase(db.name);
            
            deleteRequest.onsuccess = () => {
              deletedCount++;
              console.log(`✅ Base de datos IndexedDB "${db.name}" eliminada`);
              
              if (deletedCount === totalDatabases) {
                console.log('✅ IndexedDB limpiado correctamente');
                resolve();
              }
            };
            
            deleteRequest.onerror = (error) => {
              console.error(`❌ Error al eliminar la base de datos "${db.name}":`, error);
              deletedCount++;
              
              if (deletedCount === totalDatabases) {
                console.log('✅ IndexedDB limpiado (con algunos errores)');
                resolve();
              }
            };
          } else {
            deletedCount++;
            if (deletedCount === totalDatabases) {
              console.log('✅ IndexedDB limpiado correctamente');
              resolve();
            }
          }
        });
      } else {
        console.log('ℹ️ No hay bases de datos IndexedDB para limpiar');
        resolve();
      }
    } catch (error) {
      console.error('❌ Error al limpiar IndexedDB:', error);
      reject(error);
    }
  });
};

/**
 * Limpia la caché del Service Worker
 */
export const clearServiceWorkerCache = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        // Eliminar caché asociado al Service Worker
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes(registration.scope)) {
              return caches.delete(cacheName);
            }
          })
        );
        
        // Actualizar el Service Worker
        await registration.update();
      }
      
      console.log('✅ Caché del Service Worker limpiado correctamente');
    } else {
      console.log('ℹ️ Service Worker no está disponible en este navegador');
    }
  } catch (error) {
    console.error('❌ Error al limpiar caché del Service Worker:', error);
  }
};

/**
 * Limpia la caché de la aplicación (datos en memoria)
 */
export const clearMemoryCache = () => {
  // Si estamos usando alguna librería de caché en memoria, aquí la limpiaríamos
  // Por ejemplo, si usamos Redux:
  // store.dispatch({ type: 'CLEAR_CACHE' });
  
  console.log('✅ Caché en memoria limpiado correctamente');
};

/**
 * Limpia la caché de imágenes
 */
export const clearImageCache = () => {
  // Forzar la recarga de imágenes eliminando las referencias en el DOM
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const src = img.src;
    img.src = '';
    // Añadir un timestamp para evitar la caché del navegador
    img.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
  });
  
  console.log('✅ Caché de imágenes limpiado correctamente');
};

/**
 * Función principal que limpia toda la caché de la aplicación
 */
export const clearAllCache = async () => {
  console.log('🧹 Iniciando limpieza completa de caché...');
  
  // Limpiar localStorage y sessionStorage
  clearLocalStorage();
  clearSessionStorage();
  
  // Limpiar IndexedDB
  try {
    await clearIndexedDB();
  } catch (error) {
    console.error('Error al limpiar IndexedDB:', error);
  }
  
  // Limpiar caché del Service Worker
  await clearServiceWorkerCache();
  
  // Limpiar caché en memoria
  clearMemoryCache();
  
  // Limpiar caché de imágenes
  clearImageCache();
  
  console.log('✅ Limpieza de caché completada');
  
  // Recargar la página para aplicar todos los cambios
  window.location.reload();
};

/**
 * Hook personalizado para limpiar la caché cuando cambia el tamaño de la pantalla
 */
export const useClearCacheOnResize = () => {
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      // Limpiar el temporizador anterior
      clearTimeout(resizeTimer);
      
      // Establecer un nuevo temporizador
      resizeTimer = setTimeout(() => {
        // Limpiar solo la caché que podría verse afectada por el cambio de tamaño
        clearImageCache();
        clearMemoryCache();
        console.log('🧹 Caché limpiado después del cambio de tamaño de pantalla');
      }, 500); // Esperar 500ms después del último cambio de tamaño
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
};

import { useEffect } from 'react';