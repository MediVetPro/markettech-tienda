const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// URLs de imágenes reales específicas para cada producto
const realProductImages = {
  // Smartphones - Imágenes reales de productos específicos
  'iPhone 15 Pro Max 256GB': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
  'Samsung Galaxy S24 Ultra 512GB': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80',
  'Google Pixel 8 Pro 256GB': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&q=80',
  'OnePlus 12 256GB': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80',
  'Xiaomi 14 Ultra 512GB': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
  
  // Laptops - Imágenes reales de laptops
  'MacBook Pro M3 14" 512GB': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  'Dell XPS 15 9520 i7 32GB': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Strix G15 Gaming': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  'HP Spectre x360 16" 2-in-1': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200&h=800&fit=crop&q=80',
  'Lenovo ThinkPad X1 Carbon Gen 11': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  
  // Audio - Imágenes reales de auriculares
  'Sony WH-1000XM5 Auriculares': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  'AirPods Pro 2da Generación': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80',
  'Bose QuietComfort 45': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  'Sennheiser HD 660S': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80',
  'Audio-Technica ATH-M50xBT2': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  
  // Cameras - Imágenes reales de cámaras
  'Canon EOS R5 Cámara Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Sony A7 IV Full Frame': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Nikon Z6 III Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Fujifilm X-T5 Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Panasonic Lumix GH6': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  
  // Gaming - Imágenes reales de consolas
  'PlayStation 5 Console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Xbox Series X Console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Nintendo Switch OLED': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Steam Deck 512GB': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Ally Gaming Handheld': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  
  // Wearables - Imágenes reales de smartwatches
  'Apple Watch Series 9 GPS': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Samsung Galaxy Watch 6 Classic': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Garmin Fenix 7X Solar': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Fitbit Versa 4 Fitness Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Amazfit GTR 4 Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  
  // Chargers - Imágenes reales de cargadores
  'Anker PowerCore 26800 PowerBank': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Apple MagSafe Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Samsung 25W Super Fast Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Belkin Boost Charge Pro 3-in-1': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'RAVPower 65W GaN Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Cables - Imágenes reales de cables
  'Anker PowerLine III USB-C Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Apple Lightning to USB-C Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'UGREEN USB-C to HDMI Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Anker PowerLine III Lightning Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Cable Matters USB-C Hub': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Gadgets - Imágenes reales de gadgets
  'Apple AirTag 4-Pack': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Tile Pro Bluetooth Tracker': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Ring Video Doorbell Pro 2': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Nest Hub 2nd Gen': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Amazon Echo Dot 5th Gen': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Computer Parts - Imágenes reales de componentes
  'ASUS ROG Strix B550-F Gaming': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'MSI MAG B550 Tomahawk': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Gigabyte X570 AORUS Elite': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'ASRock B450M Pro4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'MSI MPG Z690 Edge WiFi': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Monitors - Imágenes reales de monitores
  'Samsung Odyssey G7 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'LG UltraGear 24" 1080p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Swift PG32UQX 32" 4K': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'Dell UltraSharp U2720Q 27" 4K': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'BenQ EX2780Q 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  
  // Storage - Imágenes reales de almacenamiento
  'Samsung 980 PRO 1TB NVMe': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'WD Blue SN570 500GB NVMe': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Crucial MX4 1TB SATA SSD': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Seagate BarraCuda 2TB HDD': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'SanDisk Extreme Pro 1TB': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Graphics Cards - Imágenes reales de tarjetas gráficas
  'NVIDIA GeForce RTX 4070': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Radeon RX 6700 XT': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'NVIDIA GeForce RTX 4090': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Radeon RX 7800 XT': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'NVIDIA GeForce RTX 3060 Ti': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Processors - Imágenes reales de procesadores
  'AMD Ryzen 7 7700X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Intel Core i5-13400F': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Ryzen 9 7950X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Intel Core i7-13700K': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Ryzen 5 7600X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Memory - Imágenes reales de memoria RAM
  'Corsair Vengeance LPX 32GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'G.Skill Trident Z RGB 16GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Corsair Dominator Platinum 64GB DDR5': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Kingston Fury Beast 32GB DDR5': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'TeamGroup T-Force Delta RGB 16GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Power Supplies - Imágenes reales de fuentes de poder
  'Corsair RM850x 850W 80+ Gold': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'EVGA SuperNOVA 650W 80+ Gold': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Seasonic Focus GX-750 750W': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Thermaltake Toughpower GF1 1000W': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Cooler Master V750 Gold V2': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Cooling - Imágenes reales de refrigeración
  'Noctua NH-D15 Chromax Black': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Corsair H100i RGB Elite': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Cooler Master Hyper 212 RGB': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Arctic Liquid Freezer II 280': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'be quiet! Dark Rock Pro 4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
}

