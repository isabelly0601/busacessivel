'use client';

import React, { useState, useEffect } from 'react';

export default function EmpresaDashboard() {
  const [linhas, setLinhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState(''); // Simulação do token p/ teste local

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    metropolitana: false
  });

  const fetchLinhas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/empresa/linhas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setLinhas(data);
    } catch (e) {
      console.error('Erro ao buscar linhas', e);
    }
  };

  useEffect(() => {
    fetchLinhas();
  }, []);

  const handleAddLinha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/empresa/linhas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Linha cadastrada!');
        setFormData({ codigo: '', nome: '', metropolitana: false });
        fetchLinhas();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel Corporativo</h1>
            <p className="text-slate-500 font-medium">Gerencie suas linhas de ônibus e integre dados de BH.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                const res = await fetch('http://localhost:3001/api/transit/sync');
                const data = await res.json();
                alert(data.message);
              }}
              className="bg-white border-2 border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              🔄 Sincronizar BHTrans
            </button>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Status do Sistema</span>
              <span className="text-green-500 font-bold flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Conectado
              </span>
            </div>
          </div>
        </header>

        <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 mb-12">
          <h2 className="text-xl font-black text-slate-800 mb-6">Cadastrar Nova Linha</h2>
          <form onSubmit={handleAddLinha} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Código da Linha</label>
              <input 
                value={formData.codigo}
                onChange={e => setFormData({...formData, codigo: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: 61, 5106"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Nome/Itinerário</label>
              <input 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Venda Nova / Centro"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'ADICIONAR LINHA'}
            </button>
          </form>
        </section>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800">Suas Linhas Ativas</h2>
          {linhas.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-lg">Nenhuma linha cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {linhas.map(linha => (
                <div key={linha.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all">
                  <div>
                    <span className="bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-full mb-2 inline-block">
                      #{linha.codigo}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">{linha.nome}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block mb-1">Status</span>
                    <span className="text-green-600 font-black text-sm">ATIVA</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
