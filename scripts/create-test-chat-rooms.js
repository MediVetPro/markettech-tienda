const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestChatRooms() {
  try {
    console.log('💬 Creando salas de chat de prueba...')
    
    // Obtener el usuario de prueba
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@markettech.com' }
    })
    
    if (!testUser) {
      console.log('❌ No se encontró el usuario de prueba')
      return
    }
    
    const chatRooms = [
      {
        name: 'Soporte General',
        description: 'Sala de soporte para consultas generales',
        type: 'PUBLIC',
        category: 'soporte',
        createdBy: testUser.id
      },
      {
        name: 'Ventas',
        description: 'Sala para consultas de ventas y productos',
        type: 'PUBLIC',
        category: 'ventas',
        createdBy: testUser.id
      },
      {
        name: 'Técnico',
        description: 'Sala para soporte técnico especializado',
        type: 'PRIVATE',
        category: 'tecnico',
        createdBy: testUser.id
      },
      {
        name: 'Desarrolladores',
        description: 'Sala para desarrolladores y programadores',
        type: 'PRIVATE',
        category: 'desarrollo',
        createdBy: testUser.id
      }
    ]
    
    for (const roomData of chatRooms) {
      const existingRoom = await prisma.chatRoom.findFirst({
        where: { name: roomData.name }
      })
      
      if (!existingRoom) {
        const room = await prisma.chatRoom.create({
          data: roomData
        })
        
        // Agregar el creador como participante
        await prisma.chatParticipant.create({
          data: {
            roomId: room.id,
            userId: testUser.id,
            role: 'ADMIN'
          }
        })
        
        console.log(`✅ Sala creada: ${room.name} - ${room.type}`)
      } else {
        console.log(`⚠️  Sala ya existe: ${roomData.name}`)
      }
    }
    
    console.log('🎉 Salas de chat de prueba creadas exitosamente!')
    
  } catch (error) {
    console.error('❌ Error creando salas de chat:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestChatRooms()
