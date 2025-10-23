#!/usr/bin/env node

/**
 * Netlify Simple Monitor
 * Monitorea el estado del build usando información del repositorio
 */

const { execSync } = require('child_process');
const fs = require('fs');

class NetlifySimpleMonitor {
  constructor() {
    this.siteUrl = 'https://smartesh.netlify.app';
    this.repoUrl = 'https://github.com/MediVetPro/markettech-tienda';
  }

  async checkBuildStatus() {
    console.log('🔍 Verificando estado del build...\n');
    
    try {
      // Verificar si hay cambios pendientes
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        console.log('⚠️  Hay cambios sin commitear:');
        console.log(gitStatus);
        console.log('💡 Considera hacer commit de los cambios antes del build\n');
      } else {
        console.log('✅ No hay cambios pendientes\n');
      }

      // Verificar el último commit
      const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
      console.log(`📝 Último commit: ${lastCommit}`);

      // Verificar si el repositorio está actualizado
      try {
        execSync('git fetch origin', { encoding: 'utf8' });
        const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
        
        if (localCommit === remoteCommit) {
          console.log('✅ Repositorio actualizado con origin/main');
        } else {
          console.log('⚠️  Repositorio local no está actualizado con origin/main');
          console.log('💡 Considera hacer git pull origin main\n');
        }
      } catch (error) {
        console.log('⚠️  No se pudo verificar el estado del repositorio remoto');
      }

      // Verificar configuración de Netlify
      if (fs.existsSync('netlify.toml')) {
        console.log('✅ Archivo netlify.toml encontrado');
      } else {
        console.log('⚠️  Archivo netlify.toml no encontrado');
      }

      // Verificar variables de entorno
      if (fs.existsSync('.env.local')) {
        console.log('✅ Archivo .env.local encontrado');
      } else {
        console.log('⚠️  Archivo .env.local no encontrado');
      }

      // Análisis de código
      console.log('\n🔍 Ejecutando análisis de código...');
      try {
        execSync('npm run analyze', { stdio: 'pipe' });
        console.log('✅ Análisis de código exitoso');
      } catch (error) {
        console.log('❌ Análisis de código falló:');
        console.log(error.stdout?.toString() || error.message);
      }

      // Verificar si el sitio está accesible
      console.log('\n🌐 Verificando accesibilidad del sitio...');
      try {
        const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${this.siteUrl}`, { encoding: 'utf8' });
        if (response === '200') {
          console.log(`✅ Sitio accesible: ${this.siteUrl}`);
        } else {
          console.log(`⚠️  Sitio no accesible (código: ${response}): ${this.siteUrl}`);
        }
      } catch (error) {
        console.log(`⚠️  No se pudo verificar la accesibilidad del sitio: ${this.siteUrl}`);
      }

      // Resumen y recomendaciones
      console.log('\n📊 RESUMEN:');
      console.log('===========');
      console.log(`🔗 Sitio: ${this.siteUrl}`);
      console.log(`📁 Repositorio: ${this.repoUrl}`);
      console.log('💡 Para monitoreo completo, configura el token de Netlify:');
      console.log('   1. Ve a https://app.netlify.com/user/applications');
      console.log('   2. Crea un Personal Access Token');
      console.log('   3. export NETLIFY_ACCESS_TOKEN="tu_token"');
      console.log('   4. npm run netlify:status');

    } catch (error) {
      console.error('❌ Error verificando estado:', error.message);
    }
  }

  async monitor() {
    console.log('🚀 Monitor Simple de Netlify');
    console.log('============================\n');
    
    await this.checkBuildStatus();
    
    console.log('\n🔄 Para monitoreo continuo, ejecuta:');
    console.log('   npm run monitor');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const monitor = new NetlifySimpleMonitor();
  monitor.monitor();
}

module.exports = NetlifySimpleMonitor;
