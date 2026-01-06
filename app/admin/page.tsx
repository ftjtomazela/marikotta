"use client";

import { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabType = 'produtos' | 'pedidos' | 'clientes' | 'relatorios' | 'configuracoes';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: any[];
  created_at: string;
  payment_id: string;
  shipping_address: any;
  notes: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_pedidos: number;
  total_gasto: number;
  ultimo_pedido: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [acessoPermitido, setAcessoPermitido] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados principais
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Estado da aba ativa
  const [abaAtiva, setAbaAtiva] = useState<TabType>('pedidos');
  
  // Estado para edição de produto
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "Tiaras de Luxo",
    image: null as File | null,
  });

  // Estado para pedido selecionado
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Order | null>(null);
  
  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroData, setFiltroData] = useState<string>('hoje');
  const [busca, setBusca] = useState('');

  // Feedback - CORRIGIDO: removido 'info' do tipo
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

  // Estatísticas
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalPedidos: 0,
    totalClientes: 0,
    faturamentoTotal: 0,
    pedidosHoje: 0,
    pedidosPendentes: 0,
  });

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in');
    if (loggedIn === 'true') {
      setAcessoPermitido(true);
      carregarDados();
    }
  }, []);

  useEffect(() => {
    if (acessoPermitido) {
      carregarDados();
    }
  }, [abaAtiva, acessoPermitido, filtroStatus, filtroData, busca]);

  const carregarDados = async () => {
    try {
      switch (abaAtiva) {
        case 'produtos':
          await fetchProducts();
          break;
        case 'pedidos':
          await fetchOrders();
          break;
        case 'clientes':
          await fetchClientes();
          break;
        case 'relatorios':
          await calcularEstatisticas();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
      setStats(prev => ({ ...prev, totalProdutos: data?.length || 0 }));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      showFeedback('error', 'Erro ao carregar produtos');
    }
  };

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      // Filtrar por data
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (filtroData === 'hoje') {
        query = query.gte('created_at', hoje.toISOString());
      } else if (filtroData === 'semana') {
        const semanaAtras = new Date(hoje);
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        query = query.gte('created_at', semanaAtras.toISOString());
      } else if (filtroData === 'mes') {
        const mesAtras = new Date(hoje);
        mesAtras.setMonth(mesAtras.getMonth() - 1);
        query = query.gte('created_at', mesAtras.toISOString());
      }

      // Aplicar busca
      if (busca) {
        query = query.or(`customer_name.ilike.%${busca}%,customer_email.ilike.%${busca}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOrders(data || []);
      
      // Calcular estatísticas baseadas nos pedidos
      if (data && data.length > 0) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const pedidosHoje = data.filter(p => 
          new Date(p.created_at) >= hoje
        ).length;

        const pedidosPendentes = data.filter(p => 
          p.status === 'pending' || p.status === 'processing'
        ).length;

        const faturamentoTotal = data.reduce((sum, p) => sum + (p.total || 0), 0);

        setStats(prev => ({
          ...prev,
          totalPedidos: data.length,
          pedidosHoje,
          pedidosPendentes,
          faturamentoTotal,
        }));
      }

    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      showFeedback('error', 'Erro ao carregar pedidos');
    }
  };

  const fetchClientes = async () => {
    // Se não tem pedidos, não há clientes
    if (orders.length === 0) {
      setClientes([]);
      return;
    }

    try {
      // Agrupar pedidos por cliente
      const clientesMap = new Map();
      
      orders.forEach(order => {
        const clienteId = order.customer_email;
        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            id: order.id,
            nome: order.customer_name,
            email: order.customer_email,
            telefone: order.customer_phone || 'Não informado',
            total_pedidos: 0,
            total_gasto: 0,
            ultimo_pedido: order.created_at,
          });
        }
        
        const cliente = clientesMap.get(clienteId);
        cliente.total_pedidos += 1;
        cliente.total_gasto += (order.total || 0);
        if (new Date(order.created_at) > new Date(cliente.ultimo_pedido)) {
          cliente.ultimo_pedido = order.created_at;
        }
      });

      const clientesArray = Array.from(clientesMap.values());
      setClientes(clientesArray);
      setStats(prev => ({ ...prev, totalClientes: clientesMap.size }));

    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      showFeedback('error', 'Erro ao carregar clientes');
    }
  };

  const calcularEstatisticas = async () => {
    try {
      const { data } = await supabase
        .from("orders")
        .select("total, status, created_at");

      if (data) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const pedidosHoje = data.filter(p => 
          new Date(p.created_at) >= hoje
        ).length;

        const pedidosPendentes = data.filter(p => 
          p.status === 'pending' || p.status === 'processing'
        ).length;

        const faturamentoTotal = data.reduce((sum, p) => sum + (p.total || 0), 0);

        setStats(prev => ({
          ...prev,
          totalPedidos: data.length,
          pedidosHoje,
          pedidosPendentes,
          faturamentoTotal,
        }));
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  const verificarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === "marikota2025") {
      setAcessoPermitido(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      showFeedback('success', 'Login realizado com sucesso!');
      carregarDados();
    } else {
      showFeedback('error', 'Senha incorreta!');
      setSenha("");
    }
  };

  // CORREÇÃO: removido 'info' do tipo
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({type, message});
    setTimeout(() => setFeedback({type: null, message: ''}), 3000);
  };

  // FUNÇÕES DE PEDIDOS
  const atualizarStatusPedido = async (pedidoId: string, novoStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: novoStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', pedidoId);

      if (error) throw error;
      
      showFeedback('success', `Pedido ${pedidoId.slice(0, 8)} atualizado para ${novoStatus}`);
      fetchOrders();
    } catch (error) {
      showFeedback('error', 'Erro ao atualizar pedido');
    }
  };

  const gerarEtiqueta = (order: Order) => {
    // Endereço formatado
    const endereco = order.shipping_address 
      ? `${order.shipping_address.rua || ''}, ${order.shipping_address.numero || ''} - ${order.shipping_address.bairro || ''}, ${order.shipping_address.cidade || ''} - ${order.shipping_address.estado || ''}`
      : 'Endereço não informado';
    
    // Simulação de geração de etiqueta
    const conteudo = `
      ============================
      ETIQUETA DE ENVIO - Marikota
      ============================
      
      Destinatário: ${order.customer_name}
      Endereço: ${endereco}
      Telefone: ${order.customer_phone || 'Não informado'}
      
      Pedido: #${order.id.slice(0, 8)}
      Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}
      
      Itens (${order.items?.length || 0}):
      ${order.items?.map((item: any) => `  • ${item.quantity}x ${item.title}`).join('\n') || 'Nenhum item'}
      
      Valor Total: R$ ${order.total.toFixed(2)}
      Status: ${order.status.toUpperCase()}
      
      ============================
      Obrigado pela preferência!
      ============================
    `;

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-pedido-${order.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showFeedback('success', 'Etiqueta gerada com sucesso!');
  };

  const exportarPedidos = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos-marikota-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showFeedback('success', 'Pedidos exportados com sucesso!');
      }
    } catch (error) {
      showFeedback('error', 'Erro ao exportar pedidos');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : 
        typeof value === 'object' ? `"${JSON.stringify(value).replace(/"/g, '""')}"` : value
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  // FUNÇÕES DE PRODUTO
  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      price: product.price.toString().replace('.', ','),
      description: product.description || "",
      category: product.category,
      image: null,
    });
    setAbaAtiva('produtos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", price: "", description: "", category: "Tiaras de Luxo", image: null });
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Tem certeza que quer apagar esse produto?")) return;

    try {
      if (imageUrl) {
        const imageName = imageUrl.split("/").pop();
        if (imageName) await supabase.storage.from("produtos").remove([imageName]);
      }
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      
      showFeedback('success', 'Produto apagado com sucesso!');
      fetchProducts();
      if (editingId === id) handleCancelEdit();

    } catch (error) {
      console.error(error);
      showFeedback('error', 'Erro ao apagar produto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do preço
    const priceRegex = /^\d+([,.]\d{1,2})?$/;
    if (!priceRegex.test(form.price)) {
      showFeedback('error', 'Preço inválido. Use formato: 0,00 ou 0.00');
      return;
    }

    setLoading(true);

    try {
      let publicUrl = null;

      // 1. Se tiver imagem nova selecionada, faz upload
      if (form.image) {
        const fileExt = form.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(fileName, form.image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);
        
        publicUrl = data.publicUrl;
      }

      // Prepara os dados básicos
      const productData: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price.replace(',', '.')),
        category: form.category,
        updated_at: new Date().toISOString(),
      };

      // Se gerou nova URL de imagem, adiciona aos dados
      if (publicUrl) {
        productData.image_url = publicUrl;
      }

      if (editingId) {
        // --- MODO ATUALIZAÇÃO (UPDATE) ---
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);

        if (error) throw error;
        showFeedback('success', 'Produto atualizado com sucesso!');

      } else {
        // --- MODO CRIAÇÃO (INSERT) ---
        if (!publicUrl) {
          showFeedback('error', 'Para novos produtos, a imagem é obrigatória!');
          setLoading(false);
          return;
        }

        // Gera slug apenas na criação
        const slug = form.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '')
          + "-" + Date.now().toString().slice(-4);
        
        const { error } = await supabase
          .from('products')
          .insert([{ 
            ...productData, 
            slug, 
            image_url: publicUrl,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        showFeedback('success', 'Produto cadastrado com sucesso!');
      }

      // Limpa tudo e atualiza lista
      handleCancelEdit();
      fetchProducts();

    } catch (error: any) {
      console.error(error);
      showFeedback('error', error.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setAcessoPermitido(false);
    setSenha("");
    router.push('/');
  };

  // TELA DE LOGIN
  if (!acessoPermitido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-pink-100">
          <div className="text-4xl mb-4 bg-gradient-to-r from-pink-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-pink-500">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Área Administrativa</h1>
          <p className="text-gray-500 text-sm mb-6">Insira sua senha para acessar</p>
          
          {feedback.message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              feedback.type === 'error' ? 'bg-red-50 text-red-600' : 
              'bg-green-50 text-green-600'
            }`}>
              {feedback.message}
            </div>
          )}
          
          <form onSubmit={verificarSenha}>
            <input
              type="password"
              placeholder="Digite a senha"
              className="w-full border p-3 rounded-lg mb-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-200/50"
            >
              Acessar Painel
            </button>
          </form>
          
          <Link 
            href="/" 
            className="block mt-6 text-gray-400 hover:text-pink-500 transition-colors text-sm"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  // PAINEL COMPLETO COM ABAS
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Feedback Toast */}
      {feedback.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-slideIn ${
          feedback.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? '❌' : '✅'}
            <span className="font-medium">{feedback.message}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white p-4 shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Painel Administrativo</h1>
              <p className="text-xs text-gray-500">Marikota Acessórios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-600">Olá, Administrador</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
                <i className="fa-solid fa-user text-pink-500 text-sm"></i>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-500 flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-sign-out-alt text-xs"></i>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navegação por Abas */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'produtos', label: 'Produtos', icon: 'fa-box' },
              { id: 'pedidos', label: 'Pedidos', icon: 'fa-shopping-cart' },
              { id: 'clientes', label: 'Clientes', icon: 'fa-users' },
              { id: 'relatorios', label: 'Relatórios', icon: 'fa-chart-bar' },
              { id: 'configuracoes', label: 'Configurações', icon: 'fa-cog' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  abaAtiva === tab.id
                    ? 'border-b-2 border-pink-500 text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-500 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                {tab.label}
                {tab.id === 'pedidos' && stats.pedidosPendentes > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pedidosPendentes}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-4">
        {/* Estatísticas Rápidas */}
        {abaAtiva !== 'configuracoes' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-700 font-medium">Produtos</p>
                  <p className="text-2xl font-bold text-pink-900">{stats.totalProdutos}</p>
                </div>
                <div className="text-pink-500">
                  <i className="fa-solid fa-box text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Pedidos</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalPedidos}</p>
                </div>
                <div className="text-blue-500">
                  <i className="fa-solid fa-shopping-cart text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Faturamento</p>
                  <p className="text-lg font-bold text-green-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.faturamentoTotal)}
                  </p>
                </div>
                <div className="text-green-500">
                  <i className="fa-solid fa-money-bill-wave text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Clientes</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalClientes}</p>
                </div>
                <div className="text-purple-500">
                  <i className="fa-solid fa-users text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA PRODUTOS --- */}
        {abaAtiva === 'produtos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Cadastro */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                {editingId ? "✏️ Editar Produto" : "➕ Novo Produto"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome do Produto</label>
                  <input 
                    className="w-full border rounded-lg p-2 text-sm focus:border-pink-500 outline-none" 
                    placeholder="Ex: Tiara Luxo"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço (R$)</label>
                    <input 
                      className="w-full border rounded-lg p-2 text-sm focus:border-pink-500 outline-none" 
                      placeholder="0,00"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                    <select 
                      className="w-full border rounded-lg p-2 text-sm focus:border-pink-500 outline-none"
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                    >
                      <option>Tiaras de Luxo</option>
                      <option>Bico de Pato</option>
                      <option>Faixinhas RN</option>
                      <option>Kits Escolares</option>
                      <option>Promoções</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                  <textarea 
                    className="w-full border rounded-lg p-2 text-sm focus:border-pink-500 outline-none h-24" 
                    placeholder="Detalhes do produto..."
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Imagem</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setForm({...form, image: e.target.files?.[0] || null})}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Salvando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save"></i> {editingId ? "Salvar Alterações" : "Cadastrar"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Produtos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-700">Lista de Produtos</h3>
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-bold">
                    {products.length} itens
                  </span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <i className="fa-solid fa-box-open text-4xl mb-2 opacity-50"></i>
                      <p>Nenhum produto cadastrado.</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <img 
                            src={product.image_url} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{product.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{product.category}</span>
                            <span>•</span>
                            <span className="text-green-600 font-bold text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                            title="Editar"
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.image_url)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                            title="Excluir"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Pedidos (mantenha seu código da aba pedidos aqui) */}
        {abaAtiva === 'pedidos' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Mantenha todo o código da aba pedidos que você já tinha */}
            {/* ... seu código aqui ... */}
          </div>
        )}

        {/* Resto das abas permanecem igual... */}
      </main>

      {/* Modal de Detalhes do Pedido (mantenha igual) */}
      {/* ... seu código aqui ... */}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}