// Productos por categoría
const productsByCategory = {
  smartphones: [
    { title: 'iPhone 15 Pro Max 256GB', price: 1299.99, description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.' },
    { title: 'Samsung Galaxy S24 Ultra 512GB', price: 1199.99, description: 'Smartphone premium con S Pen, cámara de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.' },
    { title: 'Google Pixel 8 Pro 256GB', price: 999.99, description: 'Teléfono inteligente con IA avanzada, cámara de 50MP y pantalla OLED de 6.7 pulgadas.' },
    { title: 'OnePlus 12 256GB', price: 799.99, description: 'Smartphone de alto rendimiento con Snapdragon 8 Gen 3 y pantalla Fluid AMOLED de 6.82 pulgadas.' },
    { title: 'Xiaomi 14 Ultra 512GB', price: 899.99, description: 'Teléfono flagship con cámara Leica de 50MP y pantalla AMOLED de 6.73 pulgadas.' }
  ],
  laptops: [
    { title: 'MacBook Pro M3 14" 512GB', price: 1999.99, description: 'Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 22 horas de batería.' },
    { title: 'Dell XPS 15 9520 i7 32GB', price: 1899.99, description: 'Laptop premium con procesador Intel i7, 32GB RAM, RTX 3050 Ti y pantalla 4K OLED de 15.6 pulgadas.' },
    { title: 'ASUS ROG Strix G15 Gaming', price: 1299.99, description: 'Laptop gaming con AMD Ryzen 7, RTX 4060, 16GB RAM y pantalla 144Hz de 15.6 pulgadas.' },
    { title: 'HP Spectre x360 16" 2-in-1', price: 1499.99, description: 'Laptop convertible con Intel i7, 16GB RAM, pantalla 4K táctil de 16 pulgadas y diseño premium.' },
    { title: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 1699.99, description: 'Laptop empresarial ultraligera con Intel i7, 16GB RAM y pantalla 14 pulgadas 2.8K.' }
  ],
  audio: [
    { title: 'Sony WH-1000XM5 Auriculares', price: 399.99, description: 'Auriculares inalámbricos premium con cancelación de ruido líder en la industria y 30 horas de batería.' },
    { title: 'AirPods Pro 2da Generación', price: 249.99, description: 'Auriculares inalámbricos con cancelación de ruido adaptativa y audio espacial personalizado.' },
    { title: 'Bose QuietComfort 45', price: 329.99, description: 'Auriculares con cancelación de ruido de clase mundial y sonido equilibrado para música y llamadas.' },
    { title: 'Sennheiser HD 660S', price: 499.99, description: 'Auriculares de estudio de alta fidelidad con transductores dinámicos de 150 ohmios.' },
    { title: 'Audio-Technica ATH-M50xBT2', price: 199.99, description: 'Auriculares inalámbricos profesionales con drivers de 45mm y hasta 50 horas de batería.' }
  ],
  cameras: [
    { title: 'Canon EOS R5 Cámara Mirrorless', price: 3899.99, description: 'Cámara profesional con sensor de 45MP, grabación 8K y estabilización de imagen de 5 ejes.' },
    { title: 'Sony A7 IV Full Frame', price: 2499.99, description: 'Cámara mirrorless con sensor de 33MP, grabación 4K y autofoco híbrido de 759 puntos.' },
    { title: 'Nikon Z6 III Mirrorless', price: 1999.99, description: 'Cámara profesional con sensor de 24.5MP, grabación 4K y sistema de estabilización VR.' },
    { title: 'Fujifilm X-T5 Mirrorless', price: 1699.99, description: 'Cámara con sensor de 40.2MP, grabación 6K y diseño retro con controles manuales.' },
    { title: 'Panasonic Lumix GH6', price: 2199.99, description: 'Cámara Micro Four Thirds con grabación 5.7K, estabilización de imagen y diseño robusto.' }
  ],
  gaming: [
    { title: 'PlayStation 5 Console', price: 499.99, description: 'Consola de videojuegos de nueva generación con SSD ultra-rápido y ray tracing.' },
    { title: 'Xbox Series X Console', price: 499.99, description: 'Consola más potente de Microsoft con 4K nativo, 120fps y Quick Resume.' },
    { title: 'Nintendo Switch OLED', price: 349.99, description: 'Consola híbrida con pantalla OLED de 7 pulgadas y 64GB de almacenamiento.' },
    { title: 'Steam Deck 512GB', price: 649.99, description: 'Handheld gaming PC con AMD APU, pantalla táctil de 7 pulgadas y SteamOS.' },
    { title: 'ASUS ROG Ally Gaming Handheld', price: 699.99, description: 'Dispositivo gaming portátil con AMD Ryzen Z1 y Windows 11.' }
  ],
  wearables: [
    { title: 'Apple Watch Series 9 GPS', price: 399.99, description: 'Smartwatch con chip S9, pantalla Always-On Retina y seguimiento avanzado de salud.' },
    { title: 'Samsung Galaxy Watch 6 Classic', price: 349.99, description: 'Reloj inteligente con Wear OS, monitor de salud avanzado y diseño clásico con bisel giratorio.' },
    { title: 'Garmin Fenix 7X Solar', price: 799.99, description: 'Reloj deportivo con GPS, carga solar y seguimiento de múltiples deportes.' },
    { title: 'Fitbit Versa 4 Fitness Smartwatch', price: 199.99, description: 'Smartwatch fitness con GPS, monitor de sueño y hasta 6 días de batería.' },
    { title: 'Amazfit GTR 4 Smartwatch', price: 199.99, description: 'Reloj inteligente con GPS, monitor de salud y hasta 14 días de batería.' }
  ],
  chargers: [
    { title: 'Anker PowerCore 26800 PowerBank', price: 79.99, description: 'Power bank de alta capacidad con 26800mAh, carga rápida USB-C y diseño compacto.' },
    { title: 'Apple MagSafe Charger', price: 39.99, description: 'Cargador magnético para iPhone con cable USB-C y diseño elegante.' },
    { title: 'Samsung 25W Super Fast Charger', price: 29.99, description: 'Cargador rápido USB-C con tecnología Super Fast Charging para dispositivos Samsung.' },
    { title: 'Belkin Boost Charge Pro 3-in-1', price: 149.99, description: 'Estación de carga inalámbrica para iPhone, AirPods y Apple Watch.' },
    { title: 'RAVPower 65W GaN Charger', price: 49.99, description: 'Cargador compacto de 65W con tecnología GaN para laptops y dispositivos móviles.' }
  ],
  cables: [
    { title: 'Anker PowerLine III USB-C Cable', price: 19.99, description: 'Cable USB-C a USB-C de alta velocidad con soporte para 100W y transferencia de datos rápida.' },
    { title: 'Apple Lightning to USB-C Cable', price: 29.99, description: 'Cable oficial de Apple para conectar dispositivos Lightning a puertos USB-C.' },
    { title: 'UGREEN USB-C to HDMI Cable', price: 24.99, description: 'Cable para conectar dispositivos USB-C a monitores y televisores HDMI.' },
    { title: 'Anker PowerLine III Lightning Cable', price: 17.99, description: 'Cable Lightning a USB-A con construcción reforzada y transferencia rápida.' },
    { title: 'Cable Matters USB-C Hub', price: 39.99, description: 'Hub USB-C con múltiples puertos: HDMI, USB-A, USB-C y SD card reader.' }
  ],
  gadgets: [
    { title: 'Apple AirTag 4-Pack', price: 99.99, description: 'Dispositivos de seguimiento con tecnología U1 para encontrar objetos perdidos.' },
    { title: 'Tile Pro Bluetooth Tracker', price: 34.99, description: 'Rastreador Bluetooth con alcance de 400 pies y batería reemplazable.' },
    { title: 'Ring Video Doorbell Pro 2', price: 249.99, description: 'Timbre inteligente con cámara HD, visión nocturna y detección de movimiento.' },
    { title: 'Nest Hub 2nd Gen', price: 99.99, description: 'Pantalla inteligente con Google Assistant y control de hogar inteligente.' },
    { title: 'Amazon Echo Dot 5th Gen', price: 49.99, description: 'Altavoz inteligente con Alexa, sonido mejorado y control de hogar.' }
  ],
  motherboards: [
    { title: 'ASUS ROG Strix B550-F Gaming', price: 189.99, description: 'Placa madre AMD AM4 con soporte para procesadores Ryzen, PCIe 4.0, WiFi 6 y RGB.' },
    { title: 'MSI MAG B550 Tomahawk', price: 149.99, description: 'Placa madre gaming con excelente refrigeración y conectividad avanzada.' },
    { title: 'Gigabyte X570 AORUS Elite', price: 199.99, description: 'Placa madre AMD X570 con PCIe 4.0, WiFi 6 y diseño robusto.' },
    { title: 'ASRock B450M Pro4', price: 79.99, description: 'Placa madre micro-ATX económica con soporte para procesadores AMD Ryzen.' },
    { title: 'MSI MPG Z690 Edge WiFi', price: 249.99, description: 'Placa madre Intel Z690 con soporte para 12th Gen, DDR5 y WiFi 6E.' }
  ],
  monitors: [
    { title: 'Samsung Odyssey G7 27" 1440p', price: 399.99, description: 'Monitor gaming curvo 27" con 240Hz, QHD y tecnología QLED.' },
    { title: 'LG UltraGear 24" 1080p', price: 199.99, description: 'Monitor gaming 24" con 144Hz y tecnología IPS para colores precisos.' },
    { title: 'ASUS ROG Swift PG32UQX 32" 4K', price: 2999.99, description: 'Monitor gaming 4K con 144Hz, HDR y tecnología Mini LED.' },
    { title: 'Dell UltraSharp U2720Q 27" 4K', price: 499.99, description: 'Monitor profesional 4K con 99% sRGB y conectividad USB-C.' },
    { title: 'BenQ EX2780Q 27" 1440p', price: 299.99, description: 'Monitor gaming con HDRi, altavoces integrados y tecnología IPS.' }
  ],
  storage: [
    { title: 'Samsung 980 PRO 1TB NVMe', price: 129.99, description: 'SSD NVMe PCIe 4.0 de alta velocidad para gaming y trabajo profesional.' },
    { title: 'WD Blue SN570 500GB NVMe', price: 49.99, description: 'SSD NVMe PCIe 3.0 con excelente relación calidad-precio.' },
    { title: 'Crucial MX4 1TB SATA SSD', price: 79.99, description: 'SSD SATA con tecnología 3D NAND y hasta 560MB/s de velocidad.' },
    { title: 'Seagate BarraCuda 2TB HDD', price: 59.99, description: 'Disco duro interno de 2TB con 7200 RPM para almacenamiento masivo.' },
    { title: 'SanDisk Extreme Pro 1TB', price: 149.99, description: 'SSD externo USB 3.2 con velocidades de hasta 2000MB/s.' }
  ],
  graphics: [
    { title: 'NVIDIA GeForce RTX 4070', price: 599.99, description: 'Tarjeta gráfica gaming de alta gama con ray tracing y DLSS 3.' },
    { title: 'AMD Radeon RX 6700 XT', price: 399.99, description: 'Tarjeta gráfica AMD con 12GB GDDR6 para gaming en 1440p.' },
    { title: 'NVIDIA GeForce RTX 4090', price: 1599.99, description: 'Tarjeta gráfica flagship con 24GB GDDR6X y rendimiento extremo.' },
    { title: 'AMD Radeon RX 7800 XT', price: 499.99, description: 'Tarjeta gráfica AMD de alta gama con 16GB GDDR6 y ray tracing.' },
    { title: 'NVIDIA GeForce RTX 3060 Ti', price: 399.99, description: 'Tarjeta gráfica de gama media con 8GB GDDR6 y ray tracing.' }
  ],
  processors: [
    { title: 'AMD Ryzen 7 7700X', price: 329.99, description: 'Procesador AMD de 8 núcleos y 16 hilos con arquitectura Zen 4.' },
    { title: 'Intel Core i5-13400F', price: 199.99, description: 'Procesador Intel de 10 núcleos con excelente rendimiento gaming.' },
    { title: 'AMD Ryzen 9 7950X', price: 699.99, description: 'Procesador AMD de 16 núcleos y 32 hilos para trabajo profesional.' },
    { title: 'Intel Core i7-13700K', price: 399.99, description: 'Procesador Intel de 16 núcleos con overclocking desbloqueado.' },
    { title: 'AMD Ryzen 5 7600X', price: 249.99, description: 'Procesador AMD de 6 núcleos y 12 hilos con arquitectura Zen 4.' }
  ],
  memory: [
    { title: 'Corsair Vengeance LPX 32GB DDR4', price: 89.99, description: 'Kit de memoria DDR4 de 32GB (2x16GB) con latencia baja.' },
    { title: 'G.Skill Trident Z RGB 16GB DDR4', price: 69.99, description: 'Kit de memoria DDR4 gaming con iluminación RGB.' },
    { title: 'Corsair Dominator Platinum 64GB DDR5', price: 299.99, description: 'Kit de memoria DDR5 de 64GB (2x32GB) con iluminación RGB.' },
    { title: 'Kingston Fury Beast 32GB DDR5', price: 149.99, description: 'Kit de memoria DDR5 de 32GB con diseño gaming y alta velocidad.' },
    { title: 'TeamGroup T-Force Delta RGB 16GB DDR4', price: 59.99, description: 'Kit de memoria DDR4 con iluminación RGB y diseño gaming.' }
  ],
  powerSupplies: [
    { title: 'Corsair RM850x 850W 80+ Gold', price: 129.99, description: 'Fuente de poder modular 850W con certificación 80+ Gold.' },
    { title: 'EVGA SuperNOVA 650W 80+ Gold', price: 89.99, description: 'Fuente de poder 650W con excelente eficiencia y estabilidad.' },
    { title: 'Seasonic Focus GX-750 750W', price: 99.99, description: 'Fuente de poder modular 750W con certificación 80+ Gold.' },
    { title: 'Thermaltake Toughpower GF1 1000W', price: 149.99, description: 'Fuente de poder 1000W con certificación 80+ Gold y diseño modular.' },
    { title: 'Cooler Master V750 Gold V2', price: 109.99, description: 'Fuente de poder 750W con certificación 80+ Gold y ventilador silencioso.' }
  ],
  cooling: [
    { title: 'Noctua NH-D15 Chromax Black', price: 99.99, description: 'Cooler de CPU de alto rendimiento con doble ventilador.' },
    { title: 'Corsair H100i RGB Elite', price: 149.99, description: 'AIO líquido 240mm con iluminación RGB y software iCUE.' },
    { title: 'Cooler Master Hyper 212 RGB', price: 39.99, description: 'Cooler de CPU económico con iluminación RGB y excelente rendimiento.' },
    { title: 'Arctic Liquid Freezer II 280', price: 119.99, description: 'AIO líquido 280mm con bomba de alta eficiencia y ventiladores PWM.' },
    { title: 'be quiet! Dark Rock Pro 4', price: 89.99, description: 'Cooler de CPU silencioso con doble ventilador y diseño elegante.' }
  ]
}

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(filePath)
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve(filePath)
      })
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}) // Delete the file on error
        reject(err)
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

