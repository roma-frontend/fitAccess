// app/member-dashboard/orders/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt as ReceiptIcon
} from 'lucide-react';
import Receipt from '@/components/Receipt';

interface Order {
  _id: string;
  userId?: string;
  memberId?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  pickupType: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  paymentIntentId?: string;
  paymentId?: string;
  paymentMethod?: string;
  orderTime: number;
  estimatedReadyTime?: number;
  completedTime?: number;
  paidAt?: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтвержден';
      case 'processing':
        return 'Готовится';
      case 'ready':
        return 'Готов';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const handlePrintReceipt = (order: Order) => {
    setSelectedOrder(order);
    // Небольшая задержка для установки состояния
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Конвертируем заказ в формат чека
  const convertOrderToReceipt = (order: Order) => {
    return {
      receiptId: order._id.slice(-8),
      orderId: order._id,
      paymentId: order.paymentId || order.paymentIntentId || 'unknown',
      amount: order.totalAmount,
      currency: 'RUB',
      paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : new Date(order.orderTime).toISOString(),
      customer: {
        email: user?.email || 'customer@fitaccess.ru',
        name: user?.name || 'Покупатель',
      },
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.totalPrice,
      })),
      company: {
        name: 'FitAccess',
        address: 'г. Москва, ул. Примерная, д. 1',
        inn: '1234567890',
        phone: '+7 (495) 123-45-67',
      },
    };
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.items.some(item => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">История заказов</h1>
        <p className="text-gray-600">Просматривайте и скачивайте чеки ваших покупок</p>
      </div>

      {/* Фильтры и поиск */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по товарам или номеру заказа..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает</option>
                <option value="confirmed">Подтвержден</option>
                <option value="processing">Готовится</option>
                <option value="ready">Готов</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Заказы не найдены' : 'У вас пока нет заказов'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : 'Сделайте первую покупку в нашем магазине'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => window.location.href = '/shop'}>
                Перейти в магазин
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Основная информация */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">
                        Заказ #{order._id.slice(-8)}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </Badge>
                      {order.paymentStatus === 'paid' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Оплачен
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Дата заказа:</p>
                        <p className="font-medium">
                          {new Date(order.orderTime).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Сумма:</p>
                        <p className="font-bold text-lg text-green-600">
                          {order.totalAmount.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>

                    {/* Товары */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Товары:</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="font-medium">
                              {item.totalPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReceipt(order)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Просмотр чека
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintReceipt(order)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Печать чека
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Модальное окно с чеком */}
      {showReceipt && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ReceiptIcon className="h-5 w-5" />
                Чек заказа
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReceipt(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <Receipt receipt={convertOrderToReceipt(selectedOrder)} />
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button
                onClick={() => {
                  setShowReceipt(false);
                  handlePrintReceipt(selectedOrder);
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Печать
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReceipt(false)}
                className="flex-1"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Скрытый чек для печати */}
      {selectedOrder && !showReceipt && (
        <div className="hidden print:block">
          <Receipt receipt={convertOrderToReceipt(selectedOrder)} />
        </div>
      )}
    </div>
  );
}
