'use client';

import React, { useState } from 'react';

export default function RegisterPage() {
  const [role, setRole] = useState<'PASSAGEIRO' | 'EMPRESA'>('PASSAGEIRO');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    cnpj: '',
    razaoSocial: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Cadastro realizado com sucesso!');
      } else {
        setMessage(`Erro: ${data.error || 'Falha no cadastro'}`);
      }
    } catch (error) {
      setMessage('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-neutral-100">
        <h1 className="text-3xl font-black text-blue-900 mb-2">Cadastro BusAcessível</h1>
        <p className="text-neutral-500 mb-8">Escolha seu perfil e preencha os dados abaixo.</p>

        <div className="flex bg-neutral-100 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setRole('PASSAGEIRO')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${role === 'PASSAGEIRO' ? 'bg-white text-blue-800 shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            Passageiro
          </button>
          <button 
            onClick={() => setRole('EMPRESA')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${role === 'EMPRESA' ? 'bg-white text-blue-800 shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            Empresa
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-700">Nome Completo</label>
            <input 
              name="nome" 
              required 
              onChange={handleChange}
              className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
              placeholder="Digite seu nome"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-neutral-700">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                onChange={handleChange}
                className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                placeholder="ex@email.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-neutral-700">Telefone</label>
              <input 
                name="telefone" 
                required 
                onChange={handleChange}
                className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-700">Senha</label>
            <input 
              name="password" 
              type="password" 
              required 
              onChange={handleChange}
              className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
              placeholder="Crie uma senha forte"
            />
          </div>

          {role === 'EMPRESA' && (
            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-neutral-700">CNPJ</label>
                <input 
                  name="cnpj" 
                  required 
                  onChange={handleChange}
                  className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-neutral-700">Razão Social</label>
                <input 
                  name="razaoSocial" 
                  required 
                  onChange={handleChange}
                  className="w-full p-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                  placeholder="Nome oficial da empresa"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'FINALIZAR CADASTRO'}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold ${message.startsWith('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