function generateSpecifications(category, title) {
  const specs = {
    smartphones: 'Pantalla OLED, Cámara principal 48MP+, Procesador de última generación, 5G, Resistente al agua IP68',
    laptops: 'Procesador de última generación, 16GB+ RAM, SSD 512GB+, Pantalla 4K/1440p, WiFi 6, Bluetooth 5.0',
    audio: 'Cancelación de ruido, Batería 20+ horas, Bluetooth 5.0, Resistente al agua, Micrófonos de alta calidad',
    cameras: 'Sensor de alta resolución, Grabación 4K, Estabilización de imagen, Autofoco híbrido, WiFi integrado',
    gaming: 'Resolución 4K/1440p, 60+ FPS, Ray tracing, HDR, Audio 3D, Almacenamiento SSD',
    wearables: 'Pantalla AMOLED, Resistente al agua IP68, GPS integrado, Monitor de salud, Batería 7+ días',
    chargers: 'Carga rápida, Múltiples puertos, Certificación de seguridad, Cable incluido, Diseño compacto',
    cables: 'Transferencia de datos rápida, Carga rápida, Construcción duradera, Compatibilidad universal',
    gadgets: 'Conectividad inalámbrica, Batería de larga duración, Diseño compacto, Fácil configuración',
    motherboards: 'Socket compatible, PCIe 4.0, WiFi 6, Bluetooth 5.0, RGB integrado, Múltiples puertos',
    monitors: 'Resolución 4K/1440p, 144Hz+, HDR, G-Sync/FreeSync, Pantalla IPS/VA, Conectividad múltiple',
    storage: 'Velocidad de lectura/escritura alta, Tecnología NVMe, Capacidad 1TB+, Garantía extendida',
    graphics: 'Ray tracing, DLSS/FSR, 8GB+ VRAM, Refrigeración avanzada, RGB, Compatibilidad PCIe 4.0',
    processors: 'Múltiples núcleos, Alta frecuencia, Arquitectura de última generación, Compatibilidad DDR5',
    memory: 'Alta velocidad, Baja latencia, RGB opcional, Compatibilidad XMP, Garantía de por vida',
    powerSupplies: 'Certificación 80+ Gold, Modular, Protección completa, Ventilador silencioso, Cableado incluido',
    cooling: 'Refrigeración eficiente, Bajo ruido, Fácil instalación, Compatibilidad universal, RGB opcional'
  }
  
  return specs[category] || 'Especificaciones técnicas de alta calidad'
}

