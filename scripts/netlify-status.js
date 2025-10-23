#!/usr/bin/env node

/**
 * Netlify Status Checker
 * Verifica el estado del último build en Netlify
 */

const https = require('https');

class NetlifyStatusChecker {
  constructor() {
    this.siteId = process.env.NETLIFY_SITE_ID || 'smartesh';
    this.accessToken = process.env.NETLIFY_ACCESS_TOKEN;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async getLatestDeploy() {
    try {
      const response = await this.makeRequest(
        `https://api.netlify.com/api/v1/sites/${this.siteId}/deploys?per_page=1`
      );
      
      if (response.status === 200 && response.data.length > 0) {
        return response.data[0];
      } else {
        console.error('❌ Error obteniendo deploy:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en request:', error.message);
      return null;
    }
  }

  async getDeployLogs(deployId) {
    try {
      const response = await this.makeRequest(
        `https://api.netlify.com/api/v1/sites/${this.siteId}/deploys/${deployId}`
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('❌ Error obteniendo logs:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo logs:', error.message);
      return null;
    }
  }

  formatStatus(status) {
    const statusMap = {
      'building': '🔨 Construyendo',
      'ready': '✅ Listo',
      'error': '❌ Error',
      'failed': '❌ Falló',
      'queued': '⏳ En cola',
      'cancelled': '🚫 Cancelado'
    };
    
    return statusMap[status] || `❓ ${status}`;
  }

  analyzeLogs(logs) {
    if (!logs) return { errors: [], warnings: [] };
    
    const errors = [];
    const warnings = [];
    
    if (typeof logs === 'string') {
      const lines = logs.split('\n');
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Detectar errores de TypeScript
        if (trimmedLine.includes('Type error:') || trimmedLine.includes('Failed to compile')) {
          errors.push({
            line: index + 1,
            content: trimmedLine,
            type: 'TypeScript Error'
          });
        }
        
        // Detectar errores de build
        if (trimmedLine.includes('Build failed') || trimmedLine.includes('Failed during stage')) {
          errors.push({
            line: index + 1,
            content: trimmedLine,
            type: 'Build Error'
          });
        }
        
        // Detectar warnings
        if (trimmedLine.includes('Warning:') || trimmedLine.includes('⚠️')) {
          warnings.push({
            line: index + 1,
            content: trimmedLine,
            type: 'Warning'
          });
        }
      });
    }
    
    return { errors, warnings };
  }

  generateSuggestions(errors) {
    const suggestions = [];
    
    errors.forEach(error => {
      if (error.content.includes('Property \'inventory\' does not exist')) {
        suggestions.push('🔧 Eliminar referencias a inventory - el sistema fue removido');
      }
      
      if (error.content.includes('Property \'user\' does not exist on type \'UserPayload\'')) {
        suggestions.push('🔧 Usar decoded.userId para UserPayload o decoded.user.userId para AuthResult');
      }
      
      if (error.content.includes('Property \'userId\' does not exist on type \'AuthResult\'')) {
        suggestions.push('🔧 Usar decoded.user.userId para AuthResult');
      }
      
      if (error.content.includes('Merge conflict')) {
        suggestions.push('🔧 Resolver conflictos de merge en el código');
      }
    });
    
    return [...new Set(suggestions)]; // Eliminar duplicados
  }

  async checkStatus() {
    console.log('🔍 Verificando estado del build en Netlify...\n');
    
    if (!this.accessToken) {
      console.log('❌ NETLIFY_ACCESS_TOKEN no configurado');
      console.log('💡 Para configurar:');
      console.log('   1. Ve a https://app.netlify.com/user/applications');
      console.log('   2. Crea un Personal Access Token');
      console.log('   3. export NETLIFY_ACCESS_TOKEN="tu_token"');
      console.log('   4. npm run netlify:status');
      return;
    }

    const deploy = await this.getLatestDeploy();
    if (!deploy) {
      console.log('❌ No se pudo obtener información del deploy');
      return;
    }

    console.log('📊 Información del Deploy:');
    console.log('==========================');
    console.log(`🆔 ID: ${deploy.id}`);
    console.log(`📅 Fecha: ${new Date(deploy.created_at).toLocaleString()}`);
    console.log(`📈 Estado: ${this.formatStatus(deploy.state)}`);
    console.log(`🔗 URL: ${deploy.deploy_url || 'N/A'}`);
    console.log(`⏱️  Duración: ${deploy.deploy_time ? `${deploy.deploy_time}s` : 'N/A'}`);
    
    if (deploy.commit_ref) {
      console.log(`📝 Commit: ${deploy.commit_ref.substring(0, 8)}`);
    }
    
    if (deploy.branch) {
      console.log(`🌿 Branch: ${deploy.branch}`);
    }

    // Si el deploy falló, analizar logs
    if (deploy.state === 'error' || deploy.state === 'failed') {
      console.log('\n🚨 Deploy falló, analizando logs...');
      
      const deployDetails = await this.getDeployLogs(deploy.id);
      if (deployDetails && deployDetails.logs) {
        const analysis = this.analyzeLogs(deployDetails.logs);
        
        if (analysis.errors.length > 0) {
          console.log(`\n❌ Se encontraron ${analysis.errors.length} errores:`);
          analysis.errors.slice(0, 5).forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.type}:`);
            console.log(`   ${error.content}`);
          });
          
          const suggestions = this.generateSuggestions(analysis.errors);
          if (suggestions.length > 0) {
            console.log('\n💡 Sugerencias de corrección:');
            suggestions.forEach((suggestion, index) => {
              console.log(`${index + 1}. ${suggestion}`);
            });
          }
        }
        
        if (analysis.warnings.length > 0) {
          console.log(`\n⚠️  Se encontraron ${analysis.warnings.length} warnings`);
        }
      }
    } else if (deploy.state === 'ready') {
      console.log('\n✅ ¡Deploy exitoso! Tu sitio está listo.');
    } else if (deploy.state === 'building') {
      console.log('\n🔨 Deploy en progreso...');
    }

    console.log('\n🔄 Para monitoreo continuo: npm run monitor');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const checker = new NetlifyStatusChecker();
  checker.checkStatus();
}

module.exports = NetlifyStatusChecker;
