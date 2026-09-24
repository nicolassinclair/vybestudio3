import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, FolderPlus, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CategoryInfo } from '../types';

interface CategoryAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  onSaveCategory: (cat: CategoryInfo) => Promise<void> | void;
  onDeleteCategory: (catId: string) => Promise<void> | void;
}

export const CategoryAdminModal: React.FC<CategoryAdminModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryInfo> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingCategory({
      id: '',
      name: '',
      tagline: '',
      image: 'https://i.postimg.cc/mD4fkBtT/categoria-canecas.png',
      customizable: false,
    });
    setIsCreatingNew(true);
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingCategory({ ...cat });
    setIsCreatingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      alert('O nome da categoria é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const slugId =
        editingCategory.id?.trim() ||
        editingCategory.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const finalCat: CategoryInfo = {
        id: slugId,
        name: editingCategory.name.trim(),
        tagline: editingCategory.tagline?.trim() || '',
        image: editingCategory.image?.trim() || 'https://i.postimg.cc/mD4fkBtT/categoria-canecas.png',
        customizable: Boolean(editingCategory.customizable),
        productCount: editingCategory.productCount || 0,
      };

      await onSaveCategory(finalCat);
      setEditingCategory(null);
      setIsCreatingNew(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover a categoria "${name}"? Os produtos vinculados a ela não serão excluídos, mas precisarão ser reclassificados.`)) {
      await onDeleteCategory(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Gerenciar Categorias de Produtos
              </h3>
              <p className="text-[11px] text-stone-500">
                Organize as seções da loja e navegação do catálogo da VYBE Studio.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {!editingCategory && (
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Categorias Cadastradas ({categories.length})
              </span>
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Categoria</span>
              </button>
            </div>
          )}

          {/* Form de edição/criação */}
          {editingCategory && (
            <form onSubmit={handleSave} className="p-4 sm:p-5 bg-stone-50 rounded-xl border border-stone-300 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-900">
                  {isCreatingNew ? 'Cadastrar Nova Categoria' : `Editar Categoria: ${editingCategory.name}`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="text-stone-400 hover:text-stone-700 text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="Ex: Canecas, Camisas, Brindes"
                    className="w-full h-10 px-3 bg-white border border-stone-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Identificador (Slug)
                  </label>
                  <input
                    type="text"
                    value={editingCategory.id || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, id: e.target.value })}
                    placeholder="Ex: canecas (gerado automático se vazio)"
                    className="w-full h-10 px-3 bg-white border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1 text-xs">
                  Slogan / Subtítulo da Categoria
                </label>
                <input
                  type="text"
                  value={editingCategory.tagline || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, tagline: e.target.value })}
                  placeholder="Ex: Cerâmica premium com impressão fotográfica de alta durabilidade"
                  className="w-full h-10 px-3 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1 text-xs">
                  URL da Imagem de Capa (Ícone circular na Home)
                </label>
                <input
                  type="url"
                  value={editingCategory.image || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Categorias */}
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
            {categories.map(cat => (
              <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      <span className="font-mono text-[10px] text-stone-400 font-normal">({cat.id})</span>
                    </h4>
                    {cat.tagline && <p className="text-[11px] text-stone-500 line-clamp-1">{cat.tagline}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg cursor-pointer"
                    title="Editar Categoria"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
