import { create } from 'zustand';
import { Tag } from '../types';
import * as TagQueries from '../db/queries/tags';

interface TagStore {
  tags: Tag[];
  loadTags: () => void;
  createTag: (name: string, color: string) => Tag;
  deleteTag: (id: string) => void;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  loadTags: () => set({ tags: TagQueries.getAllTags() }),
  createTag: (name, color) => {
    const tag = TagQueries.createTag(name, color);
    get().loadTags();
    return tag;
  },
  deleteTag: (id) => {
    TagQueries.deleteTag(id);
    get().loadTags();
  },
}));
