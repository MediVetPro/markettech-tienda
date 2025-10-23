#!/usr/bin/env node

/**
 * Netlify Setup Helper
 * Ayuda a configurar el monitor de Netlify
 */

const https = require('https');
const readline = require('readline');

class NetlifySetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
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

  async getSites() {
    try {
      const response = await this.makeRequest('https://api.netlify.com/api/v1/sites');
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('❌ Error obteniendo sitios:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en request:', error.message);
      return null;
    }
  }

  async getSiteDeploys(siteId) {
    try {
      const response = await this.makeRequest(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('❌ Error obteniendo deploys:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo deploys:', error.message);
      return null;
    }
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  displaySites(sites) {
    console.log('\n📋 Sitios disponibles:');
    console.log('====================\n');
    
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name}`);
      console.log(`   ID: ${site.id}`);
      console.log(`   URL: ${site.url}`);
      console.log(`   Estado: ${site.state || 'N/A'}`);
      console.log('');
    });
  }

  async selectSite(sites) {
    const answer = await this.prompt(`Selecciona el número del sitio (1-${sites.length}): `);
    const index = parseInt(answer) - 1;
    
    if (index >= 0 && index < sites.length) {
      return sites[index];
    } else {
      console.log('❌ Selección inválida');
      return null;
    }
  }

  async testConnection(siteId) {
    console.log('\n🔍 Probando conexión...');
    
    const deploys = await this.getSiteDeploys(siteId);
    if (deploys && deploys.length > 0) {
      console.log('✅ Conexión exitosa!');
      console.log(`📊 Último deploy: ${deploys[0].id}`);
      console.log(`📅 Fecha: ${new Date(deploys[0].created_at).toLocaleString()}`);
      console.log(`📈 Estado: ${deploys[0].state}`);
      return true;
    } else {
      console.log('❌ No se pudieron obtener deploys');
      return false;
    }
  }

  generateEnvFile(siteId, accessToken) {
    const envContent = `# Netlify Monitor Configuration
NETLIFY_SITE_ID=${siteId}
NETLIFY_ACCESS_TOKEN=${accessToken}

# Para usar el monitor:
# npm run monitor
`;

    return envContent;
  }

  async setup() {
    console.log('🚀 Configuración del Monitor de Netlify');
    console.log('=====================================\n');

    console.log('📝 Para usar el monitor necesitas:');
    console.log('1. Un token de acceso de Netlify');
    console.log('2. El ID de tu sitio\n');

    console.log('🔑 Para obtener tu token de acceso:');
    console.log('1. Ve a https://app.netlify.com/user/applications');
    console.log('2. Crea un nuevo "Personal Access Token"');
    console.log('3. Copia el token generado\n');

    // Solicitar token
    this.accessToken = await this.prompt('Ingresa tu token de acceso de Netlify: ');
    
    if (!this.accessToken) {
      console.log('❌ Token requerido');
      this.rl.close();
      return;
    }

    // Obtener sitios
    console.log('\n🔍 Obteniendo tus sitios...');
    const sites = await this.getSites();
    
    if (!sites || sites.length === 0) {
      console.log('❌ No se encontraron sitios');
      this.rl.close();
      return;
    }

    this.displaySites(sites);
    
    // Seleccionar sitio
    const selectedSite = await this.selectSite(sites);
    if (!selectedSite) {
      this.rl.close();
      return;
    }

    console.log(`\n✅ Sitio seleccionado: ${selectedSite.name}`);
    console.log(`🆔 ID: ${selectedSite.id}`);

    // Probar conexión
    const connectionOk = await this.testConnection(selectedSite.id);
    
    if (connectionOk) {
      // Generar archivo de configuración
      const envContent = this.generateEnvFile(selectedSite.id, this.accessToken);
      
      console.log('\n📄 Configuración generada:');
      console.log('==========================');
      console.log(envContent);
      
      const saveFile = await this.prompt('\n¿Guardar en archivo .env.netlify? (y/n): ');
      
      if (saveFile.toLowerCase() === 'y' || saveFile.toLowerCase() === 'yes') {
        const fs = require('fs');
        fs.writeFileSync('.env.netlify', envContent);
        console.log('✅ Archivo .env.netlify creado');
        
        console.log('\n🚀 Para usar el monitor:');
        console.log('1. source .env.netlify');
        console.log('2. npm run monitor');
      }
    }

    this.rl.close();
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  const setup = new NetlifySetup();
  setup.setup();
}

module.exports = NetlifySetup;
