#!/usr/bin/env node

/**
 * Code Analyzer
 * Analiza el código localmente para detectar problemas potenciales antes del build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeAnalyzer {
  constructor() {
    this.issues = [];
    this.projectRoot = process.cwd();
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // Detectar referencias a inventory (excluyendo comentarios explicativos)
      if (content.includes('inventory') && !filePath.includes('node_modules')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine.includes('inventory') && 
              !trimmedLine.includes('// inventory system removed') &&
              !trimmedLine.includes('// No inventory system') &&
              !trimmedLine.includes('// Inventory system removed') &&
              !trimmedLine.includes('inventory system removed') &&
              !trimmedLine.startsWith('//') &&
              !trimmedLine.startsWith('*')) {
            this.issues.push({
              type: 'Inventory Reference',
              file: relativePath,
              line: index + 1,
              content: trimmedLine,
              severity: 'error',
              suggestion: 'Remove inventory references - inventory system was removed'
            });
          }
        });
      }

      // Detectar problemas de tipos de autenticación (solo si hay conflicto real)
      if (content.includes('decoded.userId') && content.includes('decoded.user')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          // Solo reportar si hay uso mixto en la misma línea o archivo
          if (trimmedLine.includes('decoded.userId') && trimmedLine.includes('decoded.user') && 
              !trimmedLine.includes('//')) {
            this.issues.push({
              type: 'Auth Type Mismatch',
              file: relativePath,
              line: index + 1,
              content: trimmedLine,
              severity: 'warning',
              suggestion: 'Check if this file uses AuthResult (decoded.user.userId) or UserPayload (decoded.userId)'
            });
          }
        });
      }

      // Detectar merge conflicts
      if (content.includes('<<<<<<< HEAD') || content.includes('=======') || content.includes('>>>>>>>')) {
        this.issues.push({
          type: 'Merge Conflict',
          file: relativePath,
          line: 0,
          content: 'Merge conflict markers detected',
          severity: 'error',
          suggestion: 'Resolve merge conflicts before building'
        });
      }

      // Detectar imports de modelos eliminados
      const eliminatedModels = ['inventory', 'chat', 'whatsapp', 'coupon'];
      eliminatedModels.forEach(model => {
        if (content.includes(`prisma.${model}`) && !filePath.includes('node_modules')) {
          this.issues.push({
            type: 'Eliminated Model Reference',
            file: relativePath,
            line: 0,
            content: `Reference to eliminated model: ${model}`,
            severity: 'error',
            suggestion: `Remove references to ${model} model - it was eliminated`
          });
        }
      });

    } catch (error) {
      console.error(`❌ Error analizando ${filePath}:`, error.message);
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Saltar node_modules, .git, .next
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          // Analizar solo archivos TypeScript y JavaScript
          if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
            this.analyzeFile(fullPath);
          }
        }
      });
    } catch (error) {
      console.error(`❌ Error escaneando directorio ${dirPath}:`, error.message);
    }
  }

  runTypeCheck() {
    try {
      console.log('🔍 Ejecutando verificación de tipos...');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ Verificación de tipos exitosa');
      return true;
    } catch (error) {
      console.log('❌ Errores de TypeScript encontrados:');
      console.log(error.stdout?.toString() || error.message);
      return false;
    }
  }

  generateReport() {
    console.log('\n📊 REPORTE DE ANÁLISIS DE CÓDIGO');
    console.log('=====================================\n');

    if (this.issues.length === 0) {
      console.log('✅ No se encontraron problemas en el código');
      return;
    }

    // Agrupar por tipo
    const groupedIssues = this.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    }, {});

    Object.keys(groupedIssues).forEach(type => {
      console.log(`\n🚨 ${type} (${groupedIssues[type].length} problemas):`);
      groupedIssues[type].forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}:${issue.line}`);
        console.log(`   ${issue.content}`);
        console.log(`   💡 ${issue.suggestion}`);
      });
    });

    console.log(`\n📈 RESUMEN:`);
    console.log(`   Total de problemas: ${this.issues.length}`);
    console.log(`   Tipos únicos: ${Object.keys(groupedIssues).length}`);
  }

  async analyze() {
    console.log('🔍 Iniciando análisis de código...\n');
    
    // Escanear directorios principales
    const directoriesToScan = [
      'app',
      'lib',
      'components',
      'contexts',
      'hooks'
    ];

    directoriesToScan.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`📁 Escaneando ${dir}/...`);
        this.scanDirectory(dirPath);
      }
    });

    // Verificación de tipos
    const typeCheckPassed = this.runTypeCheck();
    
    // Generar reporte
    this.generateReport();

    // Solo fallar si hay errores críticos, no warnings
    const criticalIssues = this.issues.filter(issue => 
      issue.severity === 'error' && 
      !issue.type.includes('Auth Type Mismatch') // Los warnings de auth no son críticos
    );
    
    if (criticalIssues.length > 0 || !typeCheckPassed) {
      console.log('\n❌ Se encontraron problemas críticos que deben corregirse antes del build');
      process.exit(1);
    } else {
      console.log('\n✅ Código listo para build');
      if (this.issues.length > 0) {
        console.log(`⚠️  Se encontraron ${this.issues.length} warnings menores (no críticos)`);
      }
      process.exit(0);
    }
  }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
  const analyzer = new CodeAnalyzer();
  analyzer.analyze();
}

module.exports = CodeAnalyzer;
