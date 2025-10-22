'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { MessageCircle, User, Mail, Phone, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  subject: string
  content: string
  type: string
  status: string
  createdAt: string
  sender?: {
    id: string
    name: string
    email: string
  }
  recipient?: {
    id: string
    name: string
    email: string
  }
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  replies?: Message[]
}

export default function MessagesPage() {
  const { user, isAuthenticated, isAdmin, isInitialized } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      router.push('/login')
      return
    }
    
    // Solo administradores pueden acceder a la pantalla de mensajes
    if (isAuthenticated && !isAdmin) {
      router.push('/')
      return
    }
    
    loadMessages()
  }, [isAuthenticated, isAdmin, isInitialized, router])

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    
    // Marcar como leído si es necesario (para administradores)
    if (message.status === 'UNREAD') {
      try {
        const token = localStorage.getItem('smartesh_token')
        if (!token) return

        await fetch(`/api/messages/${message.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Actualizar el estado local
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, status: 'READ' } : m
        ))
      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error)
      }
    }
  }


  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta mensagem? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Si el mensaje eliminado era el seleccionado, limpiar la selección
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null)
        }
        loadMessages() // Recargar mensajes
        alert('Mensagem eliminada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao eliminar mensagem')
      }
    } catch (error) {
      console.error('Erro ao eliminar mensagem:', error)
      alert('Erro ao eliminar mensagem')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'bg-blue-100 text-blue-800'
      case 'READ':
        return 'bg-gray-100 text-gray-800'
      case 'REPLIED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserStatus = (message: any) => {
    // Si tiene senderId, es un usuario registrado autenticado
    if (message.senderId) return true
    
    // Si no tiene senderId pero tiene sender (usuario registrado no autenticado)
    if (message.sender) return true
    
    // Si no tiene senderId ni sender, es usuario no registrado
    return false
  }

  const getUserStatusText = (message: any) => {
    const isRegistered = getUserStatus(message)
    if (isRegistered === true) return 'Usuário Registrado'
    if (isRegistered === false) return 'Usuário Não Registrado'
    return 'Estado Desconhecido'
  }

  const getUserStatusColor = (message: any) => {
    const isRegistered = getUserStatus(message)
    if (isRegistered === true) return 'bg-green-100 text-green-800'
    if (isRegistered === false) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'Não lida'
      case 'READ':
        return 'Lida'
      case 'REPLIED':
        return 'Respondida'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CONTACT':
        return 'Contato'
      case 'SUPPORT':
        return 'Suporte'
      case 'GENERAL':
        return 'Geral'
      case 'product-inquiry':
      case 'PRODUCT_INQUIRY':
        return 'Consulta de Produto'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CONTACT':
        return 'bg-blue-100 text-blue-800'
      case 'SUPPORT':
        return 'bg-orange-100 text-orange-800'
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800'
      case 'product-inquiry':
      case 'PRODUCT_INQUIRY':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar esta página.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
                <p className="text-gray-600 mt-1">
                  {isAdmin ? 'Gerenciar mensagens de contato' : 'Suas mensagens'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Mensagens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? 'Todas as Mensagens' : 'Minhas Mensagens'}
                </h2>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p>Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                        }`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {message.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {message.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                                {getTypeText(message.type)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                {getStatusText(message.status)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(message)}`}>
                                {getUserStatusText(message)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {message.status === 'UNREAD' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMessage(message.id)
                              }}
                              disabled={isDeleting}
                              className="p-2 text-white bg-red-600 hover:bg-red-700 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Eliminar mensagem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalhes da Mensagem */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedMessage.type)}`}>
                          {getTypeText(selectedMessage.type)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                          {getStatusText(selectedMessage.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      disabled={isDeleting}
                      className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm text-white">Eliminar</span>
                    </button>
                  </div>

                  {/* Informações do Remetente */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Remetente</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {selectedMessage.sender?.name || selectedMessage.senderName || 'Nome não informado'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(selectedMessage)}`}>
                            {getUserStatusText(selectedMessage)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedMessage.sender?.email || selectedMessage.senderEmail ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <span className="text-sm text-gray-600 block">
                                {selectedMessage.sender?.email || selectedMessage.senderEmail}
                              </span>
                              <span className="text-xs text-gray-500">Email</span>
                            </div>
                          </div>
                          <a
                            href={`mailto:${selectedMessage.sender?.email || selectedMessage.senderEmail}`}
                            className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 hover:text-white transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            <span className="text-white">Enviar Email</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 italic">Email não informado</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedMessage.senderPhone ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <span className="text-sm text-gray-600 block">
                                {selectedMessage.senderPhone}
                              </span>
                              <span className="text-xs text-gray-500">Telefone</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <a
                              href={`tel:${selectedMessage.senderPhone}`}
                              className="flex items-center space-x-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 hover:text-white transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="text-white">Ligar</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/${selectedMessage.senderPhone.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 hover:text-white transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-white">WhatsApp</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 italic">Telefone não informado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo da Mensagem */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Mensagem</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma mensagem
                </h3>
                <p className="text-gray-600">
                  Escolha uma mensagem da lista para visualizar os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