async function createRealProducts() {
  try {
    console.log('🚀 Creando productos con imágenes reales...')
    
    let totalCreated = 0
    const categories = Object.keys(productsByCategory)
    
    for (const category of categories) {
      const products = productsByCategory[category]
      
      console.log(`\n📦 Creando productos para categoría: ${category}`)
      
      for (const product of products) {
        try {
          // Crear producto
          const createdProduct = await prisma.product.create({
            data: {
              title: product.title,
              description: product.description,
              price: product.price,
              condition: Math.random() > 0.3 ? 'NEW' : 'USED', // 70% nuevos, 30% usados
              aestheticCondition: Math.floor(Math.random() * 3) + 8, // 8-10
              specifications: generateSpecifications(category, product.title),
              categories: category,
              stock: Math.floor(Math.random() * 20) + 1, // 1-20 unidades
              status: 'ACTIVE'
            }
          })
          
          // Descargar imagen real
          const imageUrl = realProductImages[product.title]
          if (imageUrl) {
            try {
              // Crear directorio para el producto
              const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${createdProduct.id}`)
              if (!fs.existsSync(productDir)) {
                fs.mkdirSync(productDir, { recursive: true })
              }
              
              // Generar nombre de archivo
              const timestamp = Date.now()
              const randomId = Math.random().toString(36).substring(2, 8)
              const filename = `${timestamp}_${randomId}.jpg`
              const filePath = path.join(productDir, filename)
              
              console.log(`  📥 Descargando imagen real: ${product.title}`)
              
              // Descargar imagen
              await downloadImage(imageUrl, filePath)
              
              // Crear registro de imagen
              await prisma.productImage.create({
                data: {
                  path: `/uploads/products/product_${createdProduct.id}/${filename}`,
                  filename: filename,
                  alt: product.title,
                  order: 0,
                  productId: createdProduct.id
                }
              })
              
              console.log(`  ✅ Creado: ${product.title}`)
              totalCreated++
              
            } catch (error) {
              console.error(`  ❌ Error descargando imagen para ${product.title}: ${error.message}`)
            }
          } else {
            console.log(`  ⚠️ No se encontró imagen real para: ${product.title}`)
          }
          
        } catch (error) {
          console.error(`❌ Error creando ${product.title}:`, error.message)
        }
      }
    }
    
    console.log(`\n🎉 Se crearon ${totalCreated} productos con imágenes reales!`)
    console.log('📊 Categorías incluidas:')
    categories.forEach(cat => {
      console.log(`  - ${cat}: ${productsByCategory[cat].length} productos`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealProducts()
