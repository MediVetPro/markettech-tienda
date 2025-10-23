#!/usr/bin/env node

/**
 * Netlify Build Monitor
 * Monitorea el estado del build en Netlify y detecta errores automáticamente
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'smartesh'; // Site ID de Netlify
const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN; // Token de acceso de Netlify
const CHECK_INTERVAL = 30000; // 30 segundos
const MAX_RETRIES = 10;

class NetlifyMonitor {
  constructor() {
    this.lastDeployId = null;
    this.retryCount = 0;
    this.isMonitoring = false;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
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

  async getSiteDeploys() {
    try {
      const response = await this.makeRequest(
        `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys`
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('❌ Error obteniendo deploys:', response.data);
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
        `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys/${deployId}`
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

  analyzeBuildLogs(logs) {
    const errors = [];
    const warnings = [];
    
    if (typeof logs === 'string') {
      const lines = logs.split('\n');
      
      lines.forEach((line, index) => {
        // Detectar errores de TypeScript
        if (line.includes('Type error:') || line.includes('Failed to compile')) {
          errors.push({
            type: 'TypeScript Error',
            line: index + 1,
            content: line.trim(),
            severity: 'error'
          });
        }
        
        // Detectar errores de build
        if (line.includes('Build failed') || line.includes('Failed during stage')) {
          errors.push({
            type: 'Build Error',
            line: index + 1,
            content: line.trim(),
            severity: 'error'
          });
        }
        
        // Detectar warnings
        if (line.includes('Warning:') || line.includes('⚠️')) {
          warnings.push({
            type: 'Warning',
            line: index + 1,
            content: line.trim(),
            severity: 'warning'
          });
        }
      });
    }
    
    return { errors, warnings };
  }

  generateFixSuggestions(errors) {
    const suggestions = [];
    
    errors.forEach(error => {
      if (error.content.includes('Property \'inventory\' does not exist')) {
        suggestions.push({
          type: 'Inventory Reference',
          file: this.extractFilePath(error.content),
          suggestion: 'Remove inventory references - inventory system was removed',
          fix: 'Replace inventory references with empty arrays or remove the code'
        });
      }
      
      if (error.content.includes('Property \'user\' does not exist on type \'UserPayload\'')) {
        suggestions.push({
          type: 'Auth Type Error',
          file: this.extractFilePath(error.content),
          suggestion: 'Fix UserPayload vs AuthResult type mismatch',
          fix: 'Use decoded.userId for UserPayload or decoded.user.userId for AuthResult'
        });
      }
      
      if (error.content.includes('Property \'userId\' does not exist on type \'AuthResult\'')) {
        suggestions.push({
          type: 'Auth Type Error',
          file: this.extractFilePath(error.content),
          suggestion: 'Fix AuthResult type usage',
          fix: 'Use decoded.user.userId for AuthResult type'
        });
      }
    });
    
    return suggestions;
  }

  extractFilePath(content) {
    const match = content.match(/\.\/([^:]+):(\d+):(\d+)/);
    return match ? match[1] : 'unknown';
  }

  async checkBuildStatus() {
    console.log('🔍 Verificando estado del build...');
    
    const deploys = await this.getSiteDeploys();
    if (!deploys || deploys.length === 0) {
      console.log('❌ No se encontraron deploys');
      return;
    }

    const latestDeploy = deploys[0];
    
    // Si es un nuevo deploy
    if (this.lastDeployId !== latestDeploy.id) {
      console.log(`🆕 Nuevo deploy detectado: ${latestDeploy.id}`);
      console.log(`📅 Fecha: ${new Date(latestDeploy.created_at).toLocaleString()}`);
      console.log(`📊 Estado: ${latestDeploy.state}`);
      
      this.lastDeployId = latestDeploy.id;
      
      // Si el deploy falló, analizar logs
      if (latestDeploy.state === 'error' || latestDeploy.state === 'failed') {
        console.log('❌ Deploy falló, analizando logs...');
        
        const deployDetails = await this.getDeployLogs(latestDeploy.id);
        if (deployDetails && deployDetails.logs) {
          const analysis = this.analyzeBuildLogs(deployDetails.logs);
          
          if (analysis.errors.length > 0) {
            console.log(`\n🚨 Se encontraron ${analysis.errors.length} errores:`);
            analysis.errors.forEach((error, index) => {
              console.log(`\n${index + 1}. ${error.type}:`);
              console.log(`   ${error.content}`);
            });
            
            const suggestions = this.generateFixSuggestions(analysis.errors);
            if (suggestions.length > 0) {
              console.log(`\n💡 Sugerencias de corrección:`);
              suggestions.forEach((suggestion, index) => {
                console.log(`\n${index + 1}. ${suggestion.type}:`);
                console.log(`   Archivo: ${suggestion.file}`);
                console.log(`   Problema: ${suggestion.suggestion}`);
                console.log(`   Solución: ${suggestion.fix}`);
              });
            }
          }
        }
      } else if (latestDeploy.state === 'ready') {
        console.log('✅ Deploy exitoso!');
        this.retryCount = 0;
      }
    } else {
      // Mismo deploy, verificar si cambió el estado
      if (latestDeploy.state === 'error' || latestDeploy.state === 'failed') {
        console.log('⏳ Deploy aún fallando...');
        this.retryCount++;
        
        if (this.retryCount >= MAX_RETRIES) {
          console.log('🛑 Máximo de reintentos alcanzado');
          this.isMonitoring = false;
        }
      }
    }
  }

  startMonitoring() {
    if (!NETLIFY_ACCESS_TOKEN) {
      console.error('❌ NETLIFY_ACCESS_TOKEN no configurado');
      console.log('💡 Configura tu token de acceso de Netlify:');
      console.log('   export NETLIFY_ACCESS_TOKEN="tu_token_aqui"');
      return;
    }

    console.log('🚀 Iniciando monitoreo de Netlify...');
    console.log(`📡 Site ID: ${NETLIFY_SITE_ID}`);
    console.log(`⏱️  Intervalo: ${CHECK_INTERVAL / 1000} segundos`);
    console.log('🛑 Presiona Ctrl+C para detener\n');

    this.isMonitoring = true;
    
    const monitor = async () => {
      if (this.isMonitoring) {
        await this.checkBuildStatus();
        setTimeout(monitor, CHECK_INTERVAL);
      }
    };

    monitor();
  }

  stopMonitoring() {
    console.log('\n🛑 Deteniendo monitoreo...');
    this.isMonitoring = false;
  }
}

// Manejo de señales para detener el monitoreo
process.on('SIGINT', () => {
  console.log('\n👋 Monitoreo detenido');
  process.exit(0);
});

// Iniciar monitoreo si se ejecuta directamente
if (require.main === module) {
  const monitor = new NetlifyMonitor();
  monitor.startMonitoring();
}

module.exports = NetlifyMonitor;
