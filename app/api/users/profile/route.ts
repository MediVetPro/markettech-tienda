import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Obtener el ID del usuario desde el token o headers
    const userId = request.headers.get('user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not provided' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birthDate: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        newsletter: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 [API PROFILE] Datos recibidos:', {
      name: body.name,
      city: body.city,
      state: body.state,
      address: body.address
    })
    
    const {
      name,
      email,
      phone,
      cpf,
      birthDate,
      gender,
      address,
      city,
      state,
      zipCode,
      country,
      newsletter
    } = body

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Verificar si el CPF ya existe en otro usuario
    if (cpf) {
      const existingCPF = await prisma.user.findFirst({
        where: {
          cpf,
          id: { not: userId }
        }
      })

      if (existingCPF) {
        return NextResponse.json(
          { error: 'CPF already exists' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        cpf: cpf || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender: gender || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        newsletter: newsletter !== undefined ? newsletter : undefined,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birthDate: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        newsletter: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('✅ [API PROFILE] Usuario actualizado en BD:', {
      name: updatedUser.name,
      city: updatedUser.city,
      state: updatedUser.state,
      address: updatedUser.address
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
