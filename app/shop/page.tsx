// ShopPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentForm from "@/components/PaymentForm";
import ReceiptModal from "@/components/ReceiptModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Minus,
  X,
  Coffee,
  Zap,
  Cookie,
  Shirt,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  LogIn,
  Shield,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  inStock: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  isPopular?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  // Состояния авторизации
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasShopAccess, setHasShopAccess] = useState(false);

  // Состояния магазина
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [orderStep, setOrderStep] = useState<
    "shop" | "cart" | "checkout" | "payment" | "confirm"
  >("shop");
  const [pickupType, setPickupType] = useState<string>("counter");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [receipt, setReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasShopAccess) {
      fetchProducts();
      loadCartFromStorage();
    }
  }, [isAuthenticated, hasShopAccess]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  useEffect(() => {
    saveCartToStorage();
  }, [cart]);

  const checkAuthentication = async () => {
    try {
      console.log("🔍 Проверяем авторизацию...");
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Проверяем доступ к магазину - только для участников
        const canAccessShop = data.user.role === 'member';
        setHasShopAccess(canAccessShop);
        
        console.log('✅ Пользователь авторизован:', data.user.email, 'Роль:', data.user.role);
        console.log('🛒 Доступ к магазину:', canAccessShop ? 'РАЗРЕШЕН' : 'ЗАПРЕЩЕН');
      } else {
        setIsAuthenticated(false);
        setHasShopAccess(false);
        console.log("❌ Пользователь не авторизован");
      }
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
      setIsAuthenticated(false);
      setHasShopAccess(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = () => {
    // Сохраняем текущий URL для возврата после входа
    sessionStorage.setItem("returnUrl", "/shop");
    router.push("/member-login"); // Перенаправляем на вход для участников
  };

  const handleGoToDashboard = () => {
    switch (user?.role) {
      case 'super-admin':
      case 'admin':
        router.push('/admin');
        break;
      case 'manager':
        router.push('/manager-dashboard');
        break;
      case 'trainer':
        router.push('/trainer-dashboard');
        break;
      case 'member':
        router.push('/member-dashboard');
        break;
      default:
        router.push('/');
    }
  };

  const handleLogoutAndLoginAsMember = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.setItem('returnUrl', '/shop');
      router.push('/member-login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
      router.push('/member-login');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить товары",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    filtered.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredProducts(filtered);
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem("fitaccess_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Ошибка загрузки корзины:", error);
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem("fitaccess_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Ошибка сохранения корзины:", error);
    }
  };

  const addToCart = (product: Product) => {
    if (product.inStock === 0) {
      toast({
        variant: "destructive",
        title: "Товар закончился",
        description: "К сожалению, этого товара нет в наличии",
      });
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product._id === product._id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.inStock) {
          toast({
            variant: "destructive",
            title: "Недостаточно товара",
            description: `В наличии только ${product.inStock} шт.`,
          });
          return prevCart;
        }

        return prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    toast({
      title: "Добавлено в корзину",
      description: `${product.name} добавлен в корзину`,
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.product.inStock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product._id !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Корзина пуста",
        description: "Добавьте товары в корзину перед оформлением заказа",
      });
      return;
    }

    if (paymentMethod === "card") {
      setOrderStep("payment");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        totalPrice: item.product.price * item.quantity,
      }));

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: getTotalPrice(),
          pickupType,
          paymentMethod,
          notes: orderNotes || undefined,
          status: paymentMethod === "cash" ? "confirmed" : "pending",
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrderStep("confirm");
        clearCart();

        if (paymentMethod !== "card") {
          const simpleReceipt = {
            receiptId: `ORD-${orderData.orderId}`,
            orderId: orderData.orderId,
            amount: getTotalPrice(),
            currency: "RUB",
            paidAt: new Date().toISOString(),
            paymentMethod:
              paymentMethod === "cash" ? "Наличные" : "Списание с абонемента",
            items: orderItems,
          };
          setReceipt(simpleReceipt);
        }

        toast({
          title: "Заказ оформлен!",
          description: "Ваш заказ принят в обработку",
        });
      } else {
        throw new Error("Ошибка создания заказа");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте еще раз.",
      });
    }
  };

  const handlePaymentSuccess = (paymentReceipt: any) => {
    setReceipt(paymentReceipt);
    setOrderStep("confirm");
    clearCart();
    setShowReceipt(true);
  };

  const handlePaymentError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Ошибка оплаты",
      description: error,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "drinks":
        return <Coffee className="h-4 w-4" />;
      case "supplements":
        return <Zap className="h-4 w-4" />;
      case "snacks":
        return <Cookie className="h-4 w-4" />;
      case "merchandise":
        return <Shirt className="h-4 w-4" />;
      default:
        return <Coffee className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "drinks":
        return "Напитки";
      case "supplements":
        return "Спортивное питание";
      case "snacks":
        return "Снеки";
      case "merchandise":
        return "Мерч";
      default:
        return category;
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'super-admin':
        return 'Супер Администратор';
      case 'manager':
        return 'Менеджер';
      case 'trainer':
        return 'Тренер';
      case 'member':
        return 'Участник';
      default:
        return role;
    }
  };

  // Если проверяется авторизация
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Проверка доступа к магазину...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Добро пожаловать в магазин FitAccess</CardTitle>
            <CardDescription>
              Для совершения покупок необходимо войти как участник
            </CardDescription>
                    </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Магазин доступен только для участников фитнес-центра
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Войти как участник
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/staff-login")}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Вход для персонала
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="w-full"
              >
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если авторизован, но нет доступа к магазину (персонал)
  if (isAuthenticated && !hasShopAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Доступ ограничен</CardTitle>
            <CardDescription>
              Магазин доступен только для участников
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Вы вошли как <strong>{getRoleDisplayName(user.role)}</strong>.
                <br />
                Покупки в магазине доступны только участникам фитнес-центра.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Информация о пользователе:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Роль:</strong> <Badge>{getRoleDisplayName(user.role)}</Badge></p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-800">Что вы можете делать:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Управлять заказами через админ-панель</li>
                <li>• Просматривать отчеты по продажам</li>
                <li>• Управлять товарами и ценами</li>
                <li>• Обрабатывать заказы участников</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button onClick={handleGoToDashboard} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Перейти в панель управления
              </Button>

              <Button
                variant="outline"
                onClick={handleLogoutAndLoginAsMember}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Войти как участник
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="w-full"
              >
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если загружаются товары
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка магазина...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (orderStep === "shop") {
                    window.history.back();
                  } else {
                    setOrderStep("shop");
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Магазин FitAccess
                </h1>
                <p className="text-sm text-gray-500">
                  {orderStep === "shop" && "Выберите товары"}
                  {orderStep === "cart" && "Корзина"}
                  {orderStep === "checkout" && "Оформление заказа"}
                  {orderStep === "payment" && "Оплата"}
                  {orderStep === "confirm" && "Заказ оформлен"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Информация о пользователе */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <Badge variant="outline" className="text-xs">
                  {getRoleDisplayName(user?.role)}
                </Badge>
              </div>

              {/* Корзина */}
              <Button
                variant="outline"
                onClick={() => setOrderStep("cart")}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Корзина
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Магазин */}
        {orderStep === "shop" && (
          <div className="space-y-6">
            {/* Фильтры и поиск */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      <SelectItem value="drinks">Напитки</SelectItem>
                      <SelectItem value="supplements">
                        Спортивное питание
                      </SelectItem>
                      <SelectItem value="snacks">Снеки</SelectItem>
                      <SelectItem value="merchandise">Мерч</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Сбросить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Популярные товары */}
            {products.some((p) => p.isPopular) &&
              categoryFilter === "all" &&
              !searchQuery && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">🔥 Популярное</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {products
                      .filter((p) => p.isPopular)
                      .slice(0, 4)
                      .map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          onAddToCart={() => addToCart(product)}
                          cartQuantity={
                            cart.find(
                              (item) => item.product._id === product._id
                            )?.quantity || 0
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

            {/* Все товары */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {categoryFilter === "all"
                  ? "Все товары"
                  : getCategoryName(categoryFilter)}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => addToCart(product)}
                    cartQuantity={
                      cart.find((item) => item.product._id === product._id)
                        ?.quantity || 0
                    }
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <Card className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Товары не найдены
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Попробуйте изменить параметры поиска или фильтры
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Корзина */}
        {orderStep === "cart" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Корзина</CardTitle>
                <CardDescription>
                  {cart.length > 0
                    ? `${getTotalItems()} товаров на сумму ${getTotalPrice()} ₽`
                    : "Корзина пуста"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <CartItemCard
                        key={item.product._id}
                        item={item}
                        onUpdateQuantity={(quantity) =>
                          updateQuantity(item.product._id, quantity)
                        }
                        onRemove={() => removeFromCart(item.product._id)}
                      />
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Итого:</span>
                        <span>{getTotalPrice()} ₽</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setOrderStep("shop")}
                        className="flex-1"
                      >
                        Продолжить покупки
                      </Button>
                      <Button
                        onClick={() => setOrderStep("checkout")}
                        className="flex-1"
                      >
                        Оформить заказ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Корзина пуста
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Добавьте товары из магазина
                    </p>
                    <Button onClick={() => setOrderStep("shop")}>
                      Перейти в магазин
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Оформление заказа */}
        {orderStep === "checkout" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма заказа */}
            <Card>
              <CardHeader>
                <CardTitle>Детали заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Способ получения
                  </label>
                  <Select value={pickupType} onValueChange={setPickupType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counter">На стойке ресепшн</SelectItem>
                      <SelectItem value="locker">
                        В автомате (шкафчик)
                      </SelectItem>
                      <SelectItem value="table">Принести к столику</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Способ оплаты
                  </label>
                                    <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Банковская карта</SelectItem>
                      <SelectItem value="cash">Наличные</SelectItem>
                      <SelectItem value="membership">
                        Списать с абонемента
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Комментарий к заказу
                  </label>
                  <Input
                    placeholder="Особые пожелания..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setOrderStep("cart")}
                    className="flex-1"
                  >
                    Назад
                  </Button>
                  <Button onClick={handleCheckout} className="flex-1">
                    {paymentMethod === "card"
                      ? "Перейти к оплате"
                      : "Оформить заказ"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Сводка заказа */}
            <Card>
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.product.price} ₽ × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">
                        {item.product.price * item.quantity} ₽
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span>{getTotalPrice()} ₽</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Время приготовления</h4>
                  <p className="text-sm text-blue-800">
                    Ваш заказ будет готов через 10-15 минут
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Оплата картой */}
        {orderStep === "payment" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Форма оплаты */}
              <PaymentForm
                items={cart.map((item) => ({
                  productId: item.product._id,
                  productName: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price,
                  totalPrice: item.product.price * item.quantity,
                }))}
                totalAmount={getTotalPrice()}
                pickupType={pickupType}
                notes={orderNotes}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />

              {/* Сводка заказа */}
              <Card>
                <CardHeader>
                  <CardTitle>Детали заказа</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.product.price} ₽ × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">
                          {item.product.price * item.quantity} ₽
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>{getTotalPrice()} ₽</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Получение:</strong>{" "}
                      {pickupType === "counter"
                        ? "На стойке ресепшн"
                        : pickupType === "locker"
                          ? "В автомате"
                          : "За столиком"}
                    </p>
                    {orderNotes && (
                      <p>
                        <strong>Комментарий:</strong> {orderNotes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setOrderStep("checkout")}
                    className="w-full mt-4"
                  >
                    Изменить детали заказа
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Подтверждение заказа */}
        {orderStep === "confirm" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {paymentMethod === "card"
                    ? "Оплата прошла успешно!"
                    : "Заказ принят!"}
                </h2>

                <p className="text-gray-600 mb-6">
                  Ваш заказ №
                  {receipt?.receiptId ||
                    Math.random().toString(36).substr(2, 6).toUpperCase()}
                  {paymentMethod === "card" ? " оплачен и принят" : " принят"} в
                  обработку. Ожидаемое время приготовления: 10-15 минут.
                </p>

                {receipt && (
                  <div className="mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowReceipt(true)}
                      className="mb-4"
                    >
                      Посмотреть чек
                    </Button>

                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <h4 className="font-medium mb-2">Детали оплаты:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          Сумма:{" "}
                          <strong>
                            {receipt.amount} {receipt.currency || "₽"}
                          </strong>
                        </p>
                        <p>
                          Способ оплаты:{" "}
                          <strong>
                            {receipt.paymentMethod || "Банковская карта"}
                          </strong>
                        </p>
                        <p>
                          Дата:{" "}
                          <strong>
                            {new Date(receipt.paidAt).toLocaleString()}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">Что дальше?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Мы начнем готовить ваш заказ</li>
                    <li>• Вы получите уведомление когда заказ будет готов</li>
                    <li>
                      • Заберите заказ{" "}
                      {pickupType === "counter"
                        ? "на стойке ресепшн"
                        : pickupType === "locker"
                          ? "в автомате"
                          : "за вашим столиком"}
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/member-dashboard")}
                    className="flex-1"
                  >
                    В личный кабинет
                  </Button>
                  <Button
                    onClick={() => setOrderStep("shop")}
                    className="flex-1"
                  >
                    Заказать еще
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Модальное окно с чеком */}
      <ReceiptModal
        receipt={receipt}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
}

// Компонент карточки товара
function ProductCard({
  product,
  onAddToCart,
  cartQuantity,
}: {
  product: Product;
  onAddToCart: () => void;
  cartQuantity: number;
}) {
  const getProductImage = (product: Product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }

    switch (product.category) {
      case "drinks":
        return "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop";
      case "supplements":
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
      case "snacks":
        return "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop";
      case "merchandise":
        return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
          }}
        />
        {product.isPopular && (
          <Badge className="absolute top-2 left-2 bg-orange-500">🔥 Хит</Badge>
        )}
        {product.inStock < 5 && product.inStock > 0 && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">Мало</Badge>
        )}
        {product.inStock === 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Нет в наличии
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h4 className="font-bold text-lg mb-1">{product.name}</h4>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {product.nutrition && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div className="grid grid-cols-2 gap-1">
              {product.nutrition.calories && (
                <span>Калории: {product.nutrition.calories}</span>
              )}
              {product.nutrition.protein && (
                <span>Белки: {product.nutrition.protein}г</span>
              )}
              {product.nutrition.carbs && (
                <span>Углеводы: {product.nutrition.carbs}г</span>
              )}
              {product.nutrition.fat && (
                <span>Жиры: {product.nutrition.fat}г</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xl">{product.price} ₽</span>
          <span className="text-xs text-gray-500">
            В наличии: {product.inStock} шт.
          </span>
        </div>

        {cartQuantity > 0 ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium">
              В корзине: {cartQuantity}
            </span>
            <Button
              size="sm"
              onClick={onAddToCart}
              disabled={
                product.inStock === 0 || cartQuantity >= product.inStock
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={onAddToCart}
            disabled={product.inStock === 0}
            className="w-full"
          >
            {product.inStock === 0 ? "Нет в наличии" : "В корзину"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Компонент элемента корзины
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const getProductImage = (product: Product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }

    switch (product.category) {
      case "drinks":
        return "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop";
      case "supplements":
                return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
      case "snacks":
        return "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop";
      case "merchandise":
        return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <img
        src={getProductImage(item.product)}
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => {
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop";
        }}
      />

      <div className="flex-1">
        <h4 className="font-medium">{item.product.name}</h4>
        <p className="text-sm text-gray-600">{item.product.price} ₽ за шт.</p>
        {item.product.nutrition && (
          <p className="text-xs text-gray-500">
            {item.product.nutrition.calories} ккал
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-8 text-center font-medium">{item.quantity}</span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          disabled={item.quantity >= item.product.inStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right">
        <p className="font-bold">{item.product.price * item.quantity} ₽</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}